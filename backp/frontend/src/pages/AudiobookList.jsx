import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, Search, BookMarked, Clock,
  Pencil, Download, Loader2, Globe, Filter, MoreVertical,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import AudioWaveformPlayer from '@/components/audio/AudioWaveformPlayer';
import DisabledWaveform from '@/components/audio/DisabledWaveform';
import { toast } from 'sonner';
import { format } from 'date-fns';

const LANGUAGE_LABELS = {
  en: 'English', ar: 'Arabic', zh: 'Chinese', da: 'Danish', nl: 'Dutch',
  fi: 'Finnish', fr: 'French', de: 'German', el: 'Greek', he: 'Hebrew',
  hi: 'Hindi', it: 'Italian', ja: 'Japanese', ko: 'Korean', ms: 'Malay',
  no: 'Norwegian', pl: 'Polish', pt: 'Portuguese', ru: 'Russian',
  es: 'Spanish', sw: 'Swahili', sv: 'Swedish', tr: 'Turkish',
};

export default function AudiobookList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: audiobooks = [], isLoading } = useQuery({
    queryKey: ['audiobooks'],
    queryFn: () => base44.entities.Audiobook.list('-created_at', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Audiobook.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['audiobooks']);
      toast.success('Audiobook deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handleDownload = async (url, title) => {
    if (!url) return;
    const filename = `${title || 'audiobook'}.mp3`;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
    }
  };

  const filtered = audiobooks.filter(ab => {
    const matchesSearch = (ab.title || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = audiobooks.filter(a => a.status === 'completed').length;
  const pendingCount   = audiobooks.filter(a => a.status === 'pending' || a.status === 'processing').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audiobooks"
        description="Your AI-generated audiobook projects"
        icon={BookOpen}
        gradient="from-amber-500 to-orange-500"
        actions={
          <Link to={createPageUrl('AudiobookCreator')}>
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 gap-2">
              <Plus className="w-4 h-4" /> New Audiobook
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      {audiobooks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',     value: audiobooks.length, color: 'text-slate-300'  },
            { label: 'Completed', value: completedCount,     color: 'text-emerald-400' },
            { label: 'Pending',   value: pendingCount,       color: 'text-amber-400'  },
          ].map(({ label, value, color }) => (
            <GlassCard key={label} className="p-3 text-center" hover={false}>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Filters */}
      <GlassCard className="p-4" hover={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audiobooks…"
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-800/50 border-slate-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <GlassCard key={i} className="h-52 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No audiobooks yet"
          description="Upload an eBook and convert it into an AI-narrated audiobook."
          action={
            <Link to={createPageUrl('AudiobookCreator')}>
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 gap-2">
                <Plus className="w-4 h-4" /> New Audiobook
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((ab, i) => {
              const isCompleted  = ab.status === 'completed';
              const isPending    = ab.status === 'pending' || ab.status === 'processing';
              const canEdit      = !isPending;
              const langLabel    = LANGUAGE_LABELS[ab.language] || ab.language || '';

              return (
                <motion.div
                  key={ab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard className="p-5 h-full">
                    <div className="flex flex-col h-full">

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                            <BookMarked className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate leading-tight mb-1">
                              {ab.title || 'Untitled Audiobook'}
                            </h3>
                            <StatusBadge status={ab.status} size="sm" />
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white -mt-1 -mr-2 shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            {canEdit && (
                              <Link to={`${createPageUrl('AudiobookCreator')}?id=${ab.id}`}>
                                <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                                  <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {isCompleted && ab.audio_url && (
                              <DropdownMenuItem
                                onClick={() => handleDownload(ab.audio_url, ab.title)}
                                className="text-slate-200 focus:text-white focus:bg-slate-700"
                              >
                                <Download className="w-4 h-4 mr-2" /> Download
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(ab.id)}
                              disabled={deleteMutation.isPending || isPending}
                              className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {isPending ? 'Cannot delete while processing' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Meta */}
                      <div className="flex-1 space-y-1.5 text-xs text-slate-400 mb-4">
                        {ab.created_at && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            {format(new Date(ab.created_at), 'MMM d, yyyy')}
                          </div>
                        )}
                        {ab.voice_name && (
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3 shrink-0" />
                            {ab.voice_name}
                          </div>
                        )}
                        {langLabel && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3 shrink-0" />
                            {langLabel}
                          </div>
                        )}
                        {ab.original_file && (
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="shrink-0">📄</span>
                            <span className="truncate">{ab.original_file}</span>
                          </div>
                        )}
                      </div>

                      {/* Waveform Player */}
                      <div className="pt-3 border-t border-slate-700/50">
                        {isCompleted && ab.audio_url ? (
                          <AudioWaveformPlayer
                            audioUrl={ab.audio_url}
                            compact
                          />
                        ) : (
                          <DisabledWaveform
                            compact
                            label={
                              isPending    ? 'Processing…' :
                              ab.status === 'draft'  ? 'Draft'       :
                              ab.status === 'error'  ? 'Error'       : 'Unavailable'
                            }
                          />
                        )}

                        {/* Download button below player */}
                        {isCompleted && ab.audio_url && (
                          <div className="flex justify-end mt-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDownload(ab.audio_url, ab.title)}
                              className="text-slate-400 hover:text-amber-400"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {isPending && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating audio…
                          </div>
                        )}
                      </div>

                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
