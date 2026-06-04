import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Play, ArrowLeft, LayoutDashboard, Mic, Sparkles,
  PenTool, BookOpen, Briefcase, Layers, Clock,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: 'from-violet-500 to-purple-600',
    accent: 'text-violet-400',
    border: 'border-violet-500/40',
    glow: 'shadow-violet-500/20',
    timestamp: '0:00',
    description: 'Get familiar with the dashboard, your central hub for tracking monthly usage, credits balance, and navigating every feature.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=GRRmr84bEda1BxSi',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
  {
    id: 'voice-studio',
    label: 'Voice Studio',
    icon: Mic,
    color: 'from-pink-500 to-rose-600',
    accent: 'text-pink-400',
    border: 'border-pink-500/40',
    glow: 'shadow-pink-500/20',
    timestamp: '0:23',
    description: 'Learn how to create studio-quality voiceovers, clone voices, build custom AI voices, and manage your full voice library.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=TfZ0NhSt4Wba7TLC&start=23',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
  {
    id: 'brand-studio',
    label: 'Brand Studio',
    icon: Sparkles,
    color: 'from-fuchsia-500 to-purple-600',
    accent: 'text-fuchsia-400',
    border: 'border-fuchsia-500/40',
    glow: 'shadow-fuchsia-500/20',
    timestamp: '15:05',
    description: 'Discover how to build branded projects, design visual assets, and maintain a consistent identity across all your content.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=S3PJ6HhAJXc1QHKW&start=905',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
  {
    id: 'copy-creator',
    label: 'Copy Creator',
    icon: PenTool,
    color: 'from-amber-500 to-orange-600',
    accent: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/20',
    timestamp: '17:45',
    description: 'Generate high-converting VSL scripts and ad copy for any platform including social media, email campaigns, and landing pages.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=X4_m0RfysUC04Z47&start=1065',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
  {
    id: 'audiobook',
    label: 'AudioBook',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
    timestamp: '20:28',
    description: 'Turn any text into a full audiobook with chapter navigation, multiple voices, and professional audio output.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=305wGXxCBhPWHGiq&start=1228',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
  {
    id: 'freelancer-hub',
    label: 'Freelancer Hub',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-600',
    accent: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20',
    timestamp: '21:48',
    description: 'Find freelance jobs, create winning gig listings for Fiverr and Upwork, and start landing clients with AI-powered proposals.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=wqqWUKmmxo_uG1S3&start=1308',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
  {
    id: 'other-features',
    label: 'Other Features',
    icon: Layers,
    color: 'from-cyan-500 to-blue-600',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/40',
    glow: 'shadow-cyan-500/20',
    timestamp: '24:13',
    description: 'Explore the Audio Mixer, Transcription tool, Agency management, and all the additional power features packed into the platform.',
    embedUrl: 'https://www.youtube.com/embed/AH9CGyzi5KI?si=TqFfDed3B7udfJQO&start=1453',
    poster: 'https://app.aitalker.io/uploads/Dashboard.png',
  },
];

export default function VideoTutorials() {
  const [activeId, setActiveId] = useState('dashboard');
  const [playing, setPlaying] = useState(false);
  const navigate = useNavigate();

  const active = SECTIONS.find((s) => s.id === activeId);

  // Reset poster when switching sections
  useEffect(() => { setPlaying(false); }, [activeId]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Video Tutorials"
        description="Learn everything about AI Talker App with step-by-step guides"
        icon={Play}
        gradient="from-violet-500 to-blue-500"
      />

      <button
        onClick={() => navigate(createPageUrl('Support'))}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors duration-150 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-150" />
        Back to Support
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Sidebar ── */}
        <div className="w-full lg:w-60 flex-shrink-0">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-2 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Sections</p>
            {SECTIONS.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive
                      ? `bg-gradient-to-r ${s.color} text-white shadow-lg ${s.glow}`
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <s.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{s.label}</span>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1
                    ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-600'}`}>
                    <Clock className="w-2.5 h-2.5" />
                    {s.timestamp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Video Panel ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Section header */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${active.color} flex items-center justify-center shadow-lg ${active.glow}`}>
                  <active.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{active.label}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className={`w-3 h-3 ${active.accent}`} />
                    <span className={`text-xs font-mono font-medium ${active.accent}`}>Starts at {active.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Video embed */}
              <div className={`relative rounded-2xl overflow-hidden border ${active.border} shadow-2xl ${active.glow}`}>
                {/* Gradient top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${active.color}`} />
                {/* 16:9 responsive wrapper */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {active.poster && !playing ? (
                    /* Poster with play button overlay */
                    <div
                      className="absolute inset-0 cursor-pointer group"
                      onClick={() => setPlaying(true)}
                    >
                      <img
                        src={active.poster}
                        alt={`${active.label} preview`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-200" />
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${active.color} flex items-center justify-center shadow-2xl ${active.glow}`}
                        >
                          <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      key={activeId}
                      src={active.poster && playing ? `${active.embedUrl}&autoplay=1` : active.embedUrl}
                      title={`${active.label} Tutorial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full bg-black"
                      style={{ border: 0 }}
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <p className="text-sm text-slate-300 leading-relaxed">{active.description}</p>
              </div>

              {/* Section pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {SECTIONS.filter((s) => s.id !== activeId).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-white text-xs font-medium transition-all duration-150"
                  >
                    <s.icon className="w-3 h-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
