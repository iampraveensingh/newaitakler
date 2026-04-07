import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  Music2, Play, Pause, Volume2, RefreshCw, Check
} from 'lucide-react';
import BackgroundMusicSection from '@/components/voice/BackgroundMusicSection';
import GenerateMixOverlay from '@/components/voice/GenerateMixOverlay';
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


export default function AudioMixer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [projectName, setProjectName] = useState('');
  const [selectedVoiceovers, setSelectedVoiceovers] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState('');
  const [voiceVolume, setVoiceVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(30);
  const [autoDucking, setAutoDucking] = useState(true);
  const [preset, setPreset] = useState('custom');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  const { data: voiceovers = [] } = useQuery({
    queryKey: ['voiceovers'],
    queryFn: () => base44.entities.VoiceOver.filter({ status: 'completed' })
  });

  // Load existing mix when editing
  const { data: existingMix } = useQuery({
    queryKey: ['mix', editId],
    queryFn: () => base44.entities.AudioMix.get(editId),
    enabled: !!editId
  });

  useEffect(() => {
    if (existingMix) {
      setProjectName(existingMix.name || '');
      setSelectedVoiceovers(existingMix.voiceover_ids || []);
      setSelectedMusic(existingMix.music_url || '');
      setVoiceVolume(existingMix.voice_volume ?? 100);
      setMusicVolume(existingMix.music_volume ?? 30);
      setAutoDucking(existingMix.auto_ducking ?? true);
      setPreset(existingMix.preset || 'custom');
    }
  }, [existingMix]);

  const createMixMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioMix.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['mixes'] });
      try {
        await base44.trackUsage('audio_mix', 1);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
      toast.success('Audio mix created!');
    }
  });

  const updateMixMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioMix.update(editId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixes'] });
      queryClient.invalidateQueries({ queryKey: ['mix', editId] });
      toast.success('Audio mix updated!');
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

  const handlePlay = (e, vo) => {
    e.stopPropagation();
    if (!vo.audio_url) return;
    if (playingId === vo.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = vo.audio_url;
      audioRef.current.play().catch(() => setPlayingId(null));
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(vo.id);
    }
  };

  const toggleVoiceover = (id) => {
    setSelectedVoiceovers(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const generateMix = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name.');
      return;
    }
    if (selectedVoiceovers.length === 0) {
      toast.error('Please select at least one voiceover.');
      return;
    }
    setIsGenerating(true);
    setShowOverlay(true);
    const data = {
      name: projectName,
      voiceover_ids: selectedVoiceovers,
      music_url: selectedMusic,
      voice_volume: voiceVolume,
      music_volume: musicVolume,
      auto_ducking: autoDucking,
      preset: preset,
      status: 'pending'
    };
    try {
      if (editId) {
        await updateMixMutation.mutateAsync(data);
      } else {
        await createMixMutation.mutateAsync(data);
      }
    } catch {
      setIsGenerating(false);
      setShowOverlay(false);
    }
  };

  return (
    <>
    <GenerateMixOverlay
      isVisible={showOverlay}
      onComplete={() => {
        setShowOverlay(false);
        setIsGenerating(false);
        navigate(createPageUrl('MixerList'));
      }}
    />
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
            {/* Header — sticky inside the card */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Voiceovers</h3>
              {selectedVoiceovers.length > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {selectedVoiceovers.length} selected
                </span>
              )}
            </div>

            {voiceovers.length === 0 ? (
              <div className="text-center py-8">
                <Volume2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No completed voiceovers available</p>
                <Button variant="outline" className="mt-4 border-slate-700">
                  Create Voiceover First
                </Button>
              </div>
            ) : (
              <div
                className="space-y-2 overflow-y-auto pr-1 mixer-voiceover-list"
                style={{ maxHeight: '320px' }}
              >
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
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                      selectedVoiceovers.includes(vo.id)
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-800'
                    }`}>
                      {selectedVoiceovers.includes(vo.id) && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-white truncate">{vo.title}</p>
                      <p className="text-sm text-slate-400 truncate">{vo.voice_name || 'Default Voice'}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-slate-400 hover:text-white flex-shrink-0"
                      onClick={(e) => handlePlay(e, vo)}
                    >
                      {playingId === vo.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </button>
                ))}
              </div>
            )}

            <style>{`
              .mixer-voiceover-list::-webkit-scrollbar { width: 5px; }
              .mixer-voiceover-list::-webkit-scrollbar-track { background: transparent; }
              .mixer-voiceover-list::-webkit-scrollbar-thumb { background: #334155; border-radius: 999px; }
              .mixer-voiceover-list::-webkit-scrollbar-thumb:hover { background: #475569; }
              .mixer-voiceover-list { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
            `}</style>
          </GlassCard>

          {/* Background Music */}
          <BackgroundMusicSection
            selectedMusic={selectedMusic}
            onSelectMusic={(id, _name, url) => setSelectedMusic(id === 'none' ? '' : (url || id))}
          />
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
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> {editId ? 'Updating...' : 'Mixing...'}</>
              ) : (
                <><Music2 className="w-5 h-5 mr-2" /> {editId ? 'Update Mix' : 'Generate Mix'}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}