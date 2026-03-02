import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Mic, Copy, FileText, PenTool, Video, Sparkles, Infinity } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

const usageItemsConfig = [
  { key: 'clones', label: 'Voice Clones', icon: Copy, color: 'blue' },
  { key: 'vsl', label: 'VSL Scripts', icon: FileText, color: 'emerald' },
  { key: 'adcopy', label: 'Ad Copies', icon: PenTool, color: 'amber' },
  { key: 'customvoice', label: 'Custom Voices', icon: Sparkles, color: 'pink' },
  { key: 'transcriptions', label: 'Transcriptions', icon: Video, color: 'cyan' },
];

const colorMap = {
  violet: { bar: 'bg-violet-500', bg: 'bg-violet-500/20', text: 'text-violet-400' },
  blue: { bar: 'bg-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  emerald: { bar: 'bg-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  amber: { bar: 'bg-amber-500', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  pink: { bar: 'bg-pink-500', bg: 'bg-pink-500/20', text: 'text-pink-400' },
  cyan: { bar: 'bg-cyan-500', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
};

export default function UsageLimitsCard({ counts = {} }) {
  // Build items from counts (which now includes used and limit)
  const items = usageItemsConfig.map(item => ({
    ...item,
    used: counts[item.key]?.used ?? 0,
    limit: counts[item.key]?.limit ?? 10
  }));

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Usage Limits</h3>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const colors = colorMap[item.color];
          const isUnlimited = item.limit === null;
          const percentage = isUnlimited ? 100 : Math.min((item.used / item.limit) * 100, 100);
          const isNearLimit = !isUnlimited && percentage >= 80;
          const isAtLimit = !isUnlimited && percentage >= 100;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", colors.text)} />
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
                {isUnlimited ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                    {item.used} / <Infinity className="w-4 h-4" />
                  </span>
                ) : (
                  <span className={cn(
                    "text-sm font-medium",
                    isAtLimit ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-slate-400"
                  )}>
                    {item.used} / {item.limit}
                  </span>
                )}
              </div>
              <div className={cn("h-2 rounded-full overflow-hidden", isUnlimited ? 'bg-emerald-500/20' : colors.bg)}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isUnlimited ? '100%' : `${percentage}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={cn(
                    "h-full rounded-full",
                    isUnlimited ? "bg-gradient-to-r from-emerald-500 to-teal-400" : isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : colors.bar
                  )}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}