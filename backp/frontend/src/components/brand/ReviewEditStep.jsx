import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Volume2, ChevronDown, ChevronUp, Edit3, Save, FileText, Mic, Headphones, AlignLeft, MousePointerClick, ScrollText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ── Shared collapsible shell ────────────────────────────────────────────────
function Card({ title, icon: Icon, iconBg, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stat pill (Website Type / Emotion / Tone) ────────────────────────────────
function StatPill({ label, value }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl bg-slate-800/70 border border-slate-700/50 px-4 py-3">
      <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-white truncate">{value || '—'}</p>
    </div>
  );
}

// ── Shared label row (above box) ─────────────────────────────────────────────
function FieldLabel({ label, icon: Icon, iconColor = 'text-slate-400' }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor}`} />}
      <span className="text-[11px] text-slate-400 font-medium">{label}</span>
    </div>
  );
}

// ── Inline editable text block ───────────────────────────────────────────────
function EditableText({ label, icon, iconColor, value, rows = 4, onChange, onSave, onCancel }) {
  const [editing, setEditing] = useState(false);

  const handleSave = () => { onSave?.(); setEditing(false); };
  const handleCancel = () => { onCancel?.(); setEditing(false); };

  return (
    <div>
      <FieldLabel label={label} icon={icon} iconColor={iconColor} />
      {!editing ? (
        <div className="relative rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="absolute top-2.5 right-3 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pr-6">{value || '—'}</p>
        </div>
      ) : (
        <div>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={rows}
            autoFocus
            className="bg-slate-800/60 border-violet-500/60 focus:border-violet-400 text-white text-sm resize-none w-full"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button type="button" onClick={handleCancel}
              className="text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Read-only bordered box ────────────────────────────────────────────────────
function InfoBox({ label, icon, iconColor, text }) {
  if (!text) return null;
  return (
    <div className="mb-3">
      <FieldLabel label={label} icon={icon} iconColor={iconColor} />
      <div className="relative rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ReviewEditStep({ brandData, onUpdate, onGenerateVoiceover, isGenerating }) {
  const [localData, setLocalData] = useState(brandData);

  const profile   = localData?.brand_voice_profile || {};
  const sections  = profile.vsl_sections || {};

  const patchProfile = (key, value) => {
    const updated = { ...localData, brand_voice_profile: { ...profile, [key]: value } };
    setLocalData(updated);
    onUpdate({ brand_voice_profile: updated.brand_voice_profile });
  };

  const patchRoot = (key, value) => {
    setLocalData(d => ({ ...d, [key]: value }));
    onUpdate({ [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Page header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Your Brand Package</h2>
        <p className="text-slate-400 text-sm mt-0.5">Review and edit before generating your voiceover</p>
      </div>

      {/* ── Card 1: Brand Analysis ─────────────────────────────────────────── */}
      <Card title="Brand Analysis" icon={Globe} iconBg="bg-gradient-to-br from-blue-500 to-cyan-500">
        <div className="flex gap-3 flex-wrap mb-3">
          <StatPill label="Website Type" value={profile.website_type} />
          <StatPill label="Emotion"      value={profile.emotion} />
          <StatPill label="Tone"         value={profile.tone} />
        </div>
        <EditableText
          label="Content Summary"
          icon={Globe} iconColor="text-cyan-400"
          value={profile.content_summary || ''}
          rows={4}
          onChange={v => setLocalData(d => ({ ...d, brand_voice_profile: { ...d.brand_voice_profile, content_summary: v } }))}
          onSave={() => patchProfile('content_summary', profile.content_summary)}
          onCancel={() => setLocalData(d => ({ ...d, brand_voice_profile: { ...d.brand_voice_profile, content_summary: brandData?.brand_voice_profile?.content_summary } }))}
        />
      </Card>

      {/* ── Card 2: Brand Voice Prompt ────────────────────────────────────── */}
      <Card title="Brand Voice Prompt" icon={Mic} iconBg="bg-gradient-to-br from-violet-500 to-purple-600">
        {profile.speaker_style && (
          <InfoBox label="Speaker Style" icon={Mic} iconColor="text-violet-400" text={profile.speaker_style} />
        )}
        <EditableText
          label="Voice Direction"
          icon={Mic} iconColor="text-violet-400"
          value={profile.voice_prompt || ''}
          rows={4}
          onChange={v => setLocalData(d => ({ ...d, brand_voice_profile: { ...d.brand_voice_profile, voice_prompt: v } }))}
          onSave={() => patchProfile('voice_prompt', profile.voice_prompt)}
          onCancel={() => setLocalData(d => ({ ...d, brand_voice_profile: { ...d.brand_voice_profile, voice_prompt: brandData?.brand_voice_profile?.voice_prompt } }))}
        />
      </Card>

      {/* ── Card 3: VSL Script ────────────────────────────────────────────── */}
      <Card title="VSL Script" icon={FileText} iconBg="bg-gradient-to-br from-pink-500 to-rose-600">
        {(sections.hook || sections.body || sections.cta) && (
          <>
            <InfoBox label="Hook"           icon={Headphones}        iconColor="text-amber-400"   text={sections.hook} />
            <InfoBox label="Body"           icon={AlignLeft}         iconColor="text-blue-400"    text={sections.body} />
            <InfoBox label="Call to Action" icon={MousePointerClick} iconColor="text-emerald-400" text={sections.cta} />
          </>
        )}
        <EditableText
          label="Full Script"
          icon={ScrollText} iconColor="text-pink-400"
          value={localData?.vsl_script || ''}
          rows={14}
          onChange={v => setLocalData(d => ({ ...d, vsl_script: v }))}
          onSave={() => patchRoot('vsl_script', localData.vsl_script)}
          onCancel={() => setLocalData(d => ({ ...d, vsl_script: brandData?.vsl_script }))}
        />
      </Card>

      {/* Generate Button */}
      <motion.button
        onClick={onGenerateVoiceover}
        disabled={isGenerating}
        whileHover={!isGenerating ? { scale: 1.01 } : {}}
        whileTap={!isGenerating ? { scale: 0.99 } : {}}
        className="w-full relative overflow-hidden rounded-xl px-6 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative flex items-center justify-center gap-2 text-base">
          <Volume2 className="w-5 h-5" />
          Generate Brand Voiceover
        </span>
      </motion.button>
    </motion.div>
  );
}
