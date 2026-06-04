import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music2, Plus, Search, Download, Trash2,
  MoreVertical, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import AudioWaveformPlayer from '@/components/audio/AudioWaveformPlayer';
import DisabledWaveform from '@/components/audio/DisabledWaveform';
import { format } from 'date-fns';
import { toast } from 'sonner';

const downloadFile = async (url, filename) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'mix.mp3';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    console.error('Download failed:', e);
    window.open(url, '_blank');
  }
};

export default function MixerList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: mixes = [], isLoading } = useQuery({
    queryKey: ['mixes'],
    queryFn: () => base44.entities.AudioMix.list('-created_at')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AudioMix.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['mixes']);
      toast.success('Mix deleted');
    }
  });

  const filteredMixes = mixes.filter(mix => 
    mix.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mixer Projects"
        description="Your audio mix creations"
        icon={Music2}
        gradient="from-indigo-500 to-violet-500"
        actions={
          <Link to={createPageUrl('AudioMixer')}>
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500">
              <Plus className="w-4 h-4 mr-2" /> New Mix
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <GlassCard className="p-4" hover={false}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mixes..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </GlassCard>

      {/* Mix List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-24 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredMixes.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No mixes yet"
          description="Create your first audio mix"
          actionLabel="Create Mix"
          actionPage="AudioMixer"
        />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredMixes.map((mix) => (
              <motion.div
                key={mix.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-5">
                  {/* Header row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{mix.name || 'Untitled Mix'}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                        <StatusBadge status={mix.status} size="sm" />
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(mix.created_at), 'MMM d, yyyy')}
                        </span>
                        {mix.preset && mix.preset !== 'custom' && (
                          <span className="text-slate-400 capitalize">Preset: {mix.preset}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {mix.status === 'completed' && mix.output_url && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-white"
                          onClick={() => downloadFile(mix.output_url, `${mix.name || 'mix'}.mp3`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <Link to={createPageUrl(`AudioMixer?id=${mix.id}`)}>
                            <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(mix.id)}
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Waveform row */}
                  <div className="pt-3 border-t border-slate-700/50">
                    {mix.status === 'completed' && mix.output_url ? (
                      <AudioWaveformPlayer audioUrl={mix.output_url} compact />
                    ) : (
                      <DisabledWaveform
                        compact
                        label={
                          mix.status === 'processing' ? 'Processing…'
                          : mix.status === 'pending'    ? 'Pending…'
                          : 'Unavailable'
                        }
                      />
                    )}
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