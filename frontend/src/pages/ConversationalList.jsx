import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Search, MessageSquare, Clock, Pencil, Subtitles, Download } from 'lucide-react';
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
import AudioWaveformPlayer from '@/components/audio/AudioWaveformPlayer';
import DisabledWaveform from '@/components/audio/DisabledWaveform';

export default function ConversationalList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversationalVoices'],
    queryFn: () => base44.entities.ConversationalVoice.list('-created_at', 50)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ConversationalVoice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversationalVoices']);
      toast.success('Conversation deleted');
    }
  });

  const filtered = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Conversations"
        description="Your multi-speaker audio projects"
        icon={Users}
        gradient="from-violet-500 to-purple-500"
        actions={
          <Link to={createPageUrl('CreateConversational')}>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 gap-2">
              <Plus className="w-4 h-4" /> New Conversation
            </Button>
          </Link>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-800/30 border border-slate-700/30 p-5">
              <Skeleton className="h-5 w-3/4 bg-slate-700 mb-3" />
              <Skeleton className="h-4 w-1/2 bg-slate-700 mb-2" />
              <Skeleton className="h-4 w-1/3 bg-slate-700" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No conversations yet"
          description="Create your first multi-speaker conversation"
          actionLabel="Create Conversation"
          actionPage="CreateConversational"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard className="p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{conv.title || 'Untitled'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                          </span>
                          {Array.isArray(conv.speakers) && conv.speakers.length > 0 && (
                            <span className="text-xs text-slate-500">
                              · {conv.speakers.length} speaker{conv.speakers.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={conv.status} size="sm" />
                  </div>

                  {conv.segments?.text && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-0.5">
                      {conv.segments.text.slice(0, 160)}{conv.segments.text.length > 160 ? '…' : ''}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800/50">
                    {conv.audio_url ? (
                      <AudioWaveformPlayer audioUrl={conv.audio_url} duration={conv.duration} compact />
                    ) : (
                      <DisabledWaveform compact label={conv.status === 'processing' ? 'Processing...' : 'No audio'} />
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2">
                    {conv.audio_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white gap-1"
                        onClick={async () => {
                          try {
                            const res  = await fetch(conv.audio_url);
                            const blob = await res.blob();
                            const url  = URL.createObjectURL(blob);
                            const a    = document.createElement('a');
                            a.href     = url;
                            a.download = `${conv.title || 'conversation'}.mp3`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch {
                            toast.error('Download failed');
                          }
                        }}
                      >
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    )}
                    {conv.srt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-emerald-400 gap-1"
                        onClick={() => {
                          const blob = new Blob([conv.srt], { type: 'text/plain' });
                          const url  = URL.createObjectURL(blob);
                          const a    = document.createElement('a');
                          a.href     = url;
                          a.download = `${conv.title || 'conversation'}.srt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Subtitles className="w-4 h-4" /> SRT
                      </Button>
                    )}
                    {conv.status === 'draft' && (
                      <Link to={`/CreateConversational?id=${conv.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-violet-400 gap-1">
                          <Pencil className="w-4 h-4" /> Edit
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(conv.id)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
