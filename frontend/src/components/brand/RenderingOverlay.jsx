import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Mic, Wand2, Bell } from 'lucide-react';

const QUEUE_ITEMS = [
  { icon: CheckCircle2, label: 'Script saved',          desc: 'Your VSL script is stored and ready',        color: 'emerald' },
  { icon: Mic,          label: 'Voice generation queued', desc: 'Scheduled for processing by our AI engine', color: 'violet'  },
  { icon: Bell,         label: 'Check Brand Projects',    desc: 'Your audio will appear there when ready',   color: 'cyan'    },
];

export default function RenderingOverlay() {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
    >
      {/* Background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.09, 0.04] }}
            transition={{ duration: 5 + i * 2, repeat: Infinity, delay: i * 1.2 }}
            className="absolute rounded-full border border-violet-500/20"
            style={{ width: 280 + i * 180, height: 280 + i * 180 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 text-center">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="mx-auto mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/40">
            <Wand2 className="w-12 h-12 text-white" />
          </div>
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl bg-violet-500/20 pointer-events-none"
            style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: 96, height: 96, borderRadius: 24 }}
          />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Voiceover Queued!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-sm mb-6"
        >
          Your brand voice will be generated shortly by our AI engine.
          No need to wait — we'll handle it in the background.
        </motion.p>

        {/* Queue info cards */}
        <div className="space-y-2 mb-6 text-left">
          {QUEUE_ITEMS.map(({ icon: Icon, label, desc, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${color === 'emerald' ? 'bg-emerald-500/20' : color === 'violet' ? 'bg-violet-500/20' : 'bg-cyan-500/20'}`}>
                <Icon className={`w-4 h-4
                  ${color === 'emerald' ? 'text-emerald-400' : color === 'violet' ? 'text-violet-400' : 'text-cyan-400'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-slate-500 text-xs truncate">{desc}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </motion.div>
          ))}
        </div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2 text-slate-400 text-xs"
        >
          <Clock className="w-3.5 h-3.5" />
          Redirecting to Brand Projects in {countdown}s…
        </motion.div>
      </div>
    </motion.div>
  );
}
