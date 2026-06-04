import React, { useState, useRef } from 'react';
import { PlayCircle, PauseCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const voices = [
  { id: 'alex', name: 'Alex', type: 'Professional', description: 'Clear, confident male voice', gender: 'Male', audio: '' },
  { id: 'sarah', name: 'Sarah', type: 'Emotional', description: 'Friendly, warm female voice', gender: 'Female', audio: '' },
  { id: 'michael', name: 'Michael', type: 'Professional', description: 'Deep, authoritative voice', gender: 'Male', audio: '' },
  { id: 'emma', name: 'Emma', type: 'Emotional', description: 'Calm, soothing voice', gender: 'Female', audio: '' },
  { id: 'david', name: 'David', type: 'Professional', description: 'Energetic marketing voice', gender: 'Male', audio: '' },
  { id: 'luna', name: 'Luna', type: 'Emotional', description: 'Playful, light-hearted voice', gender: 'Female', audio: '' },
  { id: 'james', name: 'James', type: 'Professional', description: 'News anchor style', gender: 'Male', audio: '' },
  { id: 'olivia', name: 'Olivia', type: 'Emotional', description: 'Storytelling specialist', gender: 'Female', audio: '' },
];

export default function HorizontalVoiceSelector({ selectedVoiceId, onSelectVoice }) {
  const [playingAudio, setPlayingAudio] = useState(null);
  const scrollRef = useRef(null);
  const audioRef = useRef(new Audio());

  const handlePlayPause = (e, voice) => {
    e.stopPropagation();
    if (playingAudio === voice.id) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current.src) {
        audioRef.current.pause();
      }
      audioRef.current.src = voice.audio || '';
      audioRef.current.play().catch(() => setPlayingAudio(null));
      setPlayingAudio(voice.id);
      audioRef.current.onended = () => setPlayingAudio(null);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full shadow-lg -ml-4"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full shadow-lg -mr-4"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {voices.map((voice) => (
          <div
            key={voice.id}
            onClick={() => onSelectVoice(voice.id, voice.name, voice.type.toLowerCase())}
            className={cn(
              "flex-shrink-0 w-48 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105",
              selectedVoiceId === voice.id
                ? 'border-violet-500 bg-violet-500/15 shadow-lg shadow-violet-500/20'
                : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600'
            )}
          >
            {/* Avatar */}
            <div className="relative mb-3">
              <div className={cn(
                "w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold",
                selectedVoiceId === voice.id 
                  ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                  : "bg-gradient-to-br from-slate-600 to-slate-700"
              )}>
                {voice.name.charAt(0)}
              </div>
              {selectedVoiceId === voice.id && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center mb-3">
              <h4 className="font-semibold text-white">{voice.name}</h4>
              <p className="text-xs text-violet-400">{voice.type}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{voice.description}</p>
            </div>

            {/* Play Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handlePlayPause(e, voice)}
              className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              {playingAudio === voice.id ? (
                <><PauseCircle className="w-4 h-4 mr-2" /> Pause</>
              ) : (
                <><PlayCircle className="w-4 h-4 mr-2" /> Preview</>
              )}
            </Button>
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}