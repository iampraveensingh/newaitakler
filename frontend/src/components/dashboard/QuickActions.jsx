import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AudioLines, Copy, Sparkles, Video, FileText, Music2,
  Users, PenTool, BookOpen, Briefcase, Store, Layers,
} from 'lucide-react';

const actions = [
  {
    name: 'Voiceover',
    page: 'CreateVoiceover',
    icon: AudioLines,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
    description: 'Text to speech',
    emoji: '🎤',
  },
  {
    name: 'Clone Voice',
    page: 'CloneVoice',
    icon: Copy,
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/30',
    description: 'AI voice clone',
    emoji: '🐑',
  },
  {
    name: 'Custom Voice',
    page: 'CreateCustomVoice',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
    description: 'Design a voice',
    emoji: '✨',
  },
  {
    name: 'Conversation',
    page: 'CreateConversational',
    icon: Users,
    gradient: 'from-fuchsia-500 to-pink-500',
    glow: 'shadow-fuchsia-500/30',
    description: 'Multi-speaker',
    emoji: '👥',
  },
  {
    name: 'Brand Studio',
    page: 'BrandStudio',
    icon: Layers,
    gradient: 'from-indigo-500 to-violet-500',
    glow: 'shadow-indigo-500/30',
    description: 'Brand voiceovers',
    emoji: '🎨',
  },
  {
    name: 'Audio Mixer',
    page: 'AudioMixer',
    icon: Music2,
    gradient: 'from-teal-500 to-cyan-500',
    glow: 'shadow-teal-500/30',
    description: 'Voice & music',
    emoji: '🎛️',
  },
  {
    name: 'Transcribe',
    page: 'Transcribe',
    icon: Video,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
    description: 'Video to text',
    emoji: '🎥',
  },
  {
    name: 'VSL Script',
    page: 'CreateVSL',
    icon: FileText,
    gradient: 'from-rose-500 to-pink-500',
    glow: 'shadow-rose-500/30',
    description: 'Sales scripts',
    emoji: '📋',
  },
  {
    name: 'Ad Copy',
    page: 'CreateAdCopy',
    icon: PenTool,
    gradient: 'from-orange-500 to-red-500',
    glow: 'shadow-orange-500/30',
    description: 'All platforms',
    emoji: '📝',
  },
  {
    name: 'Audiobook',
    page: 'AudiobookCreator',
    icon: BookOpen,
    gradient: 'from-lime-500 to-green-500',
    glow: 'shadow-lime-500/30',
    description: 'eBook to audio',
    emoji: '📖',
  },
  {
    name: 'Job Finder',
    page: 'JobFinder',
    icon: Briefcase,
    gradient: 'from-sky-500 to-blue-500',
    glow: 'shadow-sky-500/30',
    description: 'Find freelance gigs',
    emoji: '🔍',
  },
  {
    name: 'Gig Creator',
    page: 'GigCreator',
    icon: Store,
    gradient: 'from-purple-500 to-fuchsia-500',
    glow: 'shadow-purple-500/30',
    description: 'Build Fiverr gigs',
    emoji: '🛒',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {actions.map((action, i) => (
        <Link key={action.page} to={createPageUrl(action.page)}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, ease: 'easeOut' }}
            whileHover={{ y: -5, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/60 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Subtle background glow on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

            {/* Icon */}
            <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg ${action.glow} group-hover:shadow-xl transition-shadow duration-300`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>

            {/* Text */}
            <h3 className="relative font-semibold text-white text-xs leading-tight mb-0.5">
              {action.name}
            </h3>
            <p className="relative text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors leading-tight">
              {action.description}
            </p>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
