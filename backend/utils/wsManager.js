/**
 * WebSocket Connection Manager
 * Maintains a registry of userId → Set<WebSocket> so we can broadcast
 * real-time events to any authenticated user regardless of how many tabs they have open.
 */

/** @type {Map<number, Set<import('ws').WebSocket>>} */
const connections = new Map();

/**
 * Register a new WS connection for a user.
 * @param {number} userId
 * @param {import('ws').WebSocket} ws
 */
export function registerConnection(userId, ws) {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(ws);
}

/**
 * Remove a WS connection (call on 'close' / 'error').
 * @param {number} userId
 * @param {import('ws').WebSocket} ws
 */
export function removeConnection(userId, ws) {
  const set = connections.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) connections.delete(userId);
}

/**
 * Send a JSON message to all open sockets for a user.
 * Silently ignores closed sockets.
 * @param {number} userId
 * @param {object} payload
 */
export function broadcastToUser(userId, payload) {
  const set = connections.get(userId);
  if (!set || set.size === 0) return;
  const message = JSON.stringify(payload);
  for (const ws of set) {
    try {
      if (ws.readyState === 1 /* OPEN */) {
        ws.send(message);
      }
    } catch (err) {
      console.warn('WS send error:', err.message);
    }
  }
}
