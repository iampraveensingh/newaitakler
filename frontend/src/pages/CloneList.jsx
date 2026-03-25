import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Plus, Search, Trash2,
  Star, MoreVertical, Clock, Volume2
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

export default function CloneList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: clones = [], isLoading } = useQuery({
    queryKey: ['clones'],
    queryFn: () => base44.entities.VoiceClone.list('-created_at')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VoiceClone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['clones']);
      toast.success('Voice clone deleted');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.VoiceClone.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries(['clones'])
  });

  const filteredClones = clones.filter(clone => 
    clone.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getModeColor = (mode) => {
    switch (mode) {
      case 'quick': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'studio': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Voice Clones"
        description="Manage your AI voice clones"
        icon={Copy}
        gradient="from-blue-500 to-cyan-500"
        actions={
          <Link to={createPageUrl('CloneVoice')}>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500">
              <Plus className="w-4 h-4 mr-2" /> New Clone
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
            placeholder="Search clones..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </GlassCard>

      {/* Clone Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-48 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredClones.length === 0 ? (
        <EmptyState
          icon={Copy}
          title="No voice clones yet"
          description="Create your first voice clone to get started"
          actionLabel="Clone a Voice"
          actionPage="CloneVoice"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClones.map((clone) => (
              <motion.div
                key={clone.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Volume2 className="w-7 h-7 text-white" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => toggleFavoriteMutation.mutate({ id: clone.id, is_favorite: clone.is_favorite })}
                          className="text-slate-300 focus:text-white focus:bg-slate-700"
                        >
                          <Star className={`w-4 h-4 mr-2 ${clone.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                          {clone.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteMutation.mutate(clone.id)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{clone.name}</h3>
                    {!!clone.is_favorite && (
  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <StatusBadge status={clone.status} size="sm" />
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getModeColor(clone.clone_mode)}`}>
                      {clone.clone_mode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(clone.created_at), 'MMM d, yyyy')}
                    </span>
                    {clone.quality_score && (
                      <span className="text-emerald-400">{clone.quality_score}% quality</span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    {clone.status === 'ready' && (clone.audio_url || clone.sample_url) ? (
                      <>
                        <AudioWaveformPlayer
                          audioUrl={clone.audio_url || clone.sample_url}
                          compact
                        />
                        <Link
                          to={createPageUrl('CreateVoiceover') + `?voiceId=clone_${clone.id}&voiceName=${encodeURIComponent(clone.name)}&voiceType=cloned`}
                          className="block mt-2"
                        >
                          <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500">
                            Use Voice
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <DisabledWaveform
                        compact
                        label={clone.status === 'processing' ? 'Processing…' : clone.status === 'pending' ? 'Pending…' : 'Unavailable'}
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