import { useState } from 'react';
import {
  Star, MoreVertical, AudioLines,
  Save, X, Download, ExternalLink, CheckCircle2,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function ScriptCard({
  title, script, audioUrl, status,
  isMain, onUpdate, onRender, onDelete, isSaving, isRendering,
}) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [editValue, setEditValue] = useState(script);

  const isRendered   = status === 'rendered' || status === 'completed';
  const isProcessing = isRendering || status === 'pending' || status === 'processing';

  const handleSave   = () => { onUpdate?.(editValue); setEditing(false); };
  const handleCancel = () => { setEditValue(script);  setEditing(false); };

  const handleDownload = async () => {
    if (!audioUrl) return;
    const filename = `${title || 'voiceover'}.mp3`;
    try {
      const res  = await fetch(audioUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // CORS blocked — fall back to opening with download hint
      const a    = document.createElement('a');
      a.href     = audioUrl;
      a.download = filename;
      a.target   = '_blank';
      a.rel      = 'noopener';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isMain && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
            <span className="text-white font-semibold text-sm truncate">{title || 'Untitled Script'}</span>
          </div>
          <div className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            isRendered   ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            isProcessing ? 'bg-amber-500/15   text-amber-400   border-amber-500/30'   :
                           'bg-slate-500/15   text-slate-400   border-slate-500/30',
          )}>
            {isRendered ? 'Completed' : isProcessing ? 'Processing' : 'Draft'}
          </div>
        </div>

        {/* Only additional scripts get the ⋮ menu */}
        {!isMain && (
          <div className="relative ml-2 shrink-0">
            <button type="button" onClick={() => setMenuOpen(o => !o)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-32 rounded-xl bg-slate-800 border border-slate-700/60 shadow-xl overflow-hidden">
                {onDelete && (
                  <button type="button" onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700/60 transition-colors">
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Script content / edit ── */}
      <div className="px-4 pb-3 flex-1">
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              rows={6}
              autoFocus
              className="bg-slate-800/60 border-violet-500/60 focus:border-violet-400 text-white text-xs resize-none w-full"
            />
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50">
                <Save className="w-3 h-3" /> Save
              </button>
              <button type="button" onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition-colors">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 min-h-[48px]">
            {script || 'No script content.'}
          </p>
        )}
      </div>

      {/* ── Render / processing state ── */}
      {!editing && (
        <div className="px-4 pb-3 space-y-2">
          {/* Render button — additional scripts only */}
          {!isMain && !isRendered && !isProcessing && (
            <button type="button" onClick={() => onRender?.()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              <AudioLines className="w-4 h-4" /> Render Voiceover
            </button>
          )}

          {/* Processing state */}
          {isProcessing && !isRendered && (
            <div className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-400">Generating audio…</span>
            </div>
          )}

          {/* Ready state — just a status badge, no extra download button */}
          {isRendered && audioUrl && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-300">Audio ready</span>
            </div>
          )}
        </div>
      )}

      {/* ── Footer actions ── */}
      {!editing && (
        <div className="grid grid-cols-2 border-t border-slate-700/40 mt-auto">

          {/* Preview — opens audio in new tab */}
          <button
            type="button"
            disabled={!isRendered || !audioUrl}
            onClick={() => audioUrl && window.open(audioUrl, '_blank', 'noopener')}
            className="py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 border-r border-slate-700/40"
          >
            <ExternalLink className="w-3 h-3" /> Preview
          </button>

          {/* Download audio */}
          <button
            type="button"
            disabled={!isRendered || !audioUrl}
            onClick={handleDownload}
            title="Download audio"
            className="py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3 h-3" /> Download
          </button>
        </div>
      )}
    </div>
  );
}
