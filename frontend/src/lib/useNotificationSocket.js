import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const WS_BASE = (() => {
  // Explicit env override takes highest priority
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;

  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

  // If a custom API base URL is set (e.g. http://localhost:5000/api), extract its host
  if (import.meta.env.VITE_API_BASE_URL) {
    const host = new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin).host;
    return protocol + host;
  }

  // In production (no VITE_API_BASE_URL), the proxy handles /api — use same host/port as the page
  // so WebSocket goes through nginx on port 443, not directly to :5000
  return protocol + window.location.host;
})();

/**
 * Opens a WebSocket connection to /ws and listens for real-time notifications.
 * When a 'notification' event arrives, it injects the new item directly into
 * the React Query cache so the NotificationCenter updates instantly.
 */
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const wsRef       = useRef(null);
  const retryTimer  = useRef(null);

  useEffect(() => {
    let destroyed = false;

    function connect() {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const url = `${WS_BASE}/ws?token=${encodeURIComponent(token)}`;
      const ws  = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const { event: evtType, data } = JSON.parse(event.data);
          if (evtType !== 'notification') return;

          // Prepend the new notification into the cached query data
          queryClient.setQueryData(['notifications'], (old) => {
            if (!old) return { notifications: [data], unreadCount: 1 };
            return {
              notifications: [data, ...old.notifications],
              unreadCount: (old.unreadCount ?? 0) + 1,
            };
          });
        } catch { /* ignore malformed frames */ }
      };

      ws.onclose = (evt) => {
        if (destroyed) return;
        // Reconnect after 5 s unless it was an auth failure (4001)
        if (evt.code !== 4001) {
          retryTimer.current = setTimeout(connect, 5_000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, [queryClient]);
}
