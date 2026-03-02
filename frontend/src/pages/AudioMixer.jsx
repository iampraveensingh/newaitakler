import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Music2, Plus, Upload, Play, Pause, Volume2, VolumeX, 
  RefreshCw, Save, Download, Trash2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';

const presets = [
  { value: 'custom', label: 'Custom', voiceVol: 100, musicVol: 30 },
  { value: 'podcast', label: 'Podcast', voiceVol: 100, musicVol: 15 },
  { value: 'ad', label: 'Advertisement', voiceVol: 95, musicVol: 40 },
  { value: 'cinematic', label: 'Cinematic', voiceVol: 90, musicVol: 50 },
];

const musicLibrary = [
  { id: '1', name: 'Upbeat Corporate', duration: '2:30' },
  { id: '2', name: 'Calm & Relaxing', duration: '3:15' },
  { id: '3', name: 'Cinematic Epic', duration: '2:45' },
  { id: '4', name: 'Podcast Intro', duration: '0:30' },
  { id: '5', name: 'Soft Piano', duration: '3:00' },
];

export default function AudioMixer() {
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState('');
  const [selectedVoiceovers, setSelectedVoiceovers] = useState([]);
  const [musicSource, setMusicSource] = useState('library');
  const [selectedMusic, setSelectedMusic] = useState('');
  const [voiceVolume, setVoiceVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(30);
  const [autoDucking, setAutoDucking] = useState(true);
  const [preset, setPreset] = useState('custom');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: voiceovers = [] } = useQuery({
    queryKey: ['voiceovers'],
    queryFn: () => base44.entities.VoiceOver.filter({ status: 'completed' })
  });

  const createMixMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioMix.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['mixes'] });
      try {
        await base44.trackUsage('credits', 1);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
      toast.success('Audio mix created!');
    }
  });

  const applyPreset = (presetValue) => {
    setPreset(presetValue);
    const selectedPreset = presets.find(p => p.value === presetValue);
    if (selectedPreset) {
      setVoiceVolume(selectedPreset.voiceVol);
      setMusicVolume(selectedPreset.musicVol);
    }
  };

  const toggleVoiceover = (id) => {
    setSelectedVoiceovers(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const generateMix = async () => {
    setIsGenerating(true);
    try {
      await createMixMutation.mutateAsync({
        name: projectName,
        voiceover_ids: selectedVoiceovers,
        music_url: selectedMusic,
        music_source: musicSource,
        voice_volume: voiceVolume,
        music_volume: musicVolume,
        auto_ducking: autoDucking,
        preset: preset,
        status: 'processing'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Audio Mixer"
        description="Combine voice and music into polished audio"
        icon={Music2}
        backTo="MixerList"
        gradient="from-indigo-500 to-violet-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Name */}
          <GlassCard className="p-6" hover={false}>
            <Label className="text-slate-400">Project Name</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Audio Mix"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </GlassCard>

          {/* Select Voiceovers */}
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">Select Voiceovers</h3>
            
            {voiceovers.length === 0 ? (
              <div className="text-center py-8">
                <Volume2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No completed voiceovers available</p>
                <Button variant="outline" className="mt-4 border-slate-700">
                  Create Voiceover First
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {voiceovers.map(vo => (
                  <button
                    key={vo.id}
                    onClick={() => toggleVoiceover(vo.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedVoiceovers.includes(vo.id)
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedVoiceovers.includes(vo.id)
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-800'
                    }`}>
                      {selectedVoiceovers.includes(vo.id) && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{vo.title}</p>
                      <p className="text-sm text-slate-400">{vo.voice_name || 'Default Voice'}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                      <Play className="w-4 h-4" />
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Background Music */}
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">Background Music</h3>
            
            <div className="flex gap-2 mb-4">
              <Button
                variant={musicSource === 'library' ? 'default' : 'outline'}
                onClick={() => setMusicSource('library')}
                className={musicSource === 'library' ? 'bg-violet-600' : 'border-slate-700'}
              >
                Music Library
              </Button>
              <Button
                variant={musicSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setMusicSource('upload')}
                className={musicSource === 'upload' ? 'bg-violet-600' : 'border-slate-700'}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload
              </Button>
            </div>

            {musicSource === 'library' ? (
              <div className="space-y-2">
                {musicLibrary.map(track => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedMusic(track.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedMusic === track.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedMusic === track.id
                        ? 'bg-violet-500'
                        : 'bg-slate-800'
                    }`}>
                      <Music2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{track.name}</p>
                      <p className="text-sm text-slate-400">{track.duration}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                      <Play className="w-4 h-4" />
                    </Button>
                  </button>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                <p className="text-white font-medium">Upload Music File</p>
                <p className="text-sm text-slate-400">MP3, WAV supported</p>
                <Button variant="outline" className="mt-4 border-slate-700">
                  Choose File
                </Button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Presets */}
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">Presets</h3>
            <Select value={preset} onValueChange={applyPreset}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {presets.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>

          {/* Volume Controls */}
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">Volume Controls</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-slate-400">Voice Volume</Label>
                  <span className="text-white font-medium">{voiceVolume}%</span>
                </div>
                <Slider
                  value={[voiceVolume]}
                  onValueChange={([v]) => { setVoiceVolume(v); setPreset('custom'); }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-slate-400">Music Volume</Label>
                  <span className="text-white font-medium">{musicVolume}%</span>
                </div>
                <Slider
                  value={[musicVolume]}
                  onValueChange={([v]) => { setMusicVolume(v); setPreset('custom'); }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label className="text-white">Auto Music Ducking</Label>
                  <p className="text-xs text-slate-500">Lower music when voice plays</p>
                </div>
                <Switch checked={autoDucking} onCheckedChange={setAutoDucking} />
              </div>
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={generateMix}
              disabled={!projectName || selectedVoiceovers.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 h-12"
            >
              {isGenerating ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Mixing...</>
              ) : (
                <><Music2 className="w-5 h-5 mr-2" /> Generate Mix</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}