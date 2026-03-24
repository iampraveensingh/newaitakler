import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Edit3, Volume2, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

function Section({ title, icon: Icon, color = 'violet', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <GlassCard className="overflow-hidden" hover={false}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            color === 'violet' && 'bg-violet-500/20',
            color === 'cyan'   && 'bg-cyan-500/20',
            color === 'pink'   && 'bg-pink-500/20',
          )}>
            <Icon className={cn(
              'w-4 h-4',
              color === 'violet' && 'text-violet-400',
              color === 'cyan'   && 'text-cyan-400',
              color === 'pink'   && 'text-pink-400',
            )} />
          </div>
          <span className="font-semibold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </GlassCard>
  );
}

export default function ReviewEditStep({ brandData, onUpdate, onGenerateVoiceover, isGenerating }) {
  const [editing, setEditing] = useState(false);
  const [localData, setLocalData] = useState(brandData);

  const handleSave = () => {
    onUpdate(localData);
    setEditing(false);
  };

  const handleReset = () => {
    setLocalData(brandData);
    setEditing(false);
  };

  const profile = localData?.brand_voice_profile || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Your Brand Package</h2>
          <p className="text-slate-400 text-sm mt-0.5">Review and edit before generating your voiceover</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="outline" onClick={handleReset}
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}
                className="bg-gradient-to-r from-violet-600 to-purple-600">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* Brand Identity */}
      <Section title="Brand Identity" icon={Sparkles} color="cyan">
        <div className="space-y-3">
          <div>
            <Label className="text-slate-400 text-xs mb-1 block">Brand Name</Label>
            {editing ? (
              <Input
                value={localData?.title || ''}
                onChange={e => setLocalData(d => ({ ...d, title: e.target.value }))}
                className="bg-slate-800/60 border-slate-700 text-white h-9 text-sm"
              />
            ) : (
              <p className="text-white font-medium">{localData?.title || '—'}</p>
            )}
          </div>
          <div>
            <Label className="text-slate-400 text-xs mb-1 block">Website URL</Label>
            <p className="text-slate-400 text-sm truncate">{localData?.website_url || '—'}</p>
          </div>
          {profile.tagline && (
            <div>
              <Label className="text-slate-400 text-xs mb-1 block">Tagline</Label>
              {editing ? (
                <Input
                  value={profile.tagline}
                  onChange={e => setLocalData(d => ({
                    ...d,
                    brand_voice_profile: { ...d.brand_voice_profile, tagline: e.target.value }
                  }))}
                  className="bg-slate-800/60 border-slate-700 text-white h-9 text-sm"
                />
              ) : (
                <p className="text-slate-300 text-sm italic">"{profile.tagline}"</p>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Brand Voice Profile */}
      <Section title="Brand Voice Profile" icon={Edit3} color="violet">
        <div className="space-y-3">
          {['tone', 'style', 'personality', 'target_audience'].map(key => (
            profile[key] && (
              <div key={key}>
                <Label className="text-slate-400 text-xs mb-1 block capitalize">{key.replace('_', ' ')}</Label>
                {editing ? (
                  <Input
                    value={profile[key]}
                    onChange={e => setLocalData(d => ({
                      ...d,
                      brand_voice_profile: { ...d.brand_voice_profile, [key]: e.target.value }
                    }))}
                    className="bg-slate-800/60 border-slate-700 text-white h-9 text-sm"
                  />
                ) : (
                  <p className="text-slate-300 text-sm">{profile[key]}</p>
                )}
              </div>
            )
          ))}
          {profile.key_messages?.length > 0 && (
            <div>
              <Label className="text-slate-400 text-xs mb-1 block">Key Messages</Label>
              <ul className="space-y-1">
                {profile.key_messages.map((msg, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* VSL Script */}
      <Section title="VSL Script" icon={Volume2} color="pink">
        {editing ? (
          <Textarea
            value={localData?.vsl_script || ''}
            onChange={e => setLocalData(d => ({ ...d, vsl_script: e.target.value }))}
            rows={12}
            className="bg-slate-800/60 border-slate-700 text-white text-sm resize-none"
          />
        ) : (
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {localData?.vsl_script || 'No script generated.'}
          </p>
        )}
      </Section>

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
