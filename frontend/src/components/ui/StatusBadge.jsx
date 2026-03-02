import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  draft: {
    icon: Clock,
    label: 'Draft',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    animate: true
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  ready: {
    icon: CheckCircle2,
    label: 'Ready',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'bg-red-500/10 text-red-400 border-red-500/20'
  }
};

export default function StatusBadge({ status, size = 'default' }) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium',
      size === 'sm' ? 'text-xs' : 'text-sm',
      config.className
    )}>
      <Icon className={cn('w-3.5 h-3.5', config.animate && 'animate-spin')} />
      {config.label}
    </span>
  );
}