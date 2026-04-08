import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

const steps = [
  { emoji: '📝', label: 'Analyzing your service...' },
  { emoji: '✍️', label: 'Crafting gig title & description...' },
  { emoji: '💰', label: 'Creating pricing packages...' },
  { emoji: '🏷️', label: 'Generating SEO tags & FAQ...' },
];

export default function GigGenerateOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 via-violet-950/30 to-slate-900/90 p-8 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-2">Creating Your Fiverr Gig</h3>
      <p className="text-sm text-slate-400 mb-8">Our AI is crafting an optimized gig for you...</p>

      <div className="space-y-3 max-w-sm mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 1.2 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50"
          >
            <span className="text-lg">{step.emoji}</span>
            <span className="text-sm text-slate-300">{step.label}</span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: i * 1.2, duration: 1.5, repeat: Infinity }}
              className="ml-auto"
            >
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
