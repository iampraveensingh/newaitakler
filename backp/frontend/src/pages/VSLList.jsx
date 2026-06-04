import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AddonUpgradeCard from '@/components/dashboard/AddonUpgradeCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Search, Copy, Download, Trash2, 
  MoreVertical, Clock, Mic
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

export default function VSLList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: vslCopies = [], isLoading } = useQuery({
    queryKey: ['vslCopies'],
    queryFn: () => base44.entities.VSLCopy.list('-created_at')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VSLCopy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vslCopies']);
      toast.success('VSL deleted');
    }
  });

  const filteredVSL = vslCopies.filter(vsl => 
    vsl.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  const copyScript = (script) => {
    navigator.clipboard.writeText(script);
    toast.success('Script copied!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="VSL Library"
        description="Your video sales letter scripts"
        icon={FileText}
        gradient="from-rose-500 to-pink-500"
        actions={
          <Link to={createPageUrl('CreateVSL')}>
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500">
              <Plus className="w-4 h-4 mr-2" /> New VSL
            </Button>
          </Link>
        }
      />

      <AddonUpgradeCard type="vsl" addons={currentUser?.addons} currentPlan={currentUser?.base_plan} />

      {/* Search */}
      <GlassCard className="p-4" hover={false}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VSL copies..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </GlassCard>

      {/* VSL List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-32 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filteredVSL.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No VSL copies yet"
          description="Create your first video sales letter script"
          actionLabel="Create VSL"
          actionPage="CreateVSL"
        />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredVSL.map((vsl) => (
              <motion.div
                key={vsl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{vsl.product_name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                        <StatusBadge status={vsl.status} size="sm" />
                        <span className="text-slate-300 capitalize">
                          {vsl.framework?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(vsl.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {vsl.hook && (
                        <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                          "{vsl.hook.slice(0, 150)}..."
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {vsl.script && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => copyScript(vsl.script)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      <Link to={createPageUrl('CreateVoiceover')}>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-violet-400">
                          <Mic className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <Link to={createPageUrl(`CreateVSL?id=${vsl.id}`)}>
                            <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="text-slate-200 focus:text-white focus:bg-slate-700">
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(vsl.id)}
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