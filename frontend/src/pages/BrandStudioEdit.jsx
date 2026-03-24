import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import BrandHeader from '@/components/brand/edit/BrandHeader';
import BrandVoiceSection from '@/components/brand/edit/BrandVoiceSection';
import ScriptsList from '@/components/brand/edit/ScriptsList';
import RenderingOverlay from '@/components/brand/RenderingOverlay';

const RENDER_STEPS = ['preparing', 'voice_synth', 'processing', 'finalizing', 'done'];
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function BrandStudioEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [renderStep, setRenderStep] = useState('preparing');
  const [isRendering, setIsRendering] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['brandProject', projectId],
    queryFn: async () => {
      const all = await base44.entities.BrandStudioProject.filter({ id: projectId });
      return all[0] || null;
    },
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.BrandStudioProject.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brandProject', projectId]);
      queryClient.invalidateQueries(['brandProjects']);
      toast.success('Changes saved');
    },
  });

  const handleHeaderUpdate = (data) => updateMutation.mutate(data);

  const handleVoiceUpdate = (profile) => {
    updateMutation.mutate({ brand_voice_profile: profile });
  };

  const handleScriptsUpdate = (scripts) => {
    updateMutation.mutate({ additional_scripts: scripts });
  };

  const handleGenerateVoiceover = async () => {
    setIsRendering(true);

    for (const step of RENDER_STEPS) {
      setRenderStep(step);
      if (step !== 'done') await sleep(2000);
    }

    await updateMutation.mutateAsync({ status: 'completed' });
    await sleep(600);
    toast.success('Brand voiceover regenerated!');
    navigate(createPageUrl('BrandStudioList'));
  };

  if (!projectId) {
    return (
      <div className="text-center text-slate-400 py-20">No project selected.</div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-slate-400 py-20">Project not found.</div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isRendering && <RenderingOverlay key="render" currentStep={renderStep} />}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        <PageHeader
          title="Edit Brand Project"
          description="Update your brand voice, scripts, and voiceover"
          icon={Wand2}
          backTo="BrandStudioList"
          gradient="from-violet-500 to-pink-500"
        />

        <BrandHeader
          project={project}
          onUpdate={handleHeaderUpdate}
        />

        <BrandVoiceSection
          profile={project.brand_voice_profile || {}}
          onUpdate={handleVoiceUpdate}
        />

        <ScriptsList
          scripts={project.additional_scripts || []}
          onUpdate={handleScriptsUpdate}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleGenerateVoiceover}
            disabled={isRendering}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-500/25 disabled:opacity-50"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Regenerate Voiceover
          </Button>
        </motion.div>
      </div>
    </>
  );
}
