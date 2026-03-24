import { motion } from 'framer-motion';
import { Globe, Brain, FileText, Check, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'scraping',       icon: Globe,     label: 'Scanning Website',      description: 'Crawling page content & structure...',         color: 'cyan'    },
  { key: 'analyzing',      icon: Brain,     label: 'Analyzing Brand DNA',   description: 'Identifying voice, tone & personality...',     color: 'violet'  },
  { key: 'generating_vsl', icon: FileText,  label: 'Crafting VSL Script',   description: 'Writing your video sales letter...',           color: 'pink'    },
  { key: 'done',           icon: Check,     label: 'Package Ready!',        description: 'Your brand package is complete!',              color: 'emerald' },
];

function getStepIndex(step) {
  return STEPS.findIndex(s => s.key === step);
}

function DNAHelix() {
  return (
    <div className="flex items-center justify-center gap-1 h-20 my-4">
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: [4, 12 + Math.sin(i * 0.5) * 30, 4], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
          className={cn('w-1.5 rounded-full', i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-violet-400' : 'bg-pink-400')}
        />
      ))}
    </div>
  );
}

export default function AnalysisOverlay({ currentStep }) {
  const activeIndex = getStepIndex(currentStep);
  const isDone = currentStep === 'done';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ rotate: i % 2 === 0 ? [0, 360] : [360, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-full border border-dashed"
            style={{
              width: 200 + i * 150, height: 200 + i * 150,
              borderColor: `rgba(${i % 2 === 0 ? '139, 92, 246' : '236, 72, 153'}, ${0.08 - i * 0.01})`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: '110%', x: `${Math.random() * 100}vw` }}
            animate={{ opacity: [0, 0.6, 0], y: ['110%', '-10%'] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            className={cn('absolute rounded-full', i % 2 === 0 ? 'w-1 h-1 bg-violet-400' : 'w-1.5 h-1.5 bg-cyan-400')}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div className="flex items-center justify-center mb-2">
          <motion.div
            animate={isDone ? { scale: [1, 1.2, 1] } : { scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: isDone ? 0.5 : 3, repeat: isDone ? 0 : Infinity }}
          >
            <div className={cn(
              'w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700',
              isDone ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/40'
                     : 'bg-gradient-to-br from-cyan-500 via-violet-600 to-pink-600 shadow-violet-500/40'
            )}>
              {isDone ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <Check className="w-12 h-12 text-white" />
                </motion.div>
              ) : (
                <Zap className="w-12 h-12 text-white" />
              )}
            </div>
          </motion.div>
        </motion.div>

        {!isDone && <DNAHelix />}

        <h2 className="text-center text-2xl font-bold text-white mb-1">
          {isDone ? 'Analysis Complete!' : 'Analyzing Your Brand'}
        </h2>
        <p className="text-center text-slate-400 mb-8 text-sm">
          {isDone ? 'Review your brand package below.' : 'AI is building your brand voice profile...'}
        </p>

        <div className="space-y-2">
          {STEPS.filter(s => s.key !== 'done').map((step, i) => {
            const Icon = step.icon;
            const isActive  = i === activeIndex;
            const isComplete = i < activeIndex || isDone;
            const isPending  = i > activeIndex && !isDone;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500',
                  isActive   && 'bg-violet-500/10 border border-violet-500/30',
                  isComplete && 'bg-emerald-500/5 border border-emerald-500/10',
                  isPending  && 'opacity-30'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 flex-shrink-0',
                  isActive   && 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30',
                  isComplete && 'bg-emerald-500/20',
                  isPending  && 'bg-slate-800/50'
                )}>
                  {isActive   ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : isComplete ? <Check className="w-4 h-4 text-emerald-400" />
                               : <Icon  className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-sm', isActive && 'text-white', isComplete && 'text-emerald-400', isPending && 'text-slate-500')}>
                    {step.label}
                  </p>
                  <p className={cn('text-xs truncate', isActive ? 'text-slate-300' : 'text-slate-600')}>
                    {isComplete ? 'Done' : step.description}
                  </p>
                </div>
                {isActive && (
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: isDone ? '100%' : `${((activeIndex + 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-full"
          />
        </div>
        <p className="text-center text-xs text-slate-500 mt-2">
          {isDone ? 'Complete!' : `Step ${Math.min(activeIndex + 1, STEPS.length - 1)} of ${STEPS.length - 1}`}
        </p>
      </div>
    </motion.div>
  );
}
