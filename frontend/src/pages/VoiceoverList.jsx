import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AudioLines, Plus, Search, Filter, Play, Pause, Download,
  Trash2, Star, MoreVertical, Tag, Clock, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function VoiceoverList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  const handleDownload = async (vo) => {
    try {
      const response = await fetch(vo.audio_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vo.title || 'voiceover'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  const handlePlay = (vo) => {
    if (!vo.audio_url) {
      toast.error('No audio available for this voiceover.');
      return;
    }
    if (playingId === vo.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = vo.audio_url;
      audioRef.current.play().catch(() => setPlayingId(null));
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(vo.id);
    }
  };

  const { data: voiceovers = [], isLoading } = useQuery({
    queryKey: ['voiceovers'],
    queryFn: () => base44.entities.VoiceOver.list('-created_at')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VoiceOver.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['voiceovers']);
      toast.success('Voiceover deleted');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.VoiceOver.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries(['voiceovers'])
  });

  const duplicateMutation = useMutation({
    mutationFn: (vo) => base44.entities.VoiceOver.create({
      title: `Copy of ${vo.title || 'Untitled'}`,
      keywords: vo.keywords,
      script: vo.script,
      script_source: vo.script_source,
      voice_type: vo.voice_type,
      voice_id: vo.voice_id,
      voice_name: vo.voice_name,
      emotion: vo.emotion,
      emotion_strength: vo.emotion_strength,
      scene_mode: vo.scene_mode,
      voice_consistency: vo.voice_consistency,
      background_music: vo.background_music,
      tags: vo.tags,
      status: 'draft',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceovers'] });
      toast.success('Voiceover duplicated');
    },
    onError: (error) => {
      toast.error(`Duplicate failed: ${error.message}`);
    },
  });

  const filteredVoiceovers = voiceovers.filter(vo => {
    const matchesSearch = vo.title?.toLowerCase().includes(search.toLowerCase()) ||
                         vo.keywords?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice Library"
        description="Manage all your generated voiceovers"
        icon={AudioLines}
        gradient="from-violet-500 to-purple-500"
        actions={
          <Link to={createPageUrl('CreateVoiceover')}>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
              <Plus className="w-4 h-4 mr-2" /> New Voiceover
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <GlassCard className="p-4" hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search voiceovers..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Voiceover List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-24 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredVoiceovers.length === 0 ? (
        <EmptyState
          icon={AudioLines}
          title="No voiceovers yet"
          description="Create your first voiceover to get started"
          actionLabel="Create Voiceover"
          actionPage="CreateVoiceover"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredVoiceovers.map((vo) => (
              <motion.div
                key={vo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-5 h-full">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{vo.title || 'Untitled'}</h3>
                          {vo.is_favorite === 1 && (
  <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
)}
                        </div>
                        <StatusBadge status={vo.status} size="sm" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white -mt-1 -mr-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <Link to={createPageUrl(`CreateVoiceover?id=${vo.id}`)}>
                            <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => duplicateMutation.mutate(vo)}
                            className="text-slate-200 focus:text-white focus:bg-slate-700"
                          >
                            <Copy className="w-4 h-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(vo.id)}
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 space-y-2 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(vo.created_at), 'MMM d, yyyy')}
                      </div>
                      {vo.voice_name && (
                        <div className="flex items-center gap-2">
                          <AudioLines className="w-3.5 h-3.5" />
                          {vo.voice_name}
                        </div>
                      )}
                      {vo.tags?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5" />
                          {vo.tags.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => handlePlay(vo)}
                        disabled={vo.status !== 'completed'}
                        className={`flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all ${
                          vo.status === 'completed'
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {playingId === vo.id ? (
                          <><Pause className="w-4 h-4" /> Pause</>
                        ) : (
                          <><Play className="w-4 h-4" /> Play</>
                        )}
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleFavoriteMutation.mutate({ id: vo.id, is_favorite: vo.is_favorite })}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        <Star className={`w-4 h-4 ${vo.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </Button>
                      {vo.status === 'completed' && vo.audio_url && (
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => handleDownload(vo)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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