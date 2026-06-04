import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function StatsCard({ title, value, icon: Icon, trend, color = 'violet' }) {
  const gradients = {
    violet: 'from-violet-500 to-purple-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    rose: 'from-rose-500 to-pink-500'
  };

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-300 mb-1">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-white to-slate-100 bg-clip-text text-transparent">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </GlassCard>
  );
}