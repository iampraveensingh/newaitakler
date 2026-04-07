import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, Search, BookMarked, Clock,
  Pencil, Download, Loader2, Globe,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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

  const filtered = audiobooks.filter(a =>
    (a.title || '').toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search audiobooks…"
          className="pl-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-slate-800/50" />
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
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((ab, i) => {
              const isProcessing = ab.status === 'processing';
              const isCompleted  = ab.status === 'completed';
              const canEdit      = ab.status !== 'processing';
              const langLabel    = LANGUAGE_LABELS[ab.language] || ab.language;

              return (
                <motion.div
                  key={ab.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard className="p-4" hover>
                    <div className="flex items-center gap-4">

                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                        <BookMarked className="w-6 h-6 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-white font-semibold truncate">
                            {ab.title || 'Untitled Audiobook'}
                          </span>
                          <StatusBadge status={ab.status} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          {ab.original_file && (
                            <span className="truncate max-w-[180px]">📄 {ab.original_file}</span>
                          )}
                          {ab.voice_name && (
                            <span>🎙️ {ab.voice_name}</span>
                          )}
                          {ab.language && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {langLabel}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ab.created_at
                              ? formatDistanceToNow(new Date(ab.created_at), { addSuffix: true })
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isProcessing && (
                          <span className="flex items-center gap-1 text-xs text-amber-400 mr-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="hidden sm:inline">Processing</span>
                          </span>
                        )}

                        {isCompleted && ab.audio_url && (
                          <button
                            onClick={() => handleDownload(ab.audio_url, ab.title)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                            title="Download audio"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        {canEdit ? (
                          <Link to={`${createPageUrl('AudiobookCreator')}?id=${ab.id}`}>
                            <button
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Link>
                        ) : (
                          <button
                            disabled
                            title="Editing disabled while processing"
                            className="p-2 rounded-lg text-slate-700 cursor-not-allowed"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteMutation.mutate(ab.id)}
                          disabled={deleteMutation.isPending || isProcessing}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isProcessing ? 'Cannot delete while processing' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
