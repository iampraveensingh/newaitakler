import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Play } from 'lucide-react';
import { generateBarHeights } from './AudioWaveformPlayer';

export default function DisabledWaveform({ compact = false, label = 'No audio' }) {
  const barCount  = compact ? 34 : 50;
  const heights   = useMemo(() => generateBarHeights(barCount), [barCount]);
  const isProcessing = label?.toLowerCase().includes('processing');

  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-0.5' : 'py-1'}`}>

      {/* ── Disabled play button ────────────────────────────────────────── */}
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded-full
          bg-slate-800/70 border border-slate-700/40
          ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
      >
        {isProcessing
          ? <Loader2 className={`text-slate-500 animate-spin ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          : <Play    className={`text-slate-600 ml-0.5      ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        }
      </div>

      {/* ── Static / shimmer waveform ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className={`flex items-end gap-[2.5px] w-full ${compact ? 'h-7' : 'h-10'}`}>
          {heights.map((h, i) => (
            <motion.div
              key={i}
              animate={isProcessing
                ? { opacity: [0.12, 0.32, 0.12] }
                : { opacity: 1 }
              }
              transition={isProcessing
                ? { duration: 1.6, repeat: Infinity, delay: i * 0.025, ease: 'easeInOut' }
                : {}
              }
              className="flex-1 rounded-full"
              style={{
                height: `${h}%`,
                background: isProcessing
                  ? 'linear-gradient(to top, rgba(124,58,237,0.25), rgba(219,39,119,0.15))'
                  : 'rgba(100,116,139,0.18)',
              }}
            />
          ))}
        </div>

        {/* Full mode bottom row */}
        {!compact && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-mono w-8">0:00</span>
            <div className="flex-1 h-[3px] bg-slate-700/40 rounded-full">
              {isProcessing && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
                />
              )}
            </div>
            <span className="text-[10px] text-slate-600 font-mono w-8 text-right">0:00</span>
          </div>
        )}
      </div>

      {/* Label */}
      <span className={`flex-shrink-0 whitespace-nowrap font-medium
        ${isProcessing ? 'text-violet-400/70' : 'text-slate-600'}
        ${compact ? 'text-[10px]' : 'text-xs'}`}
      >
        {label}
      </span>
    </div>
  );
}
