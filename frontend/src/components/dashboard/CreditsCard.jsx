import React from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export default function CreditsCard({ creditsUsed = 0, creditsLimit = 1000, planName }) {
  const percentage = creditsLimit > 0 ? Math.min((creditsUsed / creditsLimit) * 100, 100) : 0;
  const remaining = Math.max(0, creditsLimit - creditsUsed);
  const isLow = percentage >= 80;
  const isCritical = percentage >= 95;

  // Calculate average credits per day based on days elapsed in current month
  const today = new Date();
  const dayOfMonth = today.getDate();
  const avgPerDay = dayOfMonth > 0 ? Math.round(creditsUsed / dayOfMonth) : 0;

  return (
    <GlassCard className="p-6 relative overflow-hidden" hover={false}>
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Credits</h3>
              <p className="text-xs text-slate-400">
                {planName ? `${planName} Plan` : 'Monthly allocation'}
              </p>
            </div>
          </div>
        </div>

        {/* Main credit display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl font-bold",
              isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-white"
            )}>
              {creditsUsed.toLocaleString()}
            </span>
            <span className="text-slate-500">/ {creditsLimit.toLocaleString()}</span>
          </div>
          <p className={cn(
            "text-sm mt-1",
            isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400"
          )}>
            {remaining.toLocaleString()} credits remaining
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-slate-800/80 overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isCritical 
                ? "bg-gradient-to-r from-red-500 to-rose-500" 
                : isLow 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-violet-500 to-purple-500"
            )}
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Avg. {avgPerDay} credits/day</span>
          </div>
          <span className="text-slate-500">{Math.round(percentage)}% used</span>
        </div>
      </div>
    </GlassCard>
  );
}