import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AudioLines, Sparkles, RefreshCw, Youtube, FileText, Keyboard, Wand2,
  Volume2, Music, Save, Video, Megaphone, Loader2, CheckCircle, Clock
} from 'lucide-react';
import VoiceSelectionSection from '@/components/voice/VoiceSelectionSection';
import BackgroundMusicSection from '@/components/voice/BackgroundMusicSection';
import CustomEmotionInput from '@/components/voice/CustomEmotionInput';
import MusicVolumeSlider from '@/components/voice/MusicVolumeSlider';
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

const languages = [
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'da', label: 'Danish' },
  { value: 'nl', label: 'Dutch' },
  { value: 'en', label: 'English' },
  { value: 'fi', label: 'Finnish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'el', label: 'Greek' },
  { value: 'he', label: 'Hebrew' },
  { value: 'hi', label: 'Hindi' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ms', label: 'Malay' },
  { value: 'no', label: 'Norwegian' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'sw', label: 'Swahili' },
  { value: 'sv', label: 'Swedish' },
  { value: 'tr', label: 'Turkish' },
];

const emotions = [
  { value: 'neutral',  label: 'Neutral',  emoji: '😐' },
  { value: 'happy',    label: 'Happy',    emoji: '😊' },
  { value: 'sad',      label: 'Sad',      emoji: '😢' },
  { value: 'excited',  label: 'Excited',  emoji: '🎉' },
  { value: 'calm',     label: 'Calm',     emoji: '😌' },
  { value: 'serious',  label: 'Serious',  emoji: '🧐' },
  { value: 'friendly', label: 'Friendly', emoji: '🤗' },
  { value: 'angry',    label: 'Angry',    emoji: '😠' },
];

const sceneModes = [
  { value: 'sales',        label: 'Sales',        emoji: '💼' },
  { value: 'podcast',      label: 'Podcast',      emoji: '🎙️' },
  { value: 'story',        label: 'Story',        emoji: '📚' },
  { value: 'news',         label: 'News',         emoji: '📰' },
  { value: 'documentary',  label: 'Documentary',  emoji: '🎬' },
  { value: 'casual',       label: 'Casual',       emoji: '💬' },
];

// ─── VSL Script Selector ──────────────────────────────────────────────────────
function VSLScriptSelector({ onSelectScript }) {
  const { data: vslCopies = [], isLoading } = useQuery({
    queryKey: ['vslCopies'],
    queryFn: () => base44.entities.VSLCopy.list('-created_at', 20)
  });
  const [selectedId, setSelectedId] = useState('');

  const handleSelect = (id) => {
    setSelectedId(id);
    const selected = vslCopies.find(v => v.id === id);
    if (selected?.script) onSelectScript(selected.script);
  };

  if (isLoading) return <div className="mb-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-400 text-center">Loading VSL scripts...</div>;
  if (vslCopies.length === 0) return (
    <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 text-center">
      <Video className="w-8 h-8 mx-auto mb-2 text-blue-400" />
      <p className="text-slate-300 mb-1">No VSL scripts yet</p>
      <p className="text-xs text-slate-500">Create one in the VSL Copy section first</p>
    </div>
  );

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

// ─── Ad Copy Script Selector ──────────────────────────────────────────────────
function AdCopyScriptSelector({ onSelectScript }) {
  const { data: adCopies = [], isLoading } = useQuery({
    queryKey: ['adCopies'],
    queryFn: () => base44.entities.AdCopy.list('-created_at', 20)
  });
  const [selectedId, setSelectedId] = useState('');

  const handleSelect = (id) => {
    setSelectedId(id);
    const selected = adCopies.find(a => a.id === id);
    if (selected?.copy_text) onSelectScript(selected.copy_text);
  };

  if (isLoading) return <div className="mb-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-slate-400 text-center">Loading ad copies...</div>;
  if (adCopies.length === 0) return (
    <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/20 text-center">
      <Megaphone className="w-8 h-8 mx-auto mb-2 text-orange-400" />
      <p className="text-slate-300 mb-1">No ad copies yet</p>
      <p className="text-xs text-slate-500">Create one in the Ad Copy section first</p>
    </div>
  );

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

// ─── Generation Overlay ───────────────────────────────────────────────────────
// Reflects the real flow: data is saved & queued — audio is generated by cron.
const SAVE_STAGES = [
  { text: 'Saving your project…',     sub: 'Writing script and voice settings to the database', icon: Save      },
  { text: 'Applying voice settings…', sub: 'Locking in emotion, scene mode, and voice profile',  icon: Wand2     },
  { text: 'Queuing for generation…',  sub: 'Adding your voiceover to the processing queue',       icon: Clock     },
];

function GeneratingOverlay({ isVisible, onComplete }) {
  const [stage,    setStage]    = useState(0);
  const [queued,   setQueued]   = useState(false); // show confirmation card
  const [countdown, setCountdown] = useState(4);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isVisible) { setStage(0); setQueued(false); setCountdown(4); return; }

    const intervals = [700, 900, 800];
    let current = 0;

    const advance = () => {
      if (current < SAVE_STAGES.length - 1) {
        current++;
        setStage(current);
        setTimeout(advance, intervals[current]);
      } else {
        // All stages done — switch to queued confirmation card
        setTimeout(() => setQueued(true), 600);
      }
    };
    setTimeout(advance, intervals[0]);
  }, [isVisible]); // eslint-disable-line

  // Countdown once the queued card appears, then fire onComplete
  useEffect(() => {
    if (!queued) return;
    if (countdown <= 0) { onCompleteRef.current(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [queued, countdown]);

  if (!isVisible) return null;
  const { icon: CurrentIcon, text, sub } = SAVE_STAGES[stage];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {!queued ? (
          /* ── Saving stages ── */
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            {/* Spinning rings + icon */}
            <div className="relative w-36 h-36 mx-auto mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-violet-500/30" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border-2 border-purple-500/40" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border-2 border-indigo-500/50" />
              <motion.div
                key={stage}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1,  rotate: 0    }}
                transition={{ type: 'spring', damping: 14 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <CurrentIcon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.p key={`t-${stage}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-white mb-2">
              {text}
            </motion.p>
            <motion.p key={`s-${stage}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              {sub}
            </motion.p>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2">
              {SAVE_STAGES.map((_, i) => (
                <motion.div key={i}
                  animate={{ scale: i === stage ? 1.3 : 1, backgroundColor: i <= stage ? '#8b5cf6' : '#334155' }}
                  className="w-2 h-2 rounded-full"
                />
              ))}
            </div>
          </motion.div>

        ) : (
          /* ── Queued confirmation card ── */
          <motion.div
            key="queued"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1,  scale: 1,   y: 0  }}
            transition={{ type: 'spring', damping: 18 }}
            className="w-full max-w-sm"
          >
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-2xl shadow-emerald-500/10">
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-1">Voiceover Queued!</h2>
              <p className="text-sm text-slate-400 mb-6">
                Your project has been saved. The audio will be generated shortly via our processing pipeline.
              </p>

              {/* Info checklist */}
              <div className="space-y-2.5 text-left mb-6">
                {[
                  { label: 'Script & settings saved',       color: 'text-emerald-400' },
                  { label: 'Voice profile applied',          color: 'text-emerald-400' },
                  { label: 'Added to generation queue',      color: 'text-emerald-400' },
                  { label: 'Check Voiceover List for status', color: 'text-slate-300'  },
                ].map(({ label, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1,  x: 0  }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Countdown */}
              <p className="text-xs text-slate-500">
                Redirecting to Voiceover List in{' '}
                <span className="font-semibold text-violet-400">{countdown}s</span>…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateVoiceover() {
  const queryClient  = useQueryClient();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [showGenerating, setShowGenerating] = useState(false);

  // Tracks the ID from step-1 create so step-2 does an UPDATE (prevents double-insert)
  const createdIdRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    // Pre-fill from navigation state (e.g. "Turn into Voiceover" from Ad Copy)
    const prefill      = location.state?.prefillScript || '';
    const prefillTitle = location.state?.prefillTitle  || '';
    return {
      title:                     prefillTitle,
      keywords:                  '',
      script:                    prefill,
      script_source:             'manual',
      voice_type:                'studio',
      voice_id:                  '',
      voice_name:                'Alex',
      voice_url:                 '',
      language:                  'en',
      emotion:                   'neutral',
      emotion_strength:          'medium',
      scene_mode:                'casual',
      voice_consistency:         true,
      background_music:          '',
      background_music_enabled:  false,
      background_music_volume:   30,
      status:                    'draft',
      tags:                      [],
    };
  });

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptMode,          setScriptMode]         = useState('manual');
  const [aiPrompt,            setAiPrompt]           = useState('');
  const [youtubeUrl,          setLinkUrl]            = useState('');
  const [isExtractingScript,  setIsExtractingScript] = useState(false);

  // Custom emotion
  const [isCustomEmotion, setIsCustomEmotion] = useState(false);
  const [customEmotion,   setCustomEmotion]   = useState('');

  // Background music toggle + volume
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicVolume,  setMusicVolume]  = useState(30);

  const urlParams             = new URLSearchParams(window.location.search);
  const editId                = urlParams.get('id');
  const preselectedVoiceId    = urlParams.get('voiceId');
  const preselectedVoiceName  = urlParams.get('voiceName');
  const preselectedVoiceType  = urlParams.get('voiceType');

  useEffect(() => {
    if (preselectedVoiceId && preselectedVoiceName && preselectedVoiceType) {
      setFormData(prev => ({
        ...prev,
        voice_id:   preselectedVoiceId,
        voice_name: preselectedVoiceName,
        voice_type: preselectedVoiceType,
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
    queryFn:  () => base44.entities.VoiceOver.filter({ id: editId }),
    enabled:  !!editId,
  });

  useEffect(() => {
    if (existingVoiceover?.[0]) {
      const vo = existingVoiceover[0];
      setFormData(vo);
      const isPredefined = emotions.some(e => e.value === vo.emotion);
      if (vo.emotion && !isPredefined) {
        setIsCustomEmotion(true);
        setCustomEmotion(vo.emotion);
      }
      if (vo.background_music_enabled) setMusicEnabled(true);
      if (vo.background_music_volume)  setMusicVolume(vo.background_music_volume);
    }
  }, [existingVoiceover]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const updateId = createdIdRef.current || editId;
      if (updateId) return base44.entities.VoiceOver.update(updateId, data);
      return base44.entities.VoiceOver.create(data);
    },
    onSuccess: (result) => {
      if (!createdIdRef.current && !editId && result?.id) {
        createdIdRef.current = result.id;
      }
      queryClient.invalidateQueries({ queryKey: ['voiceovers'] });
    },
  });

  const handleExtractScript = async () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) return;
    setIsExtractingScript(true);
    try {
      const isYoutube = /youtube\.com|youtu\.be/i.test(trimmed);
      let rawText = '';
      let label = '';

      if (isYoutube) {
        const result = await base44.integrations.Core.ExtractScript({ url: trimmed });
        rawText = result.script || '';
        label = result.title || '';
      } else {
        const result = await base44.integrations.Core.ScrapePage({ url: trimmed });
        rawText = result.bodyText || '';
        label = result.title || '';
      }

      const cleaned = rawText
        .replace(/>>+/g, '')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!cleaned) {
        toast.error('No content could be extracted from this URL.');
        return;
      }

      setFormData(prev => ({ ...prev, script: cleaned, script_source: 'youtube' }));
      toast.success(label ? `Content extracted: "${label}"` : 'Content extracted successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to extract content from this URL.');
    } finally {
      setIsExtractingScript(false);
    }
  };

  const generateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional voiceover script based on these requirements:
        Keywords/Topic: ${formData.keywords || aiPrompt}
        Scene Mode: ${formData.scene_mode}
        Emotion: ${formData.emotion}

        Create a natural, engaging script that fits the specified mood and context.
        The script should be ready to read aloud for text-to-speech conversion.`,
        response_json_schema: { type: 'object', properties: { script: { type: 'string' } } },
      });
      setFormData(prev => ({ ...prev, script: response.script, script_source: 'ai_generated' }));
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateVoiceover = async () => {
    if (!formData.script.trim()) {
      toast.error('Please enter a script before generating.');
      return;
    }
    if (formData.script.trim().length < 3) {
      toast.error('Script is too short. Please enter at least a few words.');
      return;
    }
    if (!formData.voice_id) {
      toast.error('Please select a voice before generating.');
      return;
    }
    if (musicEnabled && !formData.background_music) {
      toast.error('Please select a background music track or turn off the Background Music toggle.');
      return;
    }
    setShowGenerating(true);
    await saveMutation.mutateAsync({ ...formData, status: 'pending' });
  };

  const handleGenerationComplete = async () => {
    await saveMutation.mutateAsync({ ...formData, status: 'pending' });
    try {
      const wordCount = formData.script
        ? formData.script.trim().split(/\s+/).filter(Boolean).length
        : 1;
      await base44.trackUsage('credits', Math.max(1, wordCount));
    } catch (e) {
      console.warn('Usage tracking failed:', e);
    } finally {
      queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
    }
    // Force-refetch so VoiceoverList has fresh data immediately on mount
    await queryClient.refetchQueries({ queryKey: ['voiceovers'], type: 'all' });
    toast.success('Voiceover queued — audio will be ready shortly!');
    navigate(createPageUrl('VoiceoverList'));
  };

  // ─── Sub-components ─────────────────────────────────────────────────────────
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
        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
        selected
          ? 'border-violet-500 bg-violet-500/20 text-white'
          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        <GeneratingOverlay isVisible={showGenerating} onComplete={handleGenerationComplete} />
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

            <div className="mb-6">
              <IconTabs
                tabs={[
                  { value: 'manual',  label: 'Write Manually', icon: Keyboard },
                  { value: 'ai',      label: 'AI Generate',    icon: Sparkles },
                  { value: 'youtube', label: 'From YouTube',   icon: Youtube  },
                  { value: 'vsl',     label: 'From VSL',       icon: Video,    badge: 'NEW' },
                  { value: 'ad',      label: 'From Ad Copy',   icon: Megaphone, badge: 'NEW' },
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
                <Button onClick={generateScript} disabled={isGeneratingScript || !aiPrompt}
                  className="bg-gradient-to-r from-violet-600 to-purple-600">
                  {isGeneratingScript
                    ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    : <><Wand2 className="w-4 h-4 mr-2" /> Generate Script</>
                  }
                </Button>
              </div>
            )}

            {scriptMode === 'youtube' && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-red-500/5 to-pink-500/5 border border-red-500/20">
                <Label className="text-slate-300 mb-2 block">YouTube, Article, or Podcast URL</Label>
                <div className="flex gap-3">
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or any article / podcast URL"
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleExtractScript()}
                  />
                  <Button
                    onClick={handleExtractScript}
                    disabled={!youtubeUrl.trim() || isExtractingScript}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shrink-0"
                  >
                    {isExtractingScript
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching...</>
                      : <><Youtube className="w-4 h-4 mr-2" /> Extract</>
                    }
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Paste a YouTube link to extract captions, or any article/podcast URL to scrape its content.</p>
              </div>
            )}

            {scriptMode === 'vsl' && (
              <VSLScriptSelector onSelectScript={(script) => setFormData(prev => ({ ...prev, script, script_source: 'vsl' }))} />
            )}

            {scriptMode === 'ad' && (
              <AdCopyScriptSelector onSelectScript={(script) => setFormData(prev => ({ ...prev, script, script_source: 'ad' }))} />
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
              onSelectVoice={(id, name, type, url) => setFormData(prev => ({ ...prev, voice_id: id, voice_name: name, voice_type: type, voice_url: url || '' }))}
              initialTab={preselectedVoiceType === 'cloned' ? 'cloned' : preselectedVoiceType === 'custom' ? 'custom' : undefined}
            />
          </GlassCard>
        </motion.div>

        {/* Section 4: Voice Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6" hover={false}>
            <SectionTitle icon={Wand2} title="Voice Settings" subtitle="Customize emotion and delivery style" />

            <div className="space-y-8">

              {/* Language */}
              <div>
                <Label className="text-slate-300 mb-2 block">Language</Label>
                <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emotion */}
              <div className={formData.language !== 'en' ? 'opacity-40 pointer-events-none select-none' : ''}>
                <Label className="text-slate-300 mb-3 block">
                  Emotion
                  {formData.language !== 'en' && <span className="ml-2 text-xs text-slate-500">(English only)</span>}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {emotions.map(emotion => (
                    <OptionButton
                      key={emotion.value}
                      selected={!isCustomEmotion && formData.emotion === emotion.value}
                      onClick={() => {
                        setIsCustomEmotion(false);
                        setCustomEmotion('');
                        setFormData(prev => ({ ...prev, emotion: emotion.value }));
                      }}
                    >
                      <span className="mr-1">{emotion.emoji}</span> {emotion.label}
                    </OptionButton>
                  ))}

                  {/* Custom emotion button */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsCustomEmotion(true);
                      setFormData(prev => ({ ...prev, emotion: customEmotion || '' }));
                    }}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: isCustomEmotion
                        ? '1.5px solid rgba(196,140,255,0.9)'
                        : '1.5px solid rgba(167,139,250,0.7)',
                      boxShadow: isCustomEmotion
                        ? '0 0 12px rgba(139,92,246,0.6), 0 0 30px rgba(168,85,247,0.4), inset 0 0 12px rgba(139,92,246,0.15)'
                        : '0 0 10px rgba(139,92,246,0.35), 0 0 25px rgba(168,85,247,0.2)',
                    }}
                    className={cn(
                      'relative px-5 py-2 rounded-xl text-sm font-semibold transition-all overflow-hidden',
                      isCustomEmotion
                        ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 text-violet-200 hover:text-white',
                    )}
                  >
                    {/* Glow behind button */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(90deg,rgba(139,92,246,0.4),rgba(236,72,153,0.4),rgba(139,92,246,0.4))', filter: 'blur(8px)', zIndex: -1 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ['-150%', '250%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                    />
                    <span className="relative flex items-center gap-1.5">
                      <motion.span
                        animate={isCustomEmotion ? { rotate: [0, 15, -15, 0] } : { scale: [1, 1.3, 1] }}
                        transition={{ duration: isCustomEmotion ? 0.6 : 1.8, repeat: Infinity, repeatDelay: isCustomEmotion ? 2 : 0.8 }}
                      >
                        ✨
                      </motion.span>
                      Custom
                      {!isCustomEmotion && (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="ml-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-400"
                        >
                          new
                        </motion.span>
                      )}
                    </span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {isCustomEmotion && (
                    <CustomEmotionInput
                      value={customEmotion}
                      onChange={(val) => {
                        setCustomEmotion(val);
                        setFormData(prev => ({ ...prev, emotion: val }));
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Scene Mode */}
              <div className={formData.language !== 'en' ? 'opacity-40 pointer-events-none select-none' : ''}>
                <Label className="text-slate-300 mb-3 block">
                  Scene Mode
                  {formData.language !== 'en' && <span className="ml-2 text-xs text-slate-500">(English only)</span>}
                </Label>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Music className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Background Music</h3>
                  <p className="text-sm text-slate-400">
                    {musicEnabled ? 'Choose from our library or upload your own' : 'Enable to add background music'}
                  </p>
                </div>
              </div>
              <Switch
                checked={musicEnabled}
                onCheckedChange={(v) => {
                  setMusicEnabled(v);
                  setFormData(prev => ({
                    ...prev,
                    background_music_enabled: v,
                    ...(v ? {} : { background_music: '' }),
                  }));
                }}
              />
            </div>

            <AnimatePresence>
              {musicEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                    {/* Volume slider — only shown once a track is selected */}
                    <AnimatePresence>
                      {formData.background_music && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <MusicVolumeSlider
                      value={musicVolume}
                      onChange={(v) => {
                        setMusicVolume(v);
                        setFormData(prev => ({ ...prev, background_music_volume: v }));
                      }}
                    />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <BackgroundMusicSection
                      selectedMusic={formData.background_music || 'none'}
                      onSelectMusic={(id, _name, url) => setFormData(prev => ({ ...prev, background_music: id === 'none' ? '' : (url || id) }))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              onClick={() => saveMutation.mutate(formData, { onSuccess: () => toast.success('Draft saved successfully!') })}
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
