import { motion } from 'framer-motion';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const PRESETS = [
  { label: 'Soft',      val: 15, emoji: '🎵' },
  { label: 'Balanced',  val: 35, emoji: '🎼' },
  { label: 'Prominent', val: 60, emoji: '🎶' },
];

export default function MusicVolumeSlider({ value = 30, onChange }) {
  const VolumeIcon = value === 0 ? VolumeX : value < 50 ? Volume1 : Volume2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          value === 0
            ? 'bg-slate-700'
            : 'bg-gradient-to-br from-violet-500/30 to-purple-500/30',
        )}>
          <VolumeIcon className={cn('w-4 h-4', value === 0 ? 'text-slate-400' : 'text-violet-400')} />
        </div>
        <span className="text-sm font-medium text-slate-300">Music Volume</span>
        <span className="ml-auto text-sm font-mono tabular-nums text-slate-400">{value}%</span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />

      {/* Preset buttons */}
      <div className="flex gap-2 mt-4">
        {PRESETS.map(preset => (
          <motion.button
            key={preset.val}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(preset.val)}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5',
              value === preset.val
                ? 'bg-violet-500/25 text-violet-300 border border-violet-500/40'
                : 'bg-slate-800/60 text-slate-500 border border-slate-700/40 hover:text-slate-300 hover:border-slate-600',
            )}
          >
            <span>{preset.emoji}</span> {preset.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
