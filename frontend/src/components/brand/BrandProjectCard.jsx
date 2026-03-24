import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Globe, Volume2, Clock, MoreVertical, Trash2, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import AudioWaveformPlayer from '@/components/audio/AudioWaveformPlayer';
import DisabledWaveform from '@/components/audio/DisabledWaveform';
import { format } from 'date-fns';

export default function BrandProjectCard({ project, onDelete, onDownload }) {
  const profile = project?.brand_voice_profile || {};

  const handleDownload = async () => {
    if (!project?.audio_url) return;
    if (onDownload) { onDownload(project); return; }
    try {
      const response = await fetch(project.audio_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title || 'brand-voiceover'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard className="p-5 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate text-sm">{project.title || 'Untitled Brand'}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusBadge status={project.status} size="sm" />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white -mt-1 -mr-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <Link to={createPageUrl(`BrandStudioEdit?id=${project.id}`)}>
                  <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                </Link>
                {project.status === 'completed' && project.audio_url && (
                  <DropdownMenuItem onClick={handleDownload} className="text-slate-200 focus:text-white focus:bg-slate-700">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete?.(project.id)}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta */}
          <div className="flex-1 space-y-1.5 text-xs text-slate-400 mb-3">
            {project.website_url && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{project.website_url.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {profile.tone && (
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Tone: {profile.tone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {project.created_at ? format(new Date(project.created_at), 'MMM d, yyyy') : '—'}
            </div>
          </div>

          {/* Waveform */}
          <div className="pt-3 border-t border-slate-700/50">
            {project.status === 'completed' && project.audio_url ? (
              <AudioWaveformPlayer audioUrl={project.audio_url} duration={project.duration_seconds} compact />
            ) : (
              <DisabledWaveform compact label={
                project.status === 'processing' ? 'Processing…' :
                project.status === 'draft' ? 'Draft' : 'Unavailable'
              } />
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
