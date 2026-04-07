import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, FileText, PenTool, Video, Users, Check, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  vsl: FileText,
  adcopy: PenTool,
  transcribe: Video,
  invite: Users,
  customvoice: Sparkles,
  default: Wand2
};

const stagesMap = {
  vsl: [
    { label: 'Analyzing product details', duration: 1500, emoji: '🔍' },
    { label: 'Crafting compelling hook', duration: 2000, emoji: '🪝' },
    { label: 'Writing persuasive body', duration: 2500, emoji: '✍️' },
    { label: 'Creating powerful CTA', duration: 1500, emoji: '🎯' },
    { label: 'Polishing final script', duration: 1000, emoji: '✨' },
  ],
  adcopy: [
    { label: 'Understanding your product', duration: 1500, emoji: '🧠' },
    { label: 'Researching platform best practices', duration: 1800, emoji: '📊' },
    { label: 'Generating headline variations', duration: 2000, emoji: '💡' },
    { label: 'Writing compelling descriptions', duration: 2200, emoji: '✍️' },
    { label: 'Crafting call-to-actions', duration: 1500, emoji: '🚀' },
  ],
  transcribe: [
    { label: 'Connecting to source', duration: 1500, emoji: '🔗' },
    { label: 'Extracting audio', duration: 2000, emoji: '🎵' },
    { label: 'Processing speech patterns', duration: 2500, emoji: '🗣️' },
    { label: 'Converting to text', duration: 2000, emoji: '📝' },
    { label: 'Formatting output', duration: 1000, emoji: '✅' },
  ],
  invite: [
    { label: 'Validating email', duration: 800, emoji: '📧' },
    { label: 'Creating account', duration: 1200, emoji: '👤' },
    { label: 'Sending invitation', duration: 1500, emoji: '📨' },
  ],
  customvoice: [
    { label: 'Your voice added in process.', duration: 3000, emoji: '✨' },
  ],
};

const gradientMap = {
  vsl: 'from-rose-500 via-pink-500 to-purple-500',
  adcopy: 'from-indigo-500 via-blue-500 to-cyan-500',
  transcribe: 'from-emerald-500 via-teal-500 to-cyan-500',
  invite: 'from-violet-500 via-purple-500 to-pink-500',
  customvoice: 'from-amber-500 via-orange-500 to-yellow-500',
  default: 'from-violet-500 via-purple-500 to-pink-500',
};

const glowColorMap = {
  vsl: 'shadow-rose-500/50',
  adcopy: 'shadow-indigo-500/50',
  transcribe: 'shadow-emerald-500/50',
  invite: 'shadow-violet-500/50',
  customvoice: 'shadow-amber-500/50',
  default: 'shadow-violet-500/50',
};

export default function GeneratingOverlay({ isVisible, type = 'default', title, onComplete, autoComplete = false }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const stages = stagesMap[type] || stagesMap.vsl;
  const Icon = iconMap[type] || iconMap.default;
  const gradient = gradientMap[type] || gradientMap.default;
  const glowColor = glowColorMap[type] || glowColorMap.default;

  // Keep a stable ref so changing the callback never restarts the animation
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      setStageProgress(0);
      setOverallProgress(0);
      return;
    }

    let stageTimer;
    let progressInterval;
    let completed = false;

    const runStage = (stageIndex) => {
      if (completed) return;

      if (stageIndex >= stages.length) {
        completed = true;
        setCurrentStage(stages.length - 1);
        setStageProgress(100);
        setOverallProgress(100);
        if (autoComplete) setTimeout(() => onCompleteRef.current?.(), 600);
        return;
      }

      setCurrentStage(stageIndex);
      setStageProgress(0);

      const duration = stages[stageIndex].duration;
      const increment = 100 / (duration / 50);

      progressInterval = setInterval(() => {
        if (completed) {
          clearInterval(progressInterval);
          return;
        }
        setStageProgress(prev => {
          const newProgress = Math.min(prev + increment, 100);
          const baseProgress = (stageIndex / stages.length) * 100;
          const stageContribution = (newProgress / 100) * (100 / stages.length);
          setOverallProgress(baseProgress + stageContribution);
          return newProgress;
        });
      }, 50);

      stageTimer = setTimeout(() => {
        clearInterval(progressInterval);
        if (!completed) {
          runStage(stageIndex + 1);
        }
      }, duration);
    };

    runStage(0);

    return () => {
      completed = true;
      clearTimeout(stageTimer);
      clearInterval(progressInterval);
    };
  }, [isVisible, stages, autoComplete]); // onComplete intentionally excluded — handled via ref

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className={cn("absolute rounded-full bg-gradient-to-r", gradient)}
                style={{
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
                }}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                  opacity: 0.2,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: -20,
                  opacity: [0.2, 0.6, 0.2],
                  x: Math.random() * 100 - 50 + (Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)),
                  transition: {
                    duration: Math.random() * 4 + 5,
                    repeat: Infinity,
                    delay: Math.random() * 3
                  }
                }}
              />
            ))}
          </div>

          {/* Glowing orbs in background */}
          <motion.div 
            className={cn("absolute w-96 h-96 rounded-full bg-gradient-to-r blur-3xl opacity-20", gradient)}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className={cn("absolute w-64 h-64 rounded-full bg-gradient-to-r blur-3xl opacity-15", gradient)}
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />

          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "relative bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-10 border border-slate-700/50 max-w-md w-full mx-4",
              "shadow-2xl", glowColor
            )}
          >
            {/* Rotating ring around the card */}
            <div className="absolute -inset-[2px] rounded-3xl overflow-hidden">
              <motion.div
                className={cn("absolute inset-0 bg-gradient-to-r", gradient)}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{
                  background: `conic-gradient(from 0deg, transparent, transparent, ${type === 'vsl' ? '#f43f5e' : type === 'adcopy' ? '#6366f1' : type === 'customvoice' ? '#f59e0b' : '#10b981'}, transparent, transparent)`
                }}
              />
            </div>
            <div className="absolute inset-[2px] rounded-3xl bg-slate-900/95" />
            
            {/* Content */}
            <div className="relative">
              {/* Central icon with animated glow */}
              <div className="flex justify-center mb-8">
                <motion.div className="relative">
                  {/* Outer rotating ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-6"
                  >
                    <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-r", gradient)} />
                    <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-r opacity-60", gradient)} />
                    <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-r opacity-80", gradient)} />
                    <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-r opacity-70", gradient)} />
                  </motion.div>

                  {/* Pulsing glow */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn("absolute inset-0 rounded-3xl bg-gradient-to-r blur-2xl", gradient)}
                  />
                  
                  {/* Icon container */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={cn("relative w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-xl", gradient, glowColor)}
                  >
                    <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* Floating sparkles */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4"
                  >
                    <Star className="absolute top-0 left-1/2 w-4 h-4 text-amber-400 fill-amber-400" />
                    <Zap className="absolute bottom-0 right-0 w-4 h-4 text-cyan-400" />
                    <Sparkles className="absolute top-1/2 left-0 w-4 h-4 text-pink-400" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Title with shimmer effect */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-center text-white mb-2"
              >
                {title || 'Generating...'}
              </motion.h2>

              {/* Overall progress bar */}
              <div className="mt-4 mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Overall Progress</span>
                  <span className="font-mono">{Math.round(overallProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out", gradient)}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Stages with emojis */}
              <div className="space-y-3 mt-6">
                {stages.map((stage, idx) => (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: idx <= currentStage ? 1 : 0.4,
                      x: 0,
                      scale: idx === currentStage ? 1.02 : 1
                    }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl transition-all",
                      idx === currentStage && "bg-slate-800/50"
                    )}
                  >
                    <motion.div 
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                        idx < currentStage
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : idx === currentStage
                            ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                      )}
                      animate={idx === currentStage ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {idx < currentStage ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{stage.emoji}</span>
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium transition-colors",
                        idx === currentStage ? "text-white" : idx < currentStage ? "text-emerald-400" : "text-slate-500"
                      )}>
                        {stage.label}
                      </p>
                      {idx === currentStage && (
                        <div className="h-1.5 rounded-full bg-slate-700 mt-2 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-100 ease-linear", gradient)}
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Animated bottom decoration */}
              <div className="flex justify-center items-center gap-3 mt-8">
                <motion.div
                  className={cn("h-[2px] w-16 rounded-full bg-gradient-to-r", gradient)}
                  animate={{ scaleX: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-r", gradient)}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <motion.div
                  className={cn("h-[2px] w-16 rounded-full bg-gradient-to-r", gradient)}
                  animate={{ scaleX: [0.5, 1, 0.5], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}