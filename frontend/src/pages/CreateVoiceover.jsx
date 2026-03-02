import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  AudioLines, Sparkles, RefreshCw, Youtube, FileText, Keyboard, Wand2,
  Volume2, Music, Save, Video, Megaphone
} from 'lucide-react';
import VoiceSelectionSection from '@/components/voice/VoiceSelectionSection';
import BackgroundMusicSection from '@/components/voice/BackgroundMusicSection';
import IconTabs from '@/components/ui/IconTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emotions = [
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'excited', label: 'Excited', emoji: '🎉' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'serious', label: 'Serious', emoji: '🧐' },
  { value: 'friendly', label: 'Friendly', emoji: '🤗' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
];

const sceneModes = [
  { value: 'sales', label: 'Sales', emoji: '💼' },
  { value: 'podcast', label: 'Podcast', emoji: '🎙️' },
  { value: 'story', label: 'Story', emoji: '📚' },
  { value: 'news', label: 'News', emoji: '📰' },
  { value: 'documentary', label: 'Documentary', emoji: '🎬' },
  { value: 'casual', label: 'Casual', emoji: '💬' },
];

// VSL Script Selector Component
function VSLScriptSelector({ onSelectScript }) {
  const { data: vslCopies = [], isLoading } = useQuery({
    queryKey: ['vslCopies'],
    queryFn: () => base44.entities.VSLCopy.list('-created_at', 20)
  });

  const [selectedId, setSelectedId] = useState('');

  const handleSelect = (id) => {
    setSelectedId(id);
    const selected = vslCopies.find(v => v.id === id);
    if (selected?.script) {
      onSelectScript(selected.script);
    }
  };

  if (isLoading) {
    return <div className="mb-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-400 text-center">Loading VSL scripts...</div>;
  }

  if (vslCopies.length === 0) {
    return (
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 text-center">
        <Video className="w-8 h-8 mx-auto mb-2 text-blue-400" />
        <p className="text-slate-300 mb-1">No VSL scripts yet</p>
        <p className="text-xs text-slate-500">Create one in the VSL Copy section first</p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
      <Label className="text-slate-300 mb-2 block">Select a VSL Script</Label>
      <Select value={selectedId} onValueChange={handleSelect}>
        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
          <SelectValue placeholder="Choose from your VSL scripts..." />
        </SelectTrigger>
        <SelectContent>
          {vslCopies.map(vsl => (
            <SelectItem key={vsl.id} value={vsl.id}>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                <span>{vsl.product_name || 'Untitled VSL'}</span>
                <span className="text-xs text-slate-500">({vsl.framework || 'custom'})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Ad Copy Script Selector Component
function AdCopyScriptSelector({ onSelectScript }) {
  const { data: adCopies = [], isLoading } = useQuery({
    queryKey: ['adCopies'],
    queryFn: () => base44.entities.AdCopy.list('-created_at', 20)
  });

  const [selectedId, setSelectedId] = useState('');

  const handleSelect = (id) => {
    setSelectedId(id);
    const selected = adCopies.find(a => a.id === id);
    if (selected?.copy_text) {
      onSelectScript(selected.copy_text);
    }
  };

  if (isLoading) {
    return <div className="mb-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-400 text-center">Loading ad copies...</div>;
  }

  if (adCopies.length === 0) {
    return (
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/20 text-center">
        <Megaphone className="w-8 h-8 mx-auto mb-2 text-orange-400" />
        <p className="text-slate-300 mb-1">No ad copies yet</p>
        <p className="text-xs text-slate-500">Create one in the Ad Copy section first</p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/20">
      <Label className="text-slate-300 mb-2 block">Select an Ad Copy</Label>
      <Select value={selectedId} onValueChange={handleSelect}>
        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
          <SelectValue placeholder="Choose from your ad copies..." />
        </SelectTrigger>
        <SelectContent>
          {adCopies.map(ad => (
            <SelectItem key={ad.id} value={ad.id}>
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-400" />
                <span>{ad.product_name || 'Untitled Ad'}</span>
                <span className="text-xs text-slate-500">({ad.platform || 'general'})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Generation Overlay Component
function GeneratingOverlay({ isVisible, onComplete }) {
  const [stage, setStage] = useState(0);
  const stages = [
    { text: 'Analyzing script...', icon: FileText },
    { text: 'Applying voice settings...', icon: Wand2 },
    { text: 'Finalizing...', icon: Sparkles },
  ];

  useEffect(() => {
    if (!isVisible) {
      setStage(0);
      return;
    }

    const intervals = [800, 1200, 1500, 800, 500];
    let currentStage = 0;

    const advanceStage = () => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setStage(currentStage);
        if (currentStage < stages.length - 1) {
          setTimeout(advanceStage, intervals[currentStage]);
        } else {
          setTimeout(onComplete, 800);
        }
      }
    };

    setTimeout(advanceStage, intervals[0]);
  }, [isVisible]);

  if (!isVisible) return null;

  const CurrentIcon = stages[stage].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center"
    >
      <div className="text-center">
        {/* Animated rings */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-violet-500/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-purple-500/40"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-2 border-pink-500/50"
          />

          {/* Center icon */}
          <motion.div
            key={stage}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              stage === stages.length - 1 
                ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                : 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
              <CurrentIcon className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Stage text */}
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-white mb-4"
        >
          {stages[stage].text}
        </motion.p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === stage ? 1.2 : 1,
                backgroundColor: i <= stage ? '#8b5cf6' : '#334155'
              }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>

        {/* Waveform animation */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [12, 32, 12],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut"
              }}
              className="w-1.5 bg-gradient-to-t from-violet-500 to-purple-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function CreateVoiceover() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showGenerating, setShowGenerating] = useState(false);
    // Tracks the ID of the record created in step 1 (status: processing)
    // so step 2 can UPDATE it instead of creating a duplicate
    const createdIdRef = useRef(null);
    const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    script: '',
    script_source: 'manual',
    voice_type: 'studio',
    voice_id: '',
    voice_name: 'Alex',
    emotion: 'neutral',
    emotion_strength: 'medium',
    scene_mode: 'casual',
    voice_consistency: true,
    background_music: '',
    status: 'draft',
    tags: []
  });
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [scriptMode, setScriptMode] = useState('manual');
  const [aiPrompt, setAiPrompt] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');
  const preselectedVoiceId = urlParams.get('voiceId');
  const preselectedVoiceName = urlParams.get('voiceName');
  const preselectedVoiceType = urlParams.get('voiceType');

  // Set preselected voice on mount
  useEffect(() => {
    if (preselectedVoiceId && preselectedVoiceName && preselectedVoiceType) {
      setFormData(prev => ({
        ...prev,
        voice_id: preselectedVoiceId,
        voice_name: preselectedVoiceName,
        voice_type: preselectedVoiceType
      }));
    }
  }, [preselectedVoiceId, preselectedVoiceName, preselectedVoiceType]);

  // Pre-fill script passed from VSL / Ad Copy pages via sessionStorage
  useEffect(() => {
    const prefill = sessionStorage.getItem('vo_prefill_script');
    if (prefill) {
      setFormData(prev => ({ ...prev, script: prefill, script_source: 'vsl' }));
      sessionStorage.removeItem('vo_prefill_script');
    }
  }, []);

  const { data: existingVoiceover } = useQuery({
    queryKey: ['voiceover', editId],
    queryFn: () => base44.entities.VoiceOver.filter({ id: editId }),
    enabled: !!editId
  });

  useEffect(() => {
    if (existingVoiceover?.[0]) {
      setFormData(existingVoiceover[0]);
    }
  }, [existingVoiceover]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Use createdIdRef first (for the processing→completed update), then editId, then create
      const updateId = createdIdRef.current || editId;
      if (updateId) {
        return base44.entities.VoiceOver.update(updateId, data);
      }
      return base44.entities.VoiceOver.create(data);
    },
    onSuccess: (result) => {
      // On first save (create), store the new record's id so the next save does an update
      if (!createdIdRef.current && !editId && result?.id) {
        createdIdRef.current = result.id;
      }
      queryClient.invalidateQueries({ queryKey: ['voiceovers'] });
      toast.success(editId || createdIdRef.current ? 'Voiceover updated!' : 'Voiceover saved!');
    }
  });

  const generateScript = async () => {
    setIsGeneratingScript(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional voiceover script based on these requirements:
        Keywords/Topic: ${formData.keywords || aiPrompt}
        Scene Mode: ${formData.scene_mode}
        Emotion: ${formData.emotion}
        
        Create a natural, engaging script that fits the specified mood and context.
        The script should be ready to read aloud for text-to-speech conversion.`,
      response_json_schema: {
        type: 'object',
        properties: {
          script: { type: 'string' }
        }
      }
    });
    setFormData(prev => ({ ...prev, script: response.script, script_source: 'ai_generated' }));
    setIsGeneratingScript(false);
  };

  const generateVoiceover = async () => {
    setShowGenerating(true);
    // Step 1: Create (or update if editing) with status 'processing'
    // The mutation's onSuccess will store the new record's ID in createdIdRef
    await saveMutation.mutateAsync({ ...formData, status: 'processing' });
  };

  const handleGenerationComplete = async () => {
    // Step 2: UPDATE the same record (using createdIdRef) with status 'completed'
    // This prevents the double-insert bug
    await saveMutation.mutateAsync({ ...formData, status: 'processing' });

    // Track 1 credit for voiceover generation
    try {
      await base44.trackUsage('credits', 1);
    } catch (e) {
      // Non-blocking — don't prevent navigation if tracking fails
      console.warn('Usage tracking failed:', e);
    } finally {
      queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
    }

    toast.success('Voiceover generated successfully!');
    setTimeout(() => {
      navigate(createPageUrl('VoiceoverList'));
    }, 300);
  };

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );

  const OptionButton = ({ selected, onClick, children, className }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
        selected
          ? "border-violet-500 bg-violet-500/20 text-white"
          : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );

  return (
    <>
      <AnimatePresence>
        <GeneratingOverlay 
          isVisible={showGenerating} 
          onComplete={handleGenerationComplete}
        />
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <PageHeader
        title={editId ? 'Edit Voiceover' : 'Create Voiceover'}
        description="Transform your text into natural-sounding speech"
        icon={AudioLines}
        backTo="VoiceoverList"
        gradient="from-violet-500 to-purple-500"
      />

      {/* Section 1: Project Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6" hover={false}>
          <SectionTitle icon={FileText} title="Project Details" subtitle="Name your project" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-300 mb-2 block">Project Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My Voiceover Project"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2 block">Keywords (optional)</Label>
              <Input
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="marketing, professional, tech"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Section 2: Script */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="p-6" hover={false}>
          <SectionTitle icon={Keyboard} title="Your Script" subtitle="Write or generate your voiceover text" />
          
          {/* Script Mode Toggle */}
          <div className="mb-6">
            <IconTabs
              tabs={[
                { value: 'manual', label: 'Write Manually', icon: Keyboard },
                { value: 'ai', label: 'AI Generate', icon: Sparkles },
                { value: 'youtube', label: 'From YouTube', icon: Youtube },
                { value: 'vsl', label: 'From VSL', icon: Video, badge: 'NEW' },
                { value: 'ad', label: 'From Ad Copy', icon: Megaphone, badge: 'NEW' },
              ]}
              activeTab={scriptMode}
              onTabChange={setScriptMode}
            />
          </div>

          {scriptMode === 'ai' && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20">
              <Label className="text-slate-300 mb-2 block">Describe what you want</Label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="A 30-second ad for a fitness app targeting young professionals..."
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px] mb-3"
              />
              <Button 
                onClick={generateScript} 
                disabled={isGeneratingScript || !aiPrompt}
                className="bg-gradient-to-r from-violet-600 to-purple-600"
              >
                {isGeneratingScript ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Generate Script</>
                )}
              </Button>
            </div>
          )}

          {scriptMode === 'youtube' && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-red-500/5 to-pink-500/5 border border-red-500/20">
              <Label className="text-slate-300 mb-2 block">YouTube/Podcast URL</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                />
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                  <Youtube className="w-4 h-4 mr-2" /> Extract
                </Button>
              </div>
            </div>
          )}

          {scriptMode === 'vsl' && (
            <VSLScriptSelector 
              onSelectScript={(script) => setFormData(prev => ({ ...prev, script, script_source: 'vsl' }))} 
            />
          )}

          {scriptMode === 'ad' && (
            <AdCopyScriptSelector 
              onSelectScript={(script) => setFormData(prev => ({ ...prev, script, script_source: 'ad' }))} 
            />
          )}

          <Textarea
            value={formData.script}
            onChange={(e) => setFormData(prev => ({ ...prev, script: e.target.value }))}
            placeholder="Enter your script here... This text will be converted to speech."
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[180px] text-base leading-relaxed"
          />
          <p className="text-xs text-slate-500 mt-2">{formData.script.length} characters</p>
        </GlassCard>
      </motion.div>

      {/* Section 3: Voice Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6" hover={false}>
          <SectionTitle icon={Volume2} title="Choose a Voice" subtitle="Browse and select from our voice library" />
          <VoiceSelectionSection
            selectedVoiceId={formData.voice_id}
            onSelectVoice={(id, name, type) => setFormData(prev => ({ ...prev, voice_id: id, voice_name: name, voice_type: type }))}
            initialTab={preselectedVoiceType === 'cloned' ? 'cloned' : preselectedVoiceType === 'custom' ? 'custom' : undefined}
          />
        </GlassCard>
      </motion.div>

      {/* Section 4: Voice Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6" hover={false}>
          <SectionTitle icon={Wand2} title="Voice Settings" subtitle="Customize emotion and delivery style" />
          
          <div className="space-y-8">
            {/* Emotion */}
            <div>
              <Label className="text-slate-300 mb-3 block">Emotion</Label>
              <div className="flex flex-wrap gap-2">
                {emotions.map(emotion => (
                  <OptionButton
                    key={emotion.value}
                    selected={formData.emotion === emotion.value}
                    onClick={() => setFormData(prev => ({ ...prev, emotion: emotion.value }))}
                  >
                    <span className="mr-1">{emotion.emoji}</span> {emotion.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Scene Mode */}
            <div>
              <Label className="text-slate-300 mb-3 block">Scene Mode</Label>
              <div className="flex flex-wrap gap-2">
                {sceneModes.map(mode => (
                  <OptionButton
                    key={mode.value}
                    selected={formData.scene_mode === mode.value}
                    onClick={() => setFormData(prev => ({ ...prev, scene_mode: mode.value }))}
                  >
                    <span className="mr-1">{mode.emoji}</span> {mode.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Voice Consistency */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div>
                <Label className="text-white">Voice Consistency</Label>
                <p className="text-sm text-slate-400">Maintain consistent voice throughout the script</p>
              </div>
              <Switch
                checked={formData.voice_consistency}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, voice_consistency: v }))}
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Section 5: Background Music */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard className="p-6" hover={false}>
          <SectionTitle icon={Music} title="Background Music" subtitle="Choose from our library or upload your own" />
          <BackgroundMusicSection
            selectedMusic={formData.background_music || 'none'}
            onSelectMusic={(id) => setFormData(prev => ({ ...prev, background_music: id === 'none' ? '' : id }))}
          />
        </GlassCard>
      </motion.div>

      {/* Section 6: Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={generateVoiceover}
            disabled={!formData.script || showGenerating}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 h-14 text-lg"
          >
            <AudioLines className="w-5 h-5 mr-2" /> Generate Voiceover
          </Button>
          <Button
            onClick={() => saveMutation.mutate(formData)}
            variant="outline"
            className="sm:w-auto border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 h-14 px-8"
          >
            <Save className="w-5 h-5 mr-2" /> Save Draft
          </Button>
        </div>
      </motion.div>
      </div>
      </>
      );
      }