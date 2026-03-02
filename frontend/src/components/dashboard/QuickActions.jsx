import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  AudioLines, Copy, Sparkles, Video, FileText, PenTool, Music2
} from 'lucide-react';

const actions = [
  { 
    name: 'Create Voiceover', 
    page: 'CreateVoiceover', 
    icon: AudioLines, 
    gradient: 'from-violet-500 to-purple-500',
    description: 'Convert text to speech'
  },
  { 
    name: 'Clone Voice', 
    page: 'CloneVoice', 
    icon: Copy, 
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Create AI voice clone'
  },
  { 
    name: 'Custom Voice', 
    page: 'CreateCustomVoice', 
    icon: Sparkles, 
    gradient: 'from-amber-500 to-orange-500',
    description: 'Design unique voice'
  },
  { 
    name: 'Transcribe', 
    page: 'Transcribe', 
    icon: Video, 
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Video to text'
  },
  { 
    name: 'VSL Copy', 
    page: 'CreateVSL', 
    icon: FileText, 
    gradient: 'from-rose-500 to-pink-500',
    description: 'Sales video scripts'
  },
  { 
    name: 'Audio Mixer', 
    page: 'AudioMixer', 
    icon: Music2, 
    gradient: 'from-indigo-500 to-violet-500',
    description: 'Mix voice & music'
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {actions.map((action, i) => (
        <Link key={action.page} to={createPageUrl(action.page)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-700/50 transition-all duration-300 cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{action.name}</h3>
            <p className="text-xs text-slate-300">{action.description}</p>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}