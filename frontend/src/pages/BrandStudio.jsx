import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import UrlInputStep from '@/components/brand/UrlInputStep';
import AnalysisOverlay from '@/components/brand/AnalysisOverlay';
import ReviewEditStep from '@/components/brand/ReviewEditStep';
import RenderingOverlay from '@/components/brand/RenderingOverlay';

const ANALYSIS_STEPS = ['scraping', 'analyzing', 'generating_vsl', 'done'];
const RENDER_STEPS   = ['preparing', 'voice_synth', 'processing', 'finalizing', 'done'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function advanceSteps(steps, setStep, msEach = 2000) {
  for (const step of steps) {
    setStep(step);
    if (step !== 'done') await sleep(msEach);
  }
}

export default function BrandStudio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [stage, setStage]       = useState('input');        // input | analyzing | review | rendering
  const [analysisStep, setAnalysisStep] = useState('scraping');
  const [renderStep, setRenderStep]     = useState('preparing');
  const [brandData, setBrandData]       = useState(null);
  const [savedId, setSavedId]           = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BrandStudioProject.create(data),
    onSuccess: () => queryClient.invalidateQueries(['brandProjects']),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BrandStudioProject.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['brandProjects']),
  });

  const handleUrlSubmit = async (url) => {
    setStage('analyzing');

    // Simulate analysis with steps
    for (const step of ANALYSIS_STEPS) {
      setAnalysisStep(step);
      if (step !== 'done') await sleep(2200);
    }

    // Mock generated brand data (in real app, this would call your AI backend)
    const generatedData = {
      title: new URL(url).hostname.replace('www.', '').split('.')[0]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()),
      website_url: url,
      brand_voice_profile: {
        tone: 'Professional & Engaging',
        style: 'Conversational',
        personality: 'Authoritative, Trustworthy',
        target_audience: 'Business professionals and entrepreneurs',
        tagline: 'Empowering your success',
        key_messages: [
          'Quality solutions tailored to your needs',
          'Proven results you can rely on',
          'Expert support every step of the way',
        ],
      },
      vsl_script: `Are you tired of struggling with the same old challenges in your business?\n\nIntroducing a proven solution that changes everything.\n\nAt ${url}, we've helped thousands of entrepreneurs and business owners transform their results with cutting-edge AI-powered tools.\n\nHere's what makes us different: We don't just give you tools — we give you a complete system designed for real results.\n\nOur clients consistently see improvements in productivity, revenue, and customer satisfaction within the first 30 days.\n\nDon't let another day pass without taking action. Click the button below and start your transformation today.\n\nYour success story begins now.`,
      additional_scripts: [],
      status: 'draft',
    };

    // Save to DB
    const result = await createMutation.mutateAsync(generatedData);
    setSavedId(result.id);
    setBrandData({ ...generatedData, id: result.id });
    setStage('review');
  };

  const handleUpdate = async (updated) => {
    setBrandData(prev => ({ ...prev, ...updated }));
    if (savedId) {
      await updateMutation.mutateAsync({ id: savedId, data: updated });
    }
  };

  const handleGenerateVoiceover = async () => {
    setStage('rendering');

    for (const step of RENDER_STEPS) {
      setRenderStep(step);
      if (step !== 'done') await sleep(2000);
    }

    if (savedId) {
      await updateMutation.mutateAsync({ id: savedId, data: { status: 'completed' } });
    }

    await sleep(800);
    toast.success('Brand voiceover generated successfully!');
    navigate(createPageUrl('BrandStudioList'));
  };

  return (
    <>
      <AnimatePresence>
        {stage === 'analyzing' && (
          <AnalysisOverlay key="analysis" currentStep={analysisStep} />
        )}
        {stage === 'rendering' && (
          <RenderingOverlay key="render" currentStep={renderStep} />
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto pb-12">
        {stage === 'input' && (
          <UrlInputStep onSubmit={handleUrlSubmit} isLoading={false} />
        )}

        {stage === 'review' && brandData && (
          <div className="pt-6">
            <ReviewEditStep
              brandData={brandData}
              onUpdate={handleUpdate}
              onGenerateVoiceover={handleGenerateVoiceover}
              isGenerating={false}
            />
          </div>
        )}
      </div>
    </>
  );
}
