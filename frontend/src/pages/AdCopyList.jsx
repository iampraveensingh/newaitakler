import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AddonUpgradeCard from '@/components/dashboard/AddonUpgradeCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, Plus, Search, Copy, Trash2, MoreVertical, Clock, Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export default function AdCopyList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: adCopies = [], isLoading } = useQuery({
    queryKey: ['adCopies'],
    queryFn: () => base44.entities.AdCopy.list('-created_at')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdCopy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adCopies']);
      toast.success('Ad copy deleted');
    }
  });

  const filteredAds = adCopies.filter(ad => 
    ad.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: 'bg-blue-500/10 text-blue-400',
      google: 'bg-red-500/10 text-red-400',
      instagram: 'bg-pink-500/10 text-pink-400',
      email: 'bg-emerald-500/10 text-emerald-400',
      linkedin: 'bg-blue-600/10 text-blue-400',
      twitter: 'bg-sky-500/10 text-sky-400'
    };
    return colors[platform] || 'bg-slate-500/10 text-slate-400';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ad Copy Library"
        description="Your promotional ad copies"
        icon={PenTool}
        gradient="from-indigo-500 to-blue-500"
        actions={
          <Link to={createPageUrl('CreateAdCopy')}>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500">
              <Plus className="w-4 h-4 mr-2" /> Create Ad Copy
            </Button>
          </Link>
        }
      />

      <AddonUpgradeCard type="adcopy" addons={currentUser?.addons} />

      <GlassCard className="p-4" hover={false}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ad copies..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-40 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <EmptyState
          icon={PenTool}
          title="No ad copies yet"
          description="Create your first promotional ad copy"
          actionLabel="Create Ad Copy"
          actionPage="CreateAdCopy"
        />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredAds.map((ad) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <PenTool className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{ad.product_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <StatusBadge status={ad.status} size="sm" />
                        <Badge className={`${getPlatformColor(ad.platform)} capitalize`}>
                          {ad.platform}
                        </Badge>
                        <span className="text-slate-300 text-sm capitalize">{ad.style?.replace(/_/g, ' ')}</span>
                      </div>
                      {ad.headline && (
                        <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                          {ad.headline}
                        </p>
                      )}
                      <span className="text-xs text-slate-300 flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(ad.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ad.copy_text && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => {
                            navigator.clipboard.writeText(ad.copy_text);
                            toast.success('Copied!');
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <Link to={createPageUrl(`CreateAdCopy?id=${ad.id}`)}>
                            <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(ad.id)}
                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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