import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, BookOpen, Mic, Music2, PenTool, Video, Users, ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

const categories = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-600',
    glow: 'violet',
    tutorials: [
      { title: 'Welcome to Expressive Voice App', duration: '3:12', description: 'A quick overview of everything the app can do and how to navigate the interface.' },
      { title: 'Setting Up Your Account', duration: '2:45', description: 'How to log in, understand your plan, and configure your workspace for the first time.' },
      { title: 'Understanding Your Dashboard', duration: '4:01', description: 'Reading your monthly usage stats, credits balance, and navigating to each feature.' },
    ],
  },
  {
    id: 'voice-studio',
    label: 'Voice Studio',
    icon: Mic,
    color: 'from-pink-500 to-rose-600',
    glow: 'pink',
    tutorials: [
      { title: 'Creating Your First Voiceover', duration: '5:20', description: 'Step-by-step walkthrough — write a script, pick a voice style, generate, and download.' },
      { title: 'Voice Library & Editing', duration: '3:55', description: 'How to manage, re-edit, and regenerate saved voiceovers from your library.' },
      { title: 'Clone Voice — Upload & Train', duration: '6:14', description: 'Upload an audio sample, train your clone, and use it across voiceover projects.' },
      { title: 'Create a Custom AI Voice', duration: '4:38', description: 'Design a brand-new voice using text descriptions — no audio sample needed.' },
    ],
  },
  {
    id: 'audio-tools',
    label: 'Audio Tools',
    icon: Music2,
    color: 'from-blue-500 to-cyan-600',
    glow: 'blue',
    tutorials: [
      { title: 'Using the Audio Mixer', duration: '5:47', description: 'Combine voiceovers with background music, adjust volumes, and export polished audio.' },
      { title: 'Managing Mixer Projects', duration: '2:30', description: 'How to save, revisit, and download your completed mixer projects.' },
    ],
  },
  {
    id: 'copy-creator',
    label: 'Copy Creator',
    icon: PenTool,
    color: 'from-amber-500 to-orange-600',
    glow: 'amber',
    tutorials: [
      { title: 'Generating VSL Copy', duration: '4:22', description: 'Create compelling video sales letter scripts tailored to your product or offer.' },
      { title: 'Creating Ad Copy', duration: '3:40', description: 'Produce short-form ads for social media, email campaigns, and landing pages.' },
      { title: 'Managing Your Copy Libraries', duration: '2:15', description: 'Organise, search, and reuse saved VSL and Ad Copy from your libraries.' },
    ],
  },
  {
    id: 'transcription',
    label: 'Transcription',
    icon: Video,
    color: 'from-emerald-500 to-teal-600',
    glow: 'emerald',
    tutorials: [
      { title: 'Transcribing Audio & Video Files', duration: '3:58', description: 'Upload MP3, MP4, WAV, or M4A files and get an accurate AI-generated transcript.' },
      { title: 'Downloading & Using Transcripts', duration: '2:10', description: 'Copy or export transcripts and use them in your voiceover scripts or marketing copy.' },
    ],
  },
  {
    id: 'agency',
    label: 'Agency & Teams',
    icon: Users,
    color: 'from-indigo-500 to-violet-600',
    glow: 'indigo',
    tutorials: [
      { title: 'Setting Up Your Agency', duration: '5:05', description: 'Enable the Agency add-on, create sub-users, and assign credit allocations.' },
      { title: 'Managing Sub-Users & Credits', duration: '3:30', description: 'Monitor sub-user activity, adjust balances, and remove users when needed.' },
    ],
  },
];

const glowMap = {
  violet: 'shadow-violet-500/20',
  pink: 'shadow-pink-500/20',
  blue: 'shadow-blue-500/20',
  amber: 'shadow-amber-500/20',
  emerald: 'shadow-emerald-500/20',
  indigo: 'shadow-indigo-500/20',
};

export default function VideoTutorials() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const navigate = useNavigate();

  const current = categories.find((c) => c.id === activeCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Video Tutorials"
        description="Learn everything about Expressive Voice App with step-by-step guides"
        icon={Play}
        gradient="from-violet-500 to-blue-500"
      />

      {/* Back to Support */}
      <button
        onClick={() => navigate(createPageUrl('Support'))}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors duration-150 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-150" />
        Back to Support
      </button>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Category Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <GlassCard className="p-3" hover={false}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Categories</p>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const isActive = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg ${glowMap[cat.glow]}`
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <cat.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                      {cat.tutorials.length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </GlassCard>
        </div>

        {/* Tutorial Cards */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Category heading */}
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg`}>
                <current.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{current.label}</h2>
                <p className="text-xs text-slate-500">{current.tutorials.length} tutorials</p>
              </div>
            </div>

            {current.tutorials.map((tutorial, i) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <GlassCard className="p-4 group cursor-pointer" hover>
                  <div className="flex items-start gap-4">
                    {/* Play button */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors duration-150 leading-snug">
                          {tutorial.title}
                        </h3>
                        <span className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{tutorial.description}</p>
                    </div>

                    <ChevronRight className="flex-shrink-0 w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-150 mt-1" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
