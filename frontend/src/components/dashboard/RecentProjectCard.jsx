import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Pause, Star, Download, Trash2, Clock, Mic, FileText, Video, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

const typeConfig = {
  voiceover: { 
    gradient: 'from-violet-500 to-purple-600', 
    bg: 'bg-violet-500/10', 
    text: 'text-violet-400',
    label: 'Voiceover',
    icon: Mic
  },
  clone: { 
    gradient: 'from-cyan-500 to-blue-600', 
    bg: 'bg-cyan-500/10', 
    text: 'text-cyan-400',
    label: 'Voice Clone',
    icon: Copy
  },
  vsl: { 
    gradient: 'from-emerald-500 to-teal-600', 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-400',
    label: 'VSL Script',
    icon: FileText
  },
  transcription: { 
    gradient: 'from-amber-500 to-orange-600', 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-400',
    label: 'Transcription',
    icon: Video
  },
};

// Fake waveform bars for visual effect
const WaveformBars = ({ isPlaying, gradient }) => (
  <div className="flex items-center gap-0.5 h-8">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className={`w-1 rounded-full bg-gradient-to-t ${gradient}`}
        initial={{ height: 4 + Math.random() * 12 }}
        animate={isPlaying ? {
          height: [4 + Math.random() * 12, 8 + Math.random() * 20, 4 + Math.random() * 12],
        } : { height: 4 + Math.random() * 12 }}
        transition={isPlaying ? {
          duration: 0.4 + Math.random() * 0.3,
          repeat: Infinity,
          repeatType: "reverse",
        } : {}}
      />
    ))}
  </div>
);

export default function RecentProjectCard({ 
  project, 
  type,
  icon: Icon,
  editPage,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const config = typeConfig[type] || typeConfig.voiceover;
  const title = project.title || project.name || project.product_name;
  const hasAudio = project.audio_url && project.status === 'completed';
  const duration = project.duration || 0;

  const handlePlayPause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.audio_url) {
      const a = document.createElement('a');
      a.href = project.audio_url;
      a.download = `${title}.mp3`;
      a.click();
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get project details based on type
  const getProjectDetails = () => {
    if (type === 'voiceover') {
      return [
        project.voice_name && { label: 'Voice', value: project.voice_name },
        project.emotion && { label: 'Emotion', value: project.emotion },
        project.scene_mode && { label: 'Scene', value: project.scene_mode },
      ].filter(Boolean);
    }
    if (type === 'clone') {
      return [
        project.clone_mode && { label: 'Mode', value: project.clone_mode },
        project.language && { label: 'Language', value: project.language.toUpperCase() },
      ].filter(Boolean);
    }
    if (type === 'vsl') {
      return [
        project.framework && { label: 'Framework', value: project.framework.toUpperCase() },
        project.tone && { label: 'Tone', value: project.tone },
      ].filter(Boolean);
    }
    if (type === 'transcription') {
      return [
        project.source_type && { label: 'Source', value: project.source_type },
        project.output_format && { label: 'Format', value: project.output_format.toUpperCase() },
      ].filter(Boolean);
    }
    return [];
  };

  const details = getProjectDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-slate-600/70 overflow-hidden"
    >
      {/* Hidden audio element */}
      {hasAudio && (
        <audio 
          ref={audioRef} 
          src={project.audio_url}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        />
      )}

      {/* Top gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

      <div className="relative p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                {config.label}
              </span>
              {project.is_favorite === 1 && (
  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
)}
            </div>
            <h4 className="font-semibold text-white text-sm line-clamp-1 leading-tight">{title}</h4>
          </div>

          <StatusBadge status={project.status} size="sm" />
        </div>

        {/* Waveform & Play Section (for audio projects) */}
        {hasAudio && (
          <div className="mb-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                onClick={handlePlayPause}
                className={`h-10 w-10 rounded-full bg-gradient-to-br ${config.gradient} hover:opacity-90 shadow-lg flex-shrink-0`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </Button>
              
              <div className="flex-1 overflow-hidden">
                <WaveformBars isPlaying={isPlaying} gradient={config.gradient} />
              </div>
              
              <div className="text-xs text-slate-400 font-mono flex-shrink-0">
                {formatDuration(isPlaying ? currentTime : 0)} / {formatDuration(duration)}
              </div>
            </div>
          </div>
        )}

        {/* Project Details */}
        {details.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {details.slice(0, 3).map((detail, idx) => (
              <div key={idx} className="text-xs px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="text-slate-500">{detail.label}: </span>
                <span className="text-slate-300 capitalize">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(project.created_at), 'MMM d, h:mm a')}
          </div>
          
          <div className="flex items-center gap-1">
            {hasAudio && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownload}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Link to={createPageUrl(`${editPage}?id=${project.id}`)}>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}