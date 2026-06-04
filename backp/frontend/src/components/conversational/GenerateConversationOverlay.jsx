import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Save, Clock, CheckCircle } from 'lucide-react';

const stages = [
  { text: 'Saving your conversation...', icon: Save },
  { text: 'Applying speaker settings...', icon: Users },
  { text: 'Queuing for generation...', icon: Clock },
  { text: 'Saved! Audio will be ready shortly.', icon: CheckCircle },
];

export default function GenerateConversationOverlay({ isVisible, onComplete }) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStage(0);
      setProgress(0);
      return;
    }

    const intervals = [1000, 1500, 2000, 1000, 600];
    let currentStage = 0;

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 0.8, 95));
    }, 100);

    const advanceStage = () => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setStage(currentStage);
        if (currentStage < stages.length - 1) {
          setTimeout(advanceStage, intervals[currentStage]);
        } else {
          setProgress(100);
          clearInterval(progressInterval);
          setTimeout(onComplete, 800);
        }
      }
    };

    setTimeout(advanceStage, intervals[0]);
    return () => clearInterval(progressInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  const CurrentIcon = stages[stage].icon;
  const isComplete = stage === stages.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center"
    >
      <div className="text-center max-w-md w-full px-6">
        {/* Animated Icon Ring */}
        <div className="relative w-36 h-36 mx-auto mb-8">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="3" />
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={isComplete ? '#10b981' : '#8b5cf6'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={283}
              strokeDashoffset={283 - (283 * progress) / 100}
              transform="rotate(-90 50 50)"
              transition={{ duration: 0.3 }}
            />
          </svg>

          {!isComplete && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-3 rounded-full border-2 border-transparent border-t-purple-500/60"
            />
          )}

          <motion.div
            key={stage}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isComplete
                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                : 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
              <CurrentIcon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </div>

        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-white mb-3"
        >
          {stages[stage].text}
        </motion.p>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === stage ? 1.3 : 1,
                backgroundColor: i <= stage ? (isComplete ? '#10b981' : '#8b5cf6') : '#334155'
              }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>

        {!isComplete && (
          <div className="flex items-center justify-center gap-1 mt-6">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [8, 28, 8] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
                className="w-1 bg-gradient-to-t from-violet-500/60 to-purple-400/60 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
