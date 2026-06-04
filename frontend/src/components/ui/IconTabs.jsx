import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function IconTabs({ tabs, activeTab, onTabChange, size = 'default' }) {
  const sizeClasses = {
    sm: 'p-2 gap-1',
    default: 'p-3 gap-2',
    lg: 'p-4 gap-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const isLocked = tab.locked === true;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex items-center rounded-xl border transition-all duration-200",
              sizeClasses[size],
              isActive
                ? "border-transparent bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                : isLocked
                  ? "border-slate-700/40 bg-slate-800/30 text-slate-600 cursor-pointer hover:border-amber-500/30 hover:text-slate-500"
                  : "border-slate-700/50 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600"
            )}
          >
            {tab.emoji ? (
              <span className={cn("shrink-0", textSizes[size])}>{tab.emoji}</span>
            ) : Icon ? (
              <Icon className={cn("shrink-0", iconSizes[size], isActive ? "text-white" : isLocked ? "text-slate-600" : "text-slate-400")} />
            ) : null}
            <span className={cn("font-medium whitespace-nowrap", textSizes[size])}>
              {tab.label}
            </span>
            {isLocked && (
              <Lock className="ml-1.5 w-3 h-3 text-amber-500/70 shrink-0" />
            )}
            {tab.badge && !isLocked && (
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                isActive ? "bg-white/20 text-white" : "bg-violet-500/20 text-violet-400"
              )}>
                {tab.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}