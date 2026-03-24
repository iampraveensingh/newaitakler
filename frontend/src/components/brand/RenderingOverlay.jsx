import { motion } from 'framer-motion';
import { Mic, Waves, Volume2, Sparkles, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const RENDER_STEPS = [
  { key: 'preparing',   icon: Sparkles, label: 'Preparing Script',   description: 'Optimizing your VSL for voice delivery...' },
  { key: 'voice_synth', icon: Mic,      label: 'Synthesizing Voice', description: 'Generating natural speech with AI...'      },
  { key: 'processing',  icon: Waves,    label: 'Processing Audio',   description: 'Enhancing clarity and dynamics...'        },
  { key: 'finalizing',  icon: Volume2,  label: 'Finalizing',         description: 'Packaging your brand voiceover...'        },
  { key: 'done',        icon: Check,    label: 'Voiceover Ready!',   description: 'Your brand audio is complete'             },
];

function getStepIndex(step) {
  return RENDER_STEPS.findIndex(s => s.key === step);
}

function WaveformVisualizer() {
  return (
    <div className="flex items-center justify-center gap-[3px] h-16 my-6">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: [8, 20 + Math.random() * 40, 8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 0.6 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.03, ease: 'easeInOut' }}
          className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-pink-500"
        />
      ))}
    </div>
  );
}

export default function RenderingOverlay({ currentStep }) {
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
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.1, 0.05], rotate: [0, 180, 360] }}
            transition={{ duration: 8 + i * 3, repeat: Infinity, delay: i * 1.5 }}
            className="absolute rounded-full border border-violet-500/20"
            style={{ width: 300 + i * 200, height: 300 + i * 200 }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: '100vh', x: `${Math.random() * 100}vw` }}
            animate={{ opacity: [0, 0.5, 0], y: ['100vh', '-10vh'], x: `${20 + Math.random() * 60}vw` }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
            className={cn('absolute rounded-full',
              i % 3 === 0 ? 'w-1.5 h-1.5 bg-violet-400' : i % 3 === 1 ? 'w-1 h-1 bg-pink-400' : 'w-1 h-1 bg-cyan-400'
            )}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          animate={isDone ? { scale: [1, 1.2, 1] } : { scale: [1, 1.05, 1] }}
          transition={{ duration: isDone ? 0.5 : 2, repeat: isDone ? 0 : Infinity }}
          className="mx-auto mb-4"
        >
          <div className={cn(
            'w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transition-all duration-700',
            isDone ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/40'
                   : 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 shadow-violet-500/40'
          )}>
            {isDone ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <Check className="w-12 h-12 text-white" />
              </motion.div>
            ) : <Volume2 className="w-12 h-12 text-white" />}
          </div>
        </motion.div>

        {!isDone && <WaveformVisualizer />}

        <h2 className="text-center text-2xl font-bold text-white mb-1">
          {isDone ? 'Voiceover Complete!' : 'Rendering Your Brand Voice'}
        </h2>
        <p className="text-center text-slate-400 mb-8 text-sm">
          {isDone ? 'Your brand voiceover is ready to use.' : 'Creating your personalized brand voiceover...'}
        </p>

        <div className="space-y-2">
          {RENDER_STEPS.filter(s => s.key !== 'done').map((step, i) => {
            const Icon = step.icon;
            const isActive   = i === activeIndex;
            const isComplete = i < activeIndex;
            const isPending  = i > activeIndex;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500',
                  isActive   && 'bg-violet-500/10 border border-violet-500/30',
                  isComplete && 'bg-emerald-500/5 border border-emerald-500/10',
                  isPending  && 'opacity-30'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 flex-shrink-0',
                  isActive   && 'bg-gradient-to-br from-violet-500 to-pink-600 shadow-lg shadow-violet-500/30',
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
            animate={{ width: `${((activeIndex + 1) / (RENDER_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full"
          />
        </div>
        <p className="text-center text-xs text-slate-500 mt-2">
          Step {Math.min(activeIndex + 1, RENDER_STEPS.length - 1)} of {RENDER_STEPS.length - 1}
        </p>
      </div>
    </motion.div>
  );
}
