import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import {
  Mic, Globe, ExternalLink, Edit3, Save, X,
  ChevronLeft, CheckCircle, Clock, AlertCircle, FileText,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import RenderingOverlay from '@/components/brand/RenderingOverlay';
import ScriptsList from '@/components/brand/edit/ScriptsList';
import { cn } from '@/lib/utils';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed:  { label: 'Completed',  icon: CheckCircle,  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    pending:    { label: 'Processing', icon: Clock,        cls: 'bg-amber-500/15   text-amber-400   border-amber-500/30'   },
    processing: { label: 'Processing', icon: Clock,        cls: 'bg-amber-500/15   text-amber-400   border-amber-500/30'   },
    failed:     { label: 'Failed',     icon: AlertCircle,  cls: 'bg-red-500/15     text-red-400     border-red-500/30'     },
    draft:      { label: 'Draft',      icon: FileText,     cls: 'bg-slate-500/15   text-slate-400   border-slate-500/30'   },
  };
  const { label, icon: Icon, cls } = map[status] || map.draft;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', cls)}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

// ── Tag chip ─────────────────────────────────────────────────────────────────
function TagChip({ label }) {
  if (!label) return null;
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700/60 text-slate-300">
      {label}
    </span>
  );
}

// ── Labeled text box (read-only) ─────────────────────────────────────────────
function ViewBox({ label, text }) {
  if (!text) return null;
  return (
    <div className="mb-3">
      <p className="text-[11px] text-slate-500 font-medium mb-1.5">{label}</p>
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BrandStudioEdit() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const projectId   = new URLSearchParams(window.location.search).get('id');

  const [editingVoice,   setEditingVoice]   = useState(false);
  const [voiceDraft,     setVoiceDraft]     = useState(null);
  const [renderingIndex, setRenderingIndex] = useState(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['brandProject', projectId],
    queryFn: async () => {
      const all = await base44.entities.BrandStudioProject.filter({ id: projectId });
      return all[0] || null;
    },
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.BrandStudioProject.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brandProject', projectId]);
      queryClient.invalidateQueries(['brandProjects']);
    },
  });

  const renderMutation = useMutation({
    mutationFn: () => base44.entities.BrandStudioProject.update(projectId, { status: 'pending' }),
    onSuccess: async () => {
      await sleep(4200);
      toast.success('Brand project queued for voiceover generation!');
      navigate(createPageUrl('BrandStudioList'));
    },
  });

  if (!projectId) return <div className="text-center text-slate-400 py-20">No project selected.</div>;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 pt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!project) return <div className="text-center text-slate-400 py-20">Project not found.</div>;

  const profile = project.brand_voice_profile || {};

  const saveVoice = () => {
    updateMutation.mutate(
      { brand_voice_profile: { ...profile, ...voiceDraft }, voice_prompt: voiceDraft.voice_prompt ?? profile.voice_prompt },
      { onSuccess: () => { toast.success('Brand voice saved'); setEditingVoice(false); } }
    );
  };

  const handleRenderScript = (index) => {
    setRenderingIndex(index);

    if (index === 'main') {
      // Main script: update project-level status (ScriptsList derives mainScript.status from project.status)
      renderMutation.mutate(undefined, {
        onSettled: () => setRenderingIndex(null),
      });
    } else {
      // Additional script: update that specific script's status inside the JSON array
      const additionalScripts = Array.isArray(project.additional_scripts) ? project.additional_scripts : [];
      const updated = additionalScripts.map((s, i) =>
        i === index ? { ...s, status: 'pending' } : s
      );
      updateMutation.mutate(
        { additional_scripts: updated, status: 'pending' },
        {
          onSuccess: async () => {
            toast.success('Script queued for voiceover generation!');
          },
          onSettled: () => setRenderingIndex(null),
        }
      );
    }
  };

  return (
    <>
      <AnimatePresence>
        {renderMutation.isPending && <RenderingOverlay key="render" />}
      </AnimatePresence>


      <div className="max-w-6xl mx-auto pb-16 space-y-5">

        {/* ── Back nav ───────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => navigate(createPageUrl('BrandStudioList'))}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mt-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Brand Studio
        </button>

        {/* ── Project header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-slate-900/80 border border-slate-700/50 px-6 py-5"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{project.title || 'Untitled Brand'}</h1>
                {project.website_url && (
                  <a
                    href={project.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors mt-0.5 truncate"
                  >
                    {project.website_url} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Tag chips */}
          {(profile.website_type || profile.tone || profile.emotion) && (
            <div className="flex flex-wrap gap-2 mt-4">
              <TagChip label={profile.website_type} />
              <TagChip label={profile.tone} />
              <TagChip label={profile.emotion} />
            </div>
          )}
        </motion.div>

        {/* ── Brand Voice card ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-slate-900/80 border border-slate-700/50 overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Brand Voice</span>
            </div>
            {!editingVoice ? (
              <button
                type="button"
                onClick={() => { setVoiceDraft({ speaker_style: profile.speaker_style, voice_prompt: profile.voice_prompt, content_summary: profile.content_summary }); setEditingVoice(true); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setEditingVoice(false)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button type="button" onClick={saveVoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="px-5 py-4 space-y-3">
            {editingVoice ? (
              <>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">Speaker Style</p>
                  <Input
                    value={voiceDraft?.speaker_style || ''}
                    onChange={e => setVoiceDraft(d => ({ ...d, speaker_style: e.target.value }))}
                    className="bg-slate-800/60 border-slate-700 text-white text-sm h-9"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">Voice Prompt</p>
                  <Textarea
                    value={voiceDraft?.voice_prompt || ''}
                    onChange={e => setVoiceDraft(d => ({ ...d, voice_prompt: e.target.value }))}
                    rows={5}
                    className="bg-slate-800/60 border-violet-500/50 text-white text-sm resize-none"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">Brand Summary</p>
                  <Textarea
                    value={voiceDraft?.content_summary || ''}
                    onChange={e => setVoiceDraft(d => ({ ...d, content_summary: e.target.value }))}
                    rows={4}
                    className="bg-slate-800/60 border-slate-700 text-white text-sm resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <ViewBox label="Speaker Style" text={profile.speaker_style} />
                <ViewBox label="Voice Prompt"  text={profile.voice_prompt || project.voice_prompt} />
                <ViewBox label="Brand Summary" text={profile.content_summary} />
              </>
            )}
          </div>
        </motion.div>

        {/* ── Scripts section ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-5"
        >
          <ScriptsList
            project={project}
            onSave={(data) => updateMutation.mutate(data)}
            isSaving={updateMutation.isPending}
            onRenderScript={handleRenderScript}
            renderingIndex={renderingIndex}
          />
        </motion.div>

      </div>
    </>
  );
}
