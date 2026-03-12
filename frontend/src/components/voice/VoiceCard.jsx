import React, { useState, useRef } from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const voiceCategories = {
  'emotional': { emoji: '❤️', label: 'Emotional', color: 'from-pink-500 to-rose-500' },
  'professional': { emoji: '💼', label: 'Professional', color: 'from-blue-500 to-cyan-500' },
  'expressive': { emoji: '🎭', label: 'Expressive', color: 'from-amber-500 to-orange-500' },
  'cloned': { emoji: '🐑', label: 'Cloned', color: 'from-green-500 to-emerald-500' },
  'custom': { emoji: '✨', label: 'Custom', color: 'from-violet-500 to-purple-500' },
};

export default function VoiceCard({ voice, selectedVoiceId, onSelectVoice }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const handlePlayPause = (e) => {
    e.stopPropagation();
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!voice.audio) {
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 3000);
        return;
      }
      audioRef.current.src = voice.audio;
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const categoryInfo = voiceCategories[voice.type] || { emoji: '🎤', label: 'Voice', color: 'from-slate-500 to-slate-600' };
  const isSelected = selectedVoiceId === voice.id;

  return (
    <motion.div
      onClick={() => onSelectVoice(voice.id, voice.name, voice.type, voice.audio || '')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-3 rounded-xl border cursor-pointer transition-all overflow-hidden",
        isSelected
          ? 'border-violet-500 bg-gradient-to-br from-violet-500/20 to-purple-500/10 shadow-lg shadow-violet-500/20'
          : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80'
      )}
    >
      {/* Selected Check */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br",
          categoryInfo.color
        )}>
          {voice.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 pr-5">
          <h4 className="font-medium text-white text-sm truncate leading-tight">{voice.name}</h4>
          <span className="text-[10px] text-slate-500">{categoryInfo.emoji} {categoryInfo.label}</span>
        </div>
      </div>

      {/* Waveform & Play Button */}
      <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
        {/* Mini Waveform */}
        <div className="flex-1 flex items-center justify-center gap-[2px] h-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-[3px] rounded-full",
                isPlaying ? "bg-violet-400" : "bg-slate-600"
              )}
              animate={isPlaying ? {
                height: [4, Math.random() * 16 + 4, 4],
              } : { height: Math.random() * 8 + 4 }}
              transition={{
                duration: 0.4,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
        
        {/* Play Button */}
        <button
          onClick={handlePlayPause}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all",
            isPlaying 
              ? "bg-violet-500 text-white" 
              : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
          )}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3 ml-0.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}