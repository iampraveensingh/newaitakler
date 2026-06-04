import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

// Renders the active (hovered) slice with a glowing outer ring
function ActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill,
  } = props;

  return (
    <g>
      {/* Outer glow ring */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.25}
      />
      {/* Expanded main slice */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

// Renders the resting (non-active) slice
function IdleShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx} cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export default function CreditsCard({ creditsUsed = 0, creditsLimit = 1000, planName }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const unlimited  = creditsLimit === -1 || creditsLimit === null;
  const percentage = unlimited || creditsLimit <= 0 ? 0 : Math.min((creditsUsed / creditsLimit) * 100, 100);
  const remaining  = unlimited ? null : Math.max(0, creditsLimit - creditsUsed);
  const isLow      = !unlimited && percentage >= 80;
  const isCritical = !unlimited && percentage >= 95;

  const today      = new Date();
  const avgPerDay  = today.getDate() > 0 ? Math.round(creditsUsed / today.getDate()) : 0;

  const usedColor = isCritical ? '#f87171' : isLow ? '#fbbf24' : '#8b5cf6';

  const pieData = unlimited
    ? [{ name: 'Unlimited', value: 1, color: '#10b981' }]
    : creditsUsed === 0 && remaining === 0
      ? [{ name: 'No data', value: 1, color: '#1e293b' }]
      : [
          { name: 'Used',      value: creditsUsed || 0, color: usedColor  },
          { name: 'Remaining', value: remaining   || 0, color: '#1e293b'  },
        ];

  // Label shown in the donut center — changes based on which slice is hovered
  const centerLabel = activeIndex !== null && !unlimited
    ? { top: pieData[activeIndex]?.name, bottom: (pieData[activeIndex]?.value ?? 0).toLocaleString() }
    : { top: unlimited ? '∞' : `${Math.round(percentage)}%`, bottom: unlimited ? 'Unlimited' : 'used' };

  return (
    <GlassCard className="p-6 relative overflow-hidden" hover={false}>
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-violet-500/15 to-purple-500/15 rounded-full blur-3xl" />

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Credits</h3>
            <p className="text-xs text-slate-400">
              {planName === 'UNLIMITED' || planName === 'BUNDLE' || planName === 'ALLACCESS'
                ? planName
                : planName === 'AGENCY'
                  ? 'Agency Account'
                  : planName ? `${planName} Plan` : 'Monthly allocation'}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className={cn('text-2xl font-bold', isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white')}>
              {creditsUsed.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">/ {unlimited ? '∞' : creditsLimit.toLocaleString()}</p>
          </div>
        </div>

        {/* Donut chart */}
        <div className="relative flex items-center justify-center my-1">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={78}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
                activeIndex={activeIndex ?? undefined}
                activeShape={ActiveShape}
                inactiveShape={IdleShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label — absolutely positioned over the donut hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <motion.span
              key={centerLabel.top}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'font-bold leading-none',
                activeIndex !== null ? 'text-base text-white' : 'text-2xl',
                activeIndex === null && (isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : unlimited ? 'text-emerald-400' : 'text-violet-400')
              )}
            >
              {centerLabel.top}
            </motion.span>
            <motion.span
              key={centerLabel.bottom}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-slate-400 mt-1"
            >
              {centerLabel.bottom}
            </motion.span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4">
          {!unlimited && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: usedColor }} />
                <span className="text-slate-400">Used</span>
                <span className="text-white font-semibold">{creditsUsed.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 flex-shrink-0" />
                <span className="text-slate-400">Left</span>
                <span className="text-white font-semibold">{remaining?.toLocaleString()}</span>
              </div>
            </>
          )}
          {unlimited && (
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-slate-400">Unlimited credits available</span>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg. <span className="text-white">{avgPerDay}</span> credits/day</span>
          </div>
          <span className={cn(
            'font-medium',
            isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : unlimited ? 'text-emerald-400' : 'text-slate-400'
          )}>
            {unlimited ? '∞ remaining' : `${Math.round(percentage)}% used`}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
