import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import { Wand2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import BrandProjectCard from '@/components/brand/BrandProjectCard';
import { toast } from 'sonner';

export default function BrandStudioList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['brandProjects'],
    queryFn: () => base44.entities.BrandStudioProject.list('-created_at'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BrandStudioProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['brandProjects']);
      toast.success('Brand project deleted');
    },
  });

  const filtered = projects.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.website_url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Projects"
        description="All your AI-generated brand voice packages"
        icon={Wand2}
        gradient="from-violet-500 to-pink-500"
        actions={
          <Link to={createPageUrl('BrandStudio')}>
            <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500">
              <Plus className="w-4 h-4 mr-2" /> New Brand Project
            </Button>
          </Link>
        }
      />

      <GlassCard className="p-4" hover={false}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search brand projects..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-48 animate-pulse" hover={false} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="No brand projects yet"
          description="Create your first brand project to get started"
          actionLabel="New Brand Project"
          actionPage="BrandStudio"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(project => (
              <BrandProjectCard
                key={project.id}
                project={project}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
