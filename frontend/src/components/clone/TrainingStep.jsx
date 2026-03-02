import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Sparkles, CheckCircle } from 'lucide-react';

const trainingStages = [
  { progress: 20, message: 'Analyzing audio samples...' },
  { progress: 40, message: 'Extracting voice characteristics...' },
  { progress: 60, message: 'Training neural network...' },
  { progress: 80, message: 'Fine-tuning voice model...' },
  { progress: 95, message: 'Finalizing voice clone...' },
  { progress: 100, message: 'Your voice clone is now in processing. It will be ready in approximately 2 minutes.' },
];

export default function TrainingStep({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextProgress = prev + 2;
        
        // Update stage based on progress
        const newStageIndex = trainingStages.findIndex(s => s.progress > nextProgress);
        if (newStageIndex !== -1 && newStageIndex !== stageIndex) {
          setStageIndex(newStageIndex);
        }
        
        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1500);
          return 100;
        }
        return nextProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete, stageIndex]);

  const currentStage = trainingStages[stageIndex] || trainingStages[trainingStages.length - 1];
  const isComplete = progress >= 100;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
      {/* Animated Icon */}
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
          isComplete 
            ? 'bg-green-500/20 border-2 border-green-500/50' 
            : 'bg-violet-500/20 border-2 border-violet-500/50'
        }`}>
          {isComplete ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <Brain className="w-16 h-16 text-violet-400 animate-pulse" />
          )}
        </div>
        {!isComplete && (
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
        )}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isComplete ? '🎉 Processing Started!' : '🧠 Training Your Voice...'}
        </h2>
        <p className="text-slate-400 max-w-md">
          {isComplete
            ? 'Your voice clone is now in processing. It will be ready in approximately 2 minutes.'
            : 'Our AI is learning the unique characteristics of your voice.'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-3">
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-lg shadow-violet-500/30"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-2">
            {!isComplete && <Loader2 className="w-4 h-4 animate-spin" />}
            {currentStage.message}
          </span>
          <span className="text-violet-400 font-mono">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Training Stages */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-6">
        {[
          { icon: '🎵', label: 'Audio Analysis', done: progress > 30 },
          { icon: '🧬', label: 'Voice Modeling', done: progress > 60 },
          { icon: '✨', label: 'Optimization', done: progress > 90 },
        ].map((stage, i) => (
          <div 
            key={i}
            className={`p-3 rounded-lg border transition-all ${
              stage.done 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-slate-700 bg-slate-800/30'
            }`}
          >
            <span className="text-2xl">{stage.icon}</span>
            <p className={`text-xs mt-1 ${stage.done ? 'text-green-400' : 'text-slate-500'}`}>
              {stage.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}