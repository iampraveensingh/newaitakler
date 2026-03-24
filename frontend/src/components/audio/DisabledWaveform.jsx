import React from 'react';

export default function DisabledWaveform({ compact = false, label = 'No audio' }) {
  const bars = compact ? 20 : 30;
  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1' : 'py-2'} opacity-40`}>
      {/* Placeholder play button */}
      <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-slate-500 ml-0.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6 3.5L13 8l-7 4.5V3.5z" />
        </svg>
      </div>

      {/* Static bars */}
      <div className="flex-1 flex items-center gap-px h-7">
        {[...Array(bars)].map((_, i) => {
          const heightPct = 30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.3) * 15;
          return (
            <div
              key={i}
              className="flex-1 rounded-full bg-slate-700"
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>

      <span className="text-[10px] text-slate-600 flex-shrink-0 whitespace-nowrap">{label}</span>
    </div>
  );
}
