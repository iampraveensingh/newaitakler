import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Plus, Search, Play, Trash2, Star, MoreVertical, 
  Clock, Badge, Crown
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
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CustomVoiceList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: voices = [], isLoading } = useQuery({
    queryKey: ['customVoices'],
    queryFn: () => base44.entities.CustomVoice.list('-created_at')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomVoice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['customVoices']);
      toast.success('Voice deleted');
    }
  });

  const toggleBrandMutation = useMutation({
    mutationFn: ({ id, is_brand_voice }) => base44.entities.CustomVoice.update(id, { is_brand_voice: !is_brand_voice }),
    onSuccess: () => queryClient.invalidateQueries(['customVoices'])
  });

  const filteredVoices = voices.filter(voice => 
    voice.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'professional': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'casual': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'dramatic': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'friendly': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'authoritative': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Custom Voices"
        description="Voices created from your descriptions"
        icon={Sparkles}
        gradient="from-amber-500 to-orange-500"
        actions={
          <Link to={createPageUrl('CreateCustomVoice')}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400">
              <Plus className="w-4 h-4 mr-2" /> Create Voice
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
            placeholder="Search voices..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </GlassCard>

      {/* Voice Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-48 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredVoices.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No custom voices yet"
          description="Create a unique AI voice from text description"
          actionLabel="Create Voice"
          actionPage="CreateCustomVoice"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredVoices.map((voice) => (
              <motion.div
                key={voice.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => toggleBrandMutation.mutate({ id: voice.id, is_brand_voice: voice.is_brand_voice })}
                          className="text-slate-300 focus:text-white focus:bg-slate-700"
                        >
                          <Crown className={`w-4 h-4 mr-2 ${voice.is_brand_voice ? 'text-amber-400' : ''}`} />
                          {voice.is_brand_voice ? 'Remove Brand Voice' : 'Set as Brand Voice'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteMutation.mutate(voice.id)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{voice.name}</h3>
                    {!!voice.is_brand_voice && (
  <Crown className="w-4 h-4 text-amber-400" />
)}

{!!voice.is_favorite && (
  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
)}
                  </div>

                  {voice.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{voice.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <StatusBadge status={voice.status} size="sm" />
                    {voice.category && (
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(voice.category)}`}>
                        {voice.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(voice.created_at), 'MMM d, yyyy')}
                    </span>
                    <span>v{voice.generation_version || 1}</span>
                  </div>

                  {voice.status === 'ready' && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2">
                      <Button size="sm" className="flex-1 bg-slate-800 hover:bg-slate-700">
                        <Play className="w-4 h-4 mr-1" /> Preview
                      </Button>
                      <Link to={createPageUrl('CreateVoiceover') + `?voiceId=custom_${voice.id}&voiceName=${encodeURIComponent(voice.name)}&voiceType=custom`} className="flex-1">
                        <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
                          Use Voice
                        </Button>
                      </Link>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}