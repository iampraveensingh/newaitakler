import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, PauseCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const voiceCategories = [
  { value: 'all', label: 'All Voices' },
  { value: 'professional', label: 'Professional' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'custom', label: 'Custom' },
  { value: 'cloned', label: 'Cloned' },
];

const dummyVoices = {
  all: [
    { id: 'alex', name: 'Alex', type: 'professional', description: 'Clear, confident male voice for presentations.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'male' },
    { id: 'sarah', name: 'Sarah', type: 'emotional', description: 'Friendly, warm female voice for narratives.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'female' },
    { id: 'michael', name: 'Michael', type: 'professional', description: 'Deep, authoritative male voice for documentaries.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'male' },
    { id: 'emma', name: 'Emma', type: 'emotional', description: 'Calm, soothing female voice for meditation.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'female' },
    { id: 'custom_voice_1', name: 'Brand Voice Alpha', type: 'custom', description: 'Your unique brand voice for consistent messaging.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'custom' },
    { id: 'cloned_voice_1', name: 'My Clone - John Doe', type: 'cloned', description: 'A cloned voice from your provided audio sample.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'cloned' },
  ],
  professional: [
    { id: 'alex', name: 'Alex', type: 'professional', description: 'Clear, confident male voice for presentations.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'male' },
    { id: 'michael', name: 'Michael', type: 'professional', description: 'Deep, authoritative male voice for documentaries.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'male' },
    { id: 'david', name: 'David', type: 'professional', description: 'Energetic, engaging male voice for marketing.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'male' },
  ],
  emotional: [
    { id: 'sarah', name: 'Sarah', type: 'emotional', description: 'Friendly, warm female voice for narratives.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'female' },
    { id: 'emma', name: 'Emma', type: 'emotional', description: 'Calm, soothing female voice for meditation.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'female' },
    { id: 'luna', name: 'Luna', type: 'emotional', description: "Playful, light-hearted voice for children's content.", audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'female' },
  ],
  custom: [
    { id: 'custom_voice_1', name: 'Brand Voice Alpha', type: 'custom', description: 'Your unique brand voice for consistent messaging.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'custom' },
  ],
  cloned: [
    { id: 'cloned_voice_1', name: 'My Clone - John Doe', type: 'cloned', description: 'A cloned voice from your provided audio sample.', audio: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c518d53a72.mp3?filename=notification-sound-7062.mp3', gender: 'cloned' },
  ],
};

export default function VoiceSelector({ selectedVoiceId, onSelectVoice }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(new Audio());

  const handlePlayPause = (voice) => {
    if (playingAudio === voice.id) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current.src) {
        audioRef.current.pause();
      }
      audioRef.current.src = voice.audio || '';
      audioRef.current.play().catch(() => {
        // Audio play failed, ignore
        setPlayingAudio(null);
      });
      setPlayingAudio(voice.id);
      audioRef.current.onended = () => setPlayingAudio(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto w-full justify-start rounded-md bg-slate-800/50 p-1 text-slate-300">
            {voiceCategories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        
        {Object.keys(dummyVoices).map((categoryKey) => (
          <TabsContent key={categoryKey} value={categoryKey} className="mt-4">
            <div className="grid grid-cols-1 gap-3">
              {dummyVoices[categoryKey].map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => onSelectVoice(voice.id, voice.name, voice.type)}
                  className={cn(
                    "relative p-4 rounded-lg border cursor-pointer transition-all",
                    selectedVoiceId === voice.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{voice.name}</h4>
                    {selectedVoiceId === voice.id && (
                      <CheckCircle className="w-5 h-5 text-violet-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{voice.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 capitalize">{voice.type} ({voice.gender})</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {e.stopPropagation(); handlePlayPause(voice);}}
                      className="text-violet-400 hover:text-violet-300"
                    >
                      {playingAudio === voice.id ? (
                        <PauseCircle className="w-6 h-6" />
                      ) : (
                        <PlayCircle className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}