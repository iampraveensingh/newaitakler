import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { createPageUrl } from '@/utils';
import {
  Sparkles, Save, Loader2, AlertTriangle, HelpCircle,
  Copy, Check, Wand2, Volume2, XCircle, User, Wand,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AudioWaveformPlayer from '@/components/audio/AudioWaveformPlayer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Voice Description Dimensions ────────────────────────────────────────────

const dimensions = [
  {
    label: 'Gender',
    emoji: '👤',
    examples: ['Male', 'Female', 'Neutral'],
  },
  {
    label: 'Age',
    emoji: '🎂',
    examples: ['Child (5–12)', 'Teenager (13–18)', 'Young adult (19–35)', 'Middle-aged (36–55)', 'Elderly (55+)'],
  },
  {
    label: 'Pitch',
    emoji: '🎵',
    examples: ['High', 'Medium', 'Low', 'High-pitched', 'Low-pitched'],
  },
  {
    label: 'Pace',
    emoji: '⏱️',
    examples: ['Fast', 'Medium', 'Slow', 'Fast-paced', 'Slow-paced'],
  },
  {
    label: 'Emotion',
    emoji: '😊',
    examples: ['Cheerful', 'Calm', 'Gentle', 'Serious', 'Lively', 'Composed', 'Soothing'],
  },
  {
    label: 'Characteristics',
    emoji: '✨',
    examples: ['Magnetic', 'Crisp', 'Hoarse', 'Mellow', 'Sweet', 'Rich', 'Powerful'],
  },
  {
    label: 'Purpose',
    emoji: '🎯',
    examples: ['News broadcast', 'Ad voice-over', 'Audiobook', 'Animation character', 'Voice assistant', 'Documentary narration'],
  },
];

const examplePrompts = [
  {
    label: 'Fashion / Brand',
    prompt: 'A vibrant young female voice in her early 20s, energetic and lively, with a fast-paced delivery and slightly rising intonation. Perfect for fashion product showcases and trendy brand promotions.',
    tags: ['Female', 'Early 20s', 'Fast-paced', 'Energetic'],
    color: 'from-pink-500 to-fuchsia-500',
  },
  {
    label: 'News / Documentary',
    prompt: 'A calm, confident middle-aged male voice with a slow, steady pace and a deep, magnetic tone. Ideal for news broadcasting, storytelling, and documentary narration.',
    tags: ['Male', 'Middle-aged', 'Deep', 'Authoritative'],
    color: 'from-blue-500 to-indigo-500',
  },
  {
    label: "Kids / Animation",
    prompt: "A playful child's voice (around 8–10 years old), soft and slightly high-pitched with an innocent, cheerful tone. Best suited for animated characters, kids' storytelling, and educational content.",
    tags: ['Child', '8–10 yrs', 'High-pitched', 'Playful'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    label: 'Audiobook / Education',
    prompt: 'A gentle and intelligent female voice in her early 30s, calm and composed with a warm, soothing delivery. Perfect for audiobook narration, guided content, and educational material.',
    tags: ['Female', 'Early 30s', 'Warm', 'Soothing'],
    color: 'from-emerald-500 to-teal-500',
  },
];

const quickPrompts = [
  {
    label: 'News / Documentary',
    emoji: '📰',
    prompt: 'A serious, composed male voice, middle-aged, with a low pitch and slow pace. Magnetic and rich in tone, ideal for news broadcast and documentary narration.',
    tags: ['Male', 'Middle-aged', 'Low pitch', 'Slow-paced'],
    gradient: 'from-blue-500 to-indigo-500',
    border: 'hover:border-blue-500/50',
    glow: 'hover:shadow-blue-500/10',
  },
  {
    label: 'Ad Voice-Over',
    emoji: '📢',
    prompt: 'A lively, cheerful female voice, young adult (19–35), with a high pitch and fast-paced delivery. Crisp and sweet in character, perfect for ad voice-overs and brand promotions.',
    tags: ['Female', 'Young adult', 'High pitch', 'Fast-paced'],
    gradient: 'from-orange-500 to-rose-500',
    border: 'hover:border-orange-500/50',
    glow: 'hover:shadow-orange-500/10',
  },
  {
    label: 'Audiobook',
    emoji: '📖',
    prompt: 'A calm, gentle female voice, middle-aged (36–55), with a medium pitch and slow pace. Mellow and soothing, best suited for audiobook narration and guided educational content.',
    tags: ['Female', 'Middle-aged', 'Mellow', 'Soothing'],
    gradient: 'from-violet-500 to-purple-500',
    border: 'hover:border-violet-500/50',
    glow: 'hover:shadow-violet-500/10',
  },
  {
    label: 'Animation Character',
    emoji: '🎭',
    prompt: 'A cheerful, lively child voice (5–12 years), high-pitched and fast-paced, sweet and playful in character. Perfect for animation characters and kids\' storytelling.',
    tags: ['Child', 'High-pitched', 'Fast-paced', 'Cheerful'],
    gradient: 'from-teal-500 to-cyan-500',
    border: 'hover:border-teal-500/50',
    glow: 'hover:shadow-teal-500/10',
  },
];

const categories = [
  { value: 'professional', label: '💼 Professional' },
  { value: 'casual',       label: '😎 Casual'        },
  { value: 'dramatic',     label: '🎭 Dramatic'       },
  { value: 'friendly',     label: '🤗 Friendly'       },
  { value: 'authoritative',label: '👔 Authoritative'  },
  { value: 'narrative',    label: '📖 Narrative'      },
  { value: 'energetic',    label: '⚡ Energetic'       },
  { value: 'soothing',     label: '🧘 Soothing'       },
  { value: 'commercial',   label: '📢 Commercial'     },
  { value: 'educational',  label: '🎓 Educational'    },
];

const testScripts = [
  "Introducing the all-new SmartFlow Pro — the productivity app that adapts to how you work, not the other way around. Whether you're managing a team or tackling solo projects, SmartFlow keeps everything in sync, so you can focus on what actually matters. Try it free for 30 days. Your best work starts here.",
  "Deep in the heart of the Amazon, where the river bends and the canopy blocks out the sun, Dr. Elena Marsh made a discovery that would change everything she thought she knew about ancient civilizations. The artifact in her hands was unlike anything in any museum — and someone else was looking for it.",
  "Scientists have confirmed that a newly identified mineral compound, found only in the deep-sea trenches of the Pacific Ocean, may hold the key to next-generation battery technology. If early results hold up, it could cut charging times by over eighty percent — and reshape the global energy market within a decade.",
  "Close your eyes. Take a slow, deep breath in — and let it go. You are exactly where you need to be. Each exhale releases tension you've been carrying. Each inhale brings you closer to calm. This is your moment. There's nothing to solve right now. Just breathe, and let yourself rest.",
];

// ─── Voice Generation Loader Card ────────────────────────────────────────────

const GEN_STEPS = [
  'Initializing voice generation…',
  'Processing input text…',
  'Applying tone and style…',
  'Generating audio…',
  'Finalizing output…',
];

function VoiceGeneratingCard({ error, onRetry }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (error) return;
    const t = setInterval(() => {
      setStep(s => (s < GEN_STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(t);
  }, [error]);

  // Reset step when a new generation starts
  useEffect(() => { if (!error) setStep(0); }, [error]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-red-500/30 bg-red-500/5 p-4"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-semibold text-red-300">Generation failed</span>
        </div>
        <p className="text-xs text-red-400/80 leading-relaxed mb-3">{error}</p>
        <button
          onClick={onRetry}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          Try again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4 overflow-hidden relative"
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 pointer-events-none"
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
      />

      {/* Animated sound bars */}
      <div className="flex items-end justify-center gap-[3px] h-10 mb-4">
        {[0.6, 1, 0.75, 1, 0.5, 0.85, 0.65, 1, 0.45, 0.9].map((base, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-orange-400"
            animate={{ scaleY: [base * 0.4, base, base * 0.55, base * 0.9, base * 0.3, base] }}
            transition={{
              duration: 0.9 + (i % 3) * 0.25,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.08,
            }}
            style={{ height: '100%', transformOrigin: 'bottom' }}
          />
        ))}
      </div>

      {/* Status label */}
      <div className="text-center mb-3">
        <p className="text-xs font-semibold text-amber-300 mb-1">Creating Your Voice</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-[11px] text-slate-400 leading-relaxed"
          >
            {GEN_STEPS[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-1.5">
        {GEN_STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width:           i === step ? 14 : 6,
              backgroundColor: i <= step ? '#f59e0b' : '#334155',
            }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Help Modal ───────────────────────────────────────────────────────────────

function VoiceDescriptionHelpModal({ open, onClose, onUsePrompt }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showHint, setShowHint]       = useState(true);
  const scrollRef = useRef(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Hide hint once user has scrolled near the bottom
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 32;
    if (atBottom) setShowHint(false);
  };

  // Reset hint each time the modal opens
  React.useEffect(() => { if (open) setShowHint(true); }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700/60 text-white max-w-2xl p-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-800/60 pr-12">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Voice Description Guide</h2>
            <p className="text-xs text-slate-400 mt-0.5">Write better prompts for richer, expressive voices</p>
          </div>
        </div>

        {/* Single scrollable section — no tabs */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="px-6 py-5 max-h-[62vh] overflow-y-auto space-y-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`[data-modal-scroll]::-webkit-scrollbar{display:none}`}</style>

            {/* ── Dimensions table ── */}
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Key Dimensions
              </p>
              <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="grid grid-cols-[130px_1fr] bg-slate-800/60 border-b border-slate-700/50 px-4 py-2.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Dimension</span>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Examples</span>
                </div>
                {dimensions.map((dim, i) => (
                  <div
                    key={dim.label}
                    className={cn(
                      'grid grid-cols-[130px_1fr] items-start gap-3 px-4 py-2.5',
                      i % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-900/20',
                      i !== dimensions.length - 1 && 'border-b border-slate-700/30'
                    )}
                  >
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-sm">{dim.emoji}</span>
                      <span className="text-sm font-semibold text-white">{dim.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dim.examples.map(ex => (
                        <span key={ex} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 leading-5">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-amber-500/20 px-4 py-2.5 flex items-start gap-2"
                style={{ background: 'rgba(245,158,11,0.05)' }}>
                <span className="text-sm">💡</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Combine <strong className="text-white">4–5 dimensions</strong> — gender, age, pitch, pace, and purpose — for the most expressive, market-ready result.
                </p>
              </div>
            </section>

            {/* ── Example prompts ── */}
            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Example Prompts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {examplePrompts.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/20 overflow-hidden flex flex-col">
                    <div className={`h-1 w-full bg-gradient-to-r ${ex.color}`} />
                    <div className="p-3 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold bg-gradient-to-r ${ex.color} bg-clip-text text-transparent`}>
                          {ex.label}
                        </span>
                        <div className="flex gap-1">
                          {ex.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1 mb-3">"{ex.prompt}"</p>
                      <div className="flex gap-1.5 mt-auto">
                        <Button
                          size="sm"
                          onClick={() => { onUsePrompt(ex.prompt); onClose(); }}
                          className={`h-7 text-xs bg-gradient-to-r ${ex.color} hover:opacity-90 flex-1`}
                        >
                          <Wand2 className="w-3 h-3 mr-1" /> Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(ex.prompt, i)}
                          className="h-7 text-xs border-slate-600 hover:bg-slate-700 px-3"
                        >
                          {copiedIndex === i
                            ? <Check className="w-3 h-3 text-emerald-400" />
                            : <Copy className="w-3 h-3" />
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Scroll hint — hidden once user reaches the bottom */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 flex items-end justify-center pb-2"
                style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.96) 30%, transparent)' }}
              >
                <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Scroll for more
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateCustomVoice() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkLimit } = useUsageLimits();
  const customLimit = checkLimit('custom');
  const [voiceType,    setVoiceType]    = useState('fantasy'); // 'human' | 'fantasy'
  const [showHelp,     setShowHelp]     = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview,      setPreview]      = useState(null); // { output_url, job_id }
  const [genError,     setGenError]     = useState(null); // error message string
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: '',
    style: '',
    use_case: '',
    test_script: testScripts[0],
    category: 'professional',
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomVoice.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['customVoices'] });
      try {
        await base44.trackUsage('custom', 1);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
      toast.success('Voice saved to your library!');
      navigate(createPageUrl('CustomVoiceList'));
    },
    onError: (error) => {
      toast.error(`Failed to save voice: ${error.message}`);
    },
  });

  // Step 1 — Generate: call appropriate API based on voiceType
  const generateVoice = async () => {
    if (!customLimit.allowed) return;
    setIsGenerating(true);
    setPreview(null);
    setGenError(null);
    try {
      let ttsResult;
      if (voiceType === 'fantasy') {
        // Check queue status before proceeding
        const queue = await base44.customVoices.checkQueueStatus();
        if (queue.pending > 1) {
          setGenError("We're experiencing high demand right now. Please try again shortly — your patience is appreciated.");
          return;
        }
        ttsResult = await base44.customVoices.generate({
          description: formData.description,
          tone:        formData.tone,
          style:       formData.style,
          use_case:    formData.use_case,
          test_script: formData.test_script,
        });
      } else {
        // Human Voice API — details to be provided
        ttsResult = await base44.customVoices.generateHuman({
          description: formData.description,
          tone:        formData.tone,
          style:       formData.style,
          use_case:    formData.use_case,
          test_script: formData.test_script,
        });
      }
      setPreview(ttsResult); // { output_url, job_id }
    } catch (err) {
      setGenError(err?.response?.data?.message || 'Voice generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2 — Save: persist the record with the generated audio
  const confirmSave = () => {
    if (!preview) return;
    saveMutation.mutate({
      ...formData,
      audio_url: preview.output_url,
      job_id:    preview.job_id,
      status:    'ready',
    });
  };

  return (
    <>
      <VoiceDescriptionHelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        onUsePrompt={(p) => setFormData(prev => ({ ...prev, description: p }))}
      />

      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        <PageHeader
          title="Create Custom Voice"
          description="Design a unique AI voice from text description"
          icon={Sparkles}
          backTo="CustomVoiceList"
          gradient="from-amber-500 to-orange-500"
        />

        {/* ── Voice Type Selector ── */}
        <GlassCard className="p-5" hover={false}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Voice Type</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: 'human',
                label: 'Human Voice',
                desc: 'Craft realistic, natural-sounding human voices. Perfect for narration, ads, and professional content.',
                examples: ['Male voice', 'Female voice', 'Young adult', 'Deep narrator', 'Soft feminine', 'Authoritative male'],
                icon: User,
                gradient: 'from-blue-500 to-cyan-500',
                activeBorder: 'border-blue-500',
                activeBg: 'bg-blue-500/10',
                activeText: 'text-blue-400',
                activeDot: 'bg-blue-400',
                tagStyle: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
              },
              {
                value: 'fantasy',
                label: 'Fantasy Voice',
                desc: 'Generate imaginative, character-driven voices for animations, games, and creative projects.',
                examples: ['Baby voice', 'Ghost voice', 'Cartoon character', 'Villain voice', 'Fairy tale', 'Robot voice'],
                icon: Wand,
                gradient: 'from-amber-500 to-orange-500',
                activeBorder: 'border-amber-500',
                activeBg: 'bg-amber-500/10',
                activeText: 'text-amber-400',
                activeDot: 'bg-amber-400',
                tagStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
              },
            ].map((opt) => {
              const active = voiceType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setVoiceType(opt.value); setPreview(null); setGenError(null); }}
                  className={cn(
                    'relative text-left p-4 rounded-2xl border-2 transition-all duration-200',
                    active
                      ? `${opt.activeBorder} ${opt.activeBg}`
                      : 'border-slate-700/60 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60'
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className={cn('absolute top-3 right-3 w-2 h-2 rounded-full', opt.activeDot)} />
                  )}
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br',
                    active ? opt.gradient : 'from-slate-700 to-slate-600'
                  )}>
                    <opt.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className={cn('text-sm font-semibold mb-1', active ? opt.activeText : 'text-slate-300')}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{opt.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.examples.map(ex => (
                      <span key={ex} className={cn('text-[10px] px-2 py-0.5 rounded-full border', opt.tagStyle)}>
                        {ex}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
                Voice Details
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Voice Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Give your voice a name"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Voice Description with Help button */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Label className="text-slate-300">Voice Description</Label>
                    <button
                      type="button"
                      onClick={() => setShowHelp(true)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition-all text-xs font-medium"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Guide
                    </button>
                  </div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the voice you want to create in detail. Include gender, age, pitch, pace, emotion, and purpose..."
                    className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Tip: Include gender, age, pitch, pace, and purpose for best results.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div>
                  <Label className="text-slate-300 mb-2 block">Quick Prompts</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickPrompts.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, description: item.prompt }))}
                        className={cn(
                          'group text-left p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 transition-all duration-200 shadow-sm hover:shadow-md',
                          item.border, item.glow
                        )}
                      >
                        {/* Label row */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-sm">{item.emoji}</span>
                          <span className={cn('text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent', item.gradient)}>
                            {item.label}
                          </span>
                        </div>
                        {/* Tags row */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center justify-center whitespace-nowrap text-xs px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40 group-hover:text-slate-300 transition-colors leading-none"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* Prompt preview */}
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed line-clamp-2 transition-colors">
                          "{item.prompt}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Tone</Label>
                    <Input
                      value={formData.tone}
                      onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                      placeholder="e.g., warm, energetic"
                      className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Style</Label>
                    <Input
                      value={formData.style}
                      onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                      placeholder="e.g., conversational, formal"
                      className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Primary Use Case</Label>
                  <Input
                    value={formData.use_case}
                    onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
                    placeholder="e.g., podcast intros, product demos"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Test Script */}
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
                Test Script
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                This script will be used to generate a preview of your custom voice.
              </p>
              <Textarea
                value={formData.test_script}
                onChange={(e) => setFormData(prev => ({ ...prev, test_script: e.target.value }))}
                placeholder="Enter a test script..."
                className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {testScripts.map((script, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, test_script: script }))}
                    className="border-slate-700 text-slate-300 hover:text-white"
                  >
                    Sample {i + 1}
                  </Button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
                Settings
              </h3>
              <div>
                <Label className="text-slate-300">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!customLimit.allowed && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Usage limit reached</p>
                    <p className="text-red-400/80 text-sm mt-0.5">
                      You have used {customLimit.used}/{customLimit.limit === -1 ? '∞' : customLimit.limit} custom voices this month.
                    </p>
                  </div>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={generateVoice}
                disabled={!formData.name || !formData.description || isGenerating || !customLimit.allowed}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 h-12"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {preview ? 'Regenerate' : 'Generate Voice'}
              </Button>

              {/* Loader card — shown while generating */}
              <AnimatePresence>
                {isGenerating && (
                  <VoiceGeneratingCard error={null} />
                )}
              </AnimatePresence>

              {/* Error card — shown after failed generation */}
              <AnimatePresence>
                {genError && !isGenerating && (
                  <VoiceGeneratingCard error={genError} onRetry={generateVoice} />
                )}
              </AnimatePresence>

              {/* Preview card — shown after successful generation */}
              <AnimatePresence>
                {preview && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-sm font-medium text-amber-300">Preview</span>
                    </div>
                    <AudioWaveformPlayer key={preview.output_url} audioUrl={preview.output_url} compact />
                    <Button
                      onClick={confirmSave}
                      disabled={saveMutation.isPending}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 h-11"
                    >
                      {saveMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Voice</>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
