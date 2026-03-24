import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  BookOpen, ArrowLeft, CheckCircle2, Mic, Music2, PenTool,
  Video, Download, Users, LayoutDashboard, ChevronDown, Sparkles, LogIn
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

const steps = [
  {
    id: 'login',
    step: '01',
    title: 'Log In to Your Account',
    icon: LogIn,
    color: 'from-slate-500 to-slate-600',
    accent: 'text-slate-400',
    ring: 'ring-slate-500/30',
    tasks: [
      'Visit the Expressive Voice App login page.',
      'Enter your ProWebVentures username and password — the same credentials used for the support portal.',
      'Click Sign In. You will be redirected to your Dashboard.',
      'Forgot your password? Click "Forgot Password?" on the login page to receive a reset link by email.',
    ],
    tip: 'Your support portal login and members dashboard login are identical — no separate accounts needed.',
  },
  {
    id: 'dashboard',
    step: '02',
    title: 'Understand Your Dashboard',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-cyan-600',
    accent: 'text-blue-400',
    ring: 'ring-blue-500/30',
    tasks: [
      'The Dashboard shows your monthly usage across every feature.',
      'Check credits remaining, voice clones created, VSL scripts, ad copies, and transcription usage.',
      'Usage stats reset at the start of each billing month.',
      'Use the left sidebar to navigate between all tools and modules.',
    ],
    tip: 'Bookmark the Dashboard — it gives you a live pulse on how much of your plan you have used.',
  },
  {
    id: 'voiceover',
    step: '03',
    title: 'Create Your First Voiceover',
    icon: Mic,
    color: 'from-violet-500 to-purple-600',
    accent: 'text-violet-400',
    ring: 'ring-violet-500/30',
    tasks: [
      'Navigate to Voice Studio → Create Voiceover in the sidebar.',
      'Type or paste your script into the text area.',
      'Select a voice style (professional, conversational, energetic, etc.) and an emotion.',
      'Click Generate — your voiceover is processed and saved to Voice Library instantly.',
      'Play it back, download the MP3, or open it in the Audio Mixer.',
    ],
    tip: 'Keep scripts concise for faster generation. You can always regenerate with tweaked settings — the old file is replaced.',
  },
  {
    id: 'voice-features',
    step: '04',
    title: 'Explore AI Voice Features',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    accent: 'text-pink-400',
    ring: 'ring-pink-500/30',
    tasks: [
      'Clone Voice — upload a short audio sample (30s+) and the AI replicates that voice. Find it under Voice Studio → Clone Voice.',
      'Custom Voice — describe a voice in text (e.g. "warm female voice, slight British accent") and the AI builds it from scratch. No audio needed.',
      'Both cloned and custom voices appear in the voice picker when creating any voiceover.',
      'Manage all clones and custom voices from their dedicated library pages in the sidebar.',
    ],
    tip: 'Use Clone Voice for brand consistency (e.g. a spokesperson voice). Use Custom Voice to explore creative character voices.',
  },
  {
    id: 'audio-mixer',
    step: '05',
    title: 'Mix Voiceovers with Background Music',
    icon: Music2,
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    tasks: [
      'Go to Audio Tools → Audio Mixer.',
      'Select one or more voiceovers from your Voice Library.',
      'Pick a background music track from the built-in library or upload your own.',
      'Set the volume balance between voice and music.',
      'Click Generate Mix — the finished file is saved to Mixer Projects.',
      'Download the final MP3 from the Mixer Projects page at any time.',
    ],
    tip: 'Lower background music to 20–30% volume for voiceover-heavy content so the spoken words stay clear.',
  },
  {
    id: 'copy-creator',
    step: '06',
    title: 'Generate Marketing Copy',
    icon: PenTool,
    color: 'from-amber-500 to-orange-600',
    accent: 'text-amber-400',
    ring: 'ring-amber-500/30',
    tasks: [
      'Navigate to Copy Creator in the sidebar.',
      'VSL Copy — enter your product details and choose a tone. The AI generates a full video sales letter script.',
      'Ad Copy — fill in your offer, audience, and goal. The AI produces short-form copy for social ads, email, or landing pages.',
      'Both are saved to their respective libraries (VSL Library / Ad Copy Library) for future editing or reuse.',
    ],
    tip: 'Paste your VSL script directly into Create Voiceover to turn it into professional audio in minutes.',
  },
  {
    id: 'transcribe',
    step: '07',
    title: 'Transcribe Audio & Video',
    icon: Video,
    color: 'from-indigo-500 to-violet-600',
    accent: 'text-indigo-400',
    ring: 'ring-indigo-500/30',
    tasks: [
      'Go to the Transcribe page in the sidebar.',
      'Upload an audio or video file — supported formats: MP3, MP4, WAV, M4A.',
      'Click Transcribe. The AI processes the audio and generates a full text transcript.',
      'Review and copy the transcript, or download it for use in scripts or subtitles.',
    ],
    tip: 'Use transcription to repurpose existing podcast episodes or video recordings into voiceover scripts.',
  },
  {
    id: 'export',
    step: '08',
    title: 'Download & Export Your Work',
    icon: Download,
    color: 'from-cyan-500 to-blue-600',
    accent: 'text-cyan-400',
    ring: 'ring-cyan-500/30',
    tasks: [
      'Voiceovers — open Voice Library, click the download icon on any completed item.',
      'Mixed audio — open Mixer Projects, click the download icon on your mix.',
      'All audio files export as high-quality MP3.',
      'Transcripts can be copied to clipboard directly from the Transcribe page.',
      'If a download does not start, check that your browser allows file downloads from this domain.',
    ],
    tip: 'All your generated assets are stored in the cloud and accessible at any time — no time limits on your saved files.',
  },
  {
    id: 'agency',
    step: '09',
    title: 'Manage Your Agency & Team',
    icon: Users,
    color: 'from-rose-500 to-pink-600',
    accent: 'text-rose-400',
    ring: 'ring-rose-500/30',
    tasks: [
      'Agency is available on PRO and XTREME plans with the Agency add-on enabled.',
      'Go to Agency in the sidebar to add sub-users.',
      'Assign each sub-user a credit balance — they draw from this, not your main account.',
      'Sub-users log in with their own credentials and only see their own work.',
      'Monitor sub-user activity and adjust or revoke access at any time from the Agency dashboard.',
    ],
    tip: 'Use the Agency feature to deliver voiceover and copy services to clients under your own workspace.',
  },
];

export default function GettingStarted() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Getting Started Guide"
        description="Everything you need to go from zero to productive in Expressive Voice App"
        icon={BookOpen}
        gradient="from-blue-500 to-violet-500"
      />

      {/* Back */}
      <button
        onClick={() => navigate(createPageUrl('Support'))}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors duration-150 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-150" />
        Back to Support
      </button>

      {/* Progress bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {steps.map((s) => (
          <div
            key={s.id}
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            title={s.title}
            className={`h-1.5 flex-1 min-w-[24px] rounded-full cursor-pointer transition-all duration-200
              ${expanded === s.id ? `bg-gradient-to-r ${s.color}` : 'bg-white/10 hover:bg-white/20'}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 -mt-4">Click any step below to expand it</p>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isOpen = expanded === step.id;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard
                className={`overflow-hidden transition-all duration-200 ${isOpen ? `ring-1 ${step.ring}` : ''}`}
                hover={!isOpen}
              >
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : step.id)}
                  className="w-full flex items-center gap-4 p-4 sm:p-5 text-left group"
                >
                  {/* Step number + icon */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${step.accent} tracking-wider`}>STEP {step.step}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-white/90 leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5"
                  >
                    <div className="border-t border-white/[0.06] pt-4 space-y-4">
                      {/* Task list */}
                      <ul className="space-y-2.5">
                        {step.tasks.map((task, ti) => (
                          <li key={ti} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${step.accent}`} />
                            <span className="text-sm text-slate-300 leading-relaxed">{task}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Pro tip */}
                      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]`}>
                        <span className="text-base flex-shrink-0">💡</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <span className="font-semibold text-slate-300">Pro tip: </span>
                          {step.tip}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <GlassCard className="p-6 text-center" hover={false}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">You're all set!</h3>
        <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
          Still have questions? Check the FAQ or submit a support ticket and we'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => navigate(createPageUrl('Support'))}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 active:scale-95"
        >
          Back to Support Center
        </button>
      </GlassCard>
    </div>
  );
}
