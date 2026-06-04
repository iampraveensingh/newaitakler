import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, ScrollText, Copy, RefreshCw, Trash2, CheckCircle2,
  XCircle, Shield, Eye, EyeOff, Terminal, Clock, Wifi,
  AlertTriangle, Code2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiKeyApi } from '@/api/base44Client';
import GlassCard from '@/components/ui/GlassCard';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'key',  label: 'API Key',  icon: Key        },
  { id: 'logs', label: 'API Logs', icon: ScrollText  },
];

// ─── Status badge for log table ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const ok = status === 'success';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
      ok
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-red-500/10    text-red-400    border-red-500/30',
    )}>
      {ok
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle      className="w-3 h-3" />
      }
      {ok ? 'Success' : 'Failed'}
    </span>
  );
}

// ─── Format timestamp ─────────────────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── API Key Tab ──────────────────────────────────────────────────────────────
function ApiKeyTab({ baseUrl }) {
  const queryClient = useQueryClient();
  const [revealed,  setRevealed]  = useState(false);
  const [copied,    setCopied]    = useState(false);

  const { data: keyData, isLoading } = useQuery({
    queryKey: ['apiKey'],
    queryFn:  () => apiKeyApi.get(),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiKeyApi.generate(),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['apiKey'] });
      setRevealed(true);
      toast.success('New API key generated!');
    },
    onError: () => toast.error('Failed to generate API key'),
  });

  const revokeMutation = useMutation({
    mutationFn: () => apiKeyApi.revoke(),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['apiKey'] });
      setRevealed(false);
      toast.success('API key revoked');
    },
    onError: () => toast.error('Failed to revoke API key'),
  });

  const handleCopy = () => {
    if (!keyData?.api_key) return;
    navigator.clipboard.writeText(keyData.api_key);
    setCopied(true);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const hasKey      = !!keyData?.api_key;
  const displayKey  = hasKey
    ? (revealed ? keyData.api_key : `atk_${'•'.repeat(40)}`)
    : null;

  return (
    <div className="space-y-6">

      {/* ── Key card ── */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Your API Key</h3>
            <p className="text-xs text-slate-400">Use this key to authenticate calls to the Voice API</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-12 rounded-xl bg-slate-800/50 animate-pulse" />
        ) : hasKey ? (
          <>
            {/* Key display row */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-4">
              <code className="flex-1 text-sm font-mono text-violet-300 truncate select-all">
                {displayKey}
              </code>
              <button
                type="button"
                onClick={() => setRevealed(v => !v)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                title={revealed ? 'Hide key' : 'Reveal key'}
              >
                {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                title="Copy key"
              >
                {copied
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <Copy className="w-4 h-4" />
                }
              </button>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Created: {fmtDate(keyData.created_at)}
              </span>
              {keyData.last_used_at && (
                <span className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Last used: {fmtDate(keyData.last_used_at)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-500 gap-2"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', generateMutation.isPending && 'animate-spin')} />
                Regenerate Key
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => revokeMutation.mutate()}
                disabled={revokeMutation.isPending}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Revoke Key
              </Button>
            </div>
          </>
        ) : (
          /* No key yet */
          <div className="text-center py-6">
            <Key className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">You don't have an API key yet.</p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
            >
              <Key className="w-4 h-4" />
              {generateMutation.isPending ? 'Generating…' : 'Generate API Key'}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* ── Security notice ── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          Keep your API key secret. Do not commit it to version control or share it publicly.
          If compromised, revoke it immediately and generate a new one.
        </p>
      </div>

      {/* ── Usage docs ── */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">How to Use</h3>
            <p className="text-xs text-slate-400">Fetch your voices from any external app</p>
          </div>
        </div>

        <div className="space-y-6 text-sm">

          {/* ── Endpoint 1: Fetch Voices ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">POST</span>
              <code className="text-slate-300 font-mono text-xs">{baseUrl}/api/v1/voices</code>
              <span className="text-xs text-slate-500">— list your cloned &amp; custom voices</span>
            </div>
            <pre className="rounded-xl bg-slate-900 border border-slate-700/60 p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`curl -X POST ${baseUrl}/api/v1/voices \\
  -H "X-API-Key: YOUR_API_KEY"`}
            </pre>
            <pre className="rounded-xl bg-slate-900 border border-slate-700/60 p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "count": 2,
  "voices": [
    { "voice_id": "1", "voice_name": "My Clone", "voice_url": "https://...", "voice_type": "cloned" },
    { "voice_id": "2", "voice_name": "Custom AI", "voice_url": "https://...", "voice_type": "custom" }
  ]
}`}
            </pre>
          </div>

          <div className="border-t border-slate-700/40" />

          {/* ── Endpoint 2: Generate Voice ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-xs font-bold border border-violet-500/30">POST</span>
              <code className="text-slate-300 font-mono text-xs">{baseUrl}/api/v1/generate</code>
              <span className="text-xs text-slate-500">— generate a voiceover</span>
            </div>
            <pre className="rounded-xl bg-slate-900 border border-slate-700/60 p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`curl -X POST ${baseUrl}/api/v1/generate \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "voice_url": "https://...voice_audio.mp3",
    "tts_text": "Your script goes here...",
    "emotion": "calm"
  }'`}
            </pre>

            {/* Body params table */}
            <div className="rounded-xl border border-slate-700/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400">
                    <th className="text-left px-4 py-2 font-medium">Field</th>
                    <th className="text-left px-4 py-2 font-medium">Required</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['voice_url', 'Yes', 'audio_url from /api/v1/voices'],
                    ['tts_text',  'Yes', 'Script text to convert to speech'],
                    ['emotion',   'No',  'neutral | happy | sad | excited | calm | serious (default: neutral)'],
                  ].map(([field, req, desc]) => (
                    <tr key={field} className="border-t border-slate-700/40">
                      <td className="px-4 py-2 font-mono text-violet-300">{field}</td>
                      <td className="px-4 py-2">
                        <span className={req === 'Yes'
                          ? 'text-emerald-400 font-semibold'
                          : 'text-slate-500'}>
                          {req}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <pre className="rounded-xl bg-slate-900 border border-slate-700/60 p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "audio_url": "https://.../uploads/api_voice_1234.mp3",
  "filename": "api_voice_1234.mp3"
}`}
            </pre>
          </div>

          {/* ── Headers ── */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Required Headers (both endpoints)</p>
            <div className="rounded-xl border border-slate-700/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400">
                    <th className="text-left px-4 py-2 font-medium">Header</th>
                    <th className="text-left px-4 py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-700/40">
                    <td className="px-4 py-2 font-mono text-violet-300">X-API-Key</td>
                    <td className="px-4 py-2 text-slate-400">Your API key</td>
                  </tr>
                  <tr className="border-t border-slate-700/40">
                    <td className="px-4 py-2 font-mono text-violet-300">Content-Type</td>
                    <td className="px-4 py-2 text-slate-400">application/json (generate only)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const PAGE_SIZE = 10;

// ─── API Logs Tab ─────────────────────────────────────────────────────────────
function ApiLogsTab() {
  const [page, setPage] = useState(1);

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['apiLogs'],
    queryFn:  () => apiKeyApi.getLogs(500),
    refetchInterval: 30_000,
  });

  const successCount = logs.filter(l => l.status === 'success').length;
  const failCount    = logs.filter(l => l.status === 'failed').length;

  const totalPages  = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = logs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when new data arrives
  const prevLen = logs.length;

  return (
    <div className="space-y-5">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Calls', value: logs.length,  color: 'text-white'       },
          { label: 'Successful',  value: successCount, color: 'text-emerald-400' },
          { label: 'Failed',      value: failCount,    color: 'text-red-400'     },
        ].map(({ label, value, color }) => (
          <GlassCard key={label} className="p-4 text-center" hover={false}>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* ── Log table ── */}
      <GlassCard className="p-0 overflow-hidden" hover={false}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <ScrollText className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">Request Logs</span>
            {logs.length > 0 && (
              <span className="text-xs text-slate-500">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, logs.length)} of {logs.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Terminal className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No API calls yet.</p>
            <p className="text-slate-600 text-xs mt-1">Calls to POST /api/v1/voices will appear here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/40">
                    <th className="text-left px-5 py-3 font-semibold">#</th>
                    <th className="text-left px-5 py-3 font-semibold">Endpoint</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">Code</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">IP Address</th>
                    <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Summary</th>
                    <th className="text-left px-5 py-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, i) => {
                    const rowNum = (safePage - 1) * PAGE_SIZE + i + 1;
                    return (
                      <tr
                        key={log.id}
                        className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Row number */}
                        <td className="px-5 py-3">
                          <span className="text-xs text-slate-600 font-mono">{rowNum}</span>
                        </td>

                        {/* Endpoint */}
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 text-xs font-mono shrink-0">
                              {log.method}
                            </span>
                            <code className="text-xs text-slate-300 font-mono truncate max-w-[160px]">
                              {log.endpoint}
                            </code>
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-3">
                          <StatusBadge status={log.status} />
                        </td>

                        {/* HTTP code */}
                        <td className="px-5 py-3">
                          <span className={cn(
                            'text-xs font-mono font-bold',
                            log.status_code < 300 ? 'text-emerald-400' :
                            log.status_code < 500 ? 'text-amber-400'   : 'text-red-400',
                          )}>
                            {log.status_code}
                          </span>
                        </td>

                        {/* IP */}
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-xs text-slate-500 font-mono">{log.ip_address || '—'}</span>
                        </td>

                        {/* Summary */}
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <span className="text-xs text-slate-400">{log.response_summary || '—'}</span>
                        </td>

                        {/* Timestamp */}
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="text-xs text-slate-500">{fmtDate(log.created_at)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination bar ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/40 bg-slate-800/20">
                <span className="text-xs text-slate-500">
                  Page {safePage} of {totalPages}
                </span>

                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                    .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, idx) =>
                      n === '…' ? (
                        <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-600">…</span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={cn(
                            'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                            n === safePage
                              ? 'bg-violet-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700/60',
                          )}
                        >
                          {n}
                        </button>
                      )
                    )
                  }

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ApiPage() {
  const [activeTab, setActiveTab] = useState('key');

  // Derive the base URL for the API docs section
  const baseUrl = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : window.location.origin;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="API Access"
        description="Manage your API key and monitor usage"
        icon={Code2}
        gradient="from-cyan-500 to-blue-500"
      />

      {/* ── Tab bar ── */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === id
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{ opacity: 0, y: -6   }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'key'  && <ApiKeyTab baseUrl={baseUrl} />}
          {activeTab === 'logs' && <ApiLogsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
