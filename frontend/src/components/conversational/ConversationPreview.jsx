import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const speakerColorMap = [
  { bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-500' },
  { bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-500' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', dot: 'bg-indigo-500' },
];

export default function ConversationPreview({ segments, speakers }) {
  const speakerIndex = {};
  speakers.forEach((s, i) => { speakerIndex[s.label] = i; });

  if (!segments || segments.length === 0) return null;

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
      {segments.map((seg, i) => {
        const idx = speakerIndex[seg.speaker_label] ?? 0;
        const colors = speakerColorMap[idx % speakerColorMap.length];
        const isLeft = idx % 2 === 0;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, type: 'spring', damping: 20 }}
            className={cn('flex', isLeft ? 'justify-start' : 'justify-end')}
          >
            <div className={cn(
              'max-w-[80%] rounded-2xl p-3 border',
              colors.bg, colors.border,
              isLeft ? 'rounded-tl-sm' : 'rounded-tr-sm'
            )}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                <span className="text-xs font-medium text-slate-400">{seg.speaker_label}</span>
                {seg.voice_name && (
                  <span className="text-[10px] text-slate-600">· {seg.voice_name}</span>
                )}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{seg.text}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
