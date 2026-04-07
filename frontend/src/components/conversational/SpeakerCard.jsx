import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mic, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VoiceSelectionSection from '@/components/voice/VoiceSelectionSection';
import { cn } from '@/lib/utils';

const speakerColors = [
  { bg: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  { bg: 'from-blue-500 to-cyan-600', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { bg: 'from-emerald-500 to-green-600', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  { bg: 'from-amber-500 to-orange-600', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  { bg: 'from-rose-500 to-pink-600', border: 'border-rose-500/30', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  { bg: 'from-indigo-500 to-blue-600', border: 'border-indigo-500/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
];

export default function SpeakerCard({ speaker, index, segments, onVoiceSelect, onLabelChange, onRemove, canRemove }) {
  const [expanded, setExpanded] = useState(false);
  const colorSet = speakerColors[index % speakerColors.length];
  const speakerSegments = segments.filter(s => s.speaker_label === speaker.label);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300',
        colorSet.border,
        expanded ? `bg-slate-900/80 shadow-xl ${colorSet.glow}` : 'bg-slate-900/50'
      )}
    >
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0', colorSet.bg)}
        >
          {speaker.label.charAt(speaker.label.length - 1) || (index + 1)}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{speaker.label}</h3>
            {speaker.voice_name && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full bg-slate-800 border', colorSet.border, colorSet.text)}>
                {speaker.voice_name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {speakerSegments.length} line{speakerSegments.length !== 1 ? 's' : ''} in script
            {!speaker.voice_id && ' · No voice assigned'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canRemove && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Speaker Name</label>
                <Input
                  value={speaker.label}
                  onChange={(e) => onLabelChange(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white h-9 text-sm"
                  placeholder="e.g. Host, Guest, Narrator"
                />
              </div>

              {speakerSegments.length > 0 && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Lines in script</label>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {speakerSegments.map((seg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn('text-sm text-slate-300 p-2 rounded-lg bg-slate-800/40 border-l-2', colorSet.border)}
                      >
                        "{seg.text.length > 80 ? seg.text.slice(0, 80) + '...' : seg.text}"
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Choose Voice
                </label>
                <VoiceSelectionSection
                  selectedVoiceId={speaker.voice_id || ''}
                  onSelectVoice={(id, name, type, url) => onVoiceSelect(id, name, type, url)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
