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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function BrandStudio() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [stage, setStage]               = useState('input');
  const [analysisStep, setAnalysisStep] = useState('scraping');
  const [brandData, setBrandData]       = useState(null);
  const [savedId, setSavedId]           = useState(null);
  const [isLoading, setIsLoading]       = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BrandStudioProject.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries(['brandProjects']);
      try {
        await base44.trackUsage('brand_studio', 1);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BrandStudioProject.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['brandProjects']),
  });

  const handleUrlSubmit = async (url) => {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;

    setIsLoading(true);
    setStage('analyzing');
    setAnalysisStep('scraping');

    try {
      // Step 1 — show "Scraping Website" for a moment, then advance
      await sleep(800);
      setAnalysisStep('analyzing');

      // Step 2 — call backend: scrape + DeepSeek analysis
      const result = await base44.integrations.Core.AnalyzeBrand({ url: normalizedUrl });

      // Step 3 — show "Crafting VSL Script"
      setAnalysisStep('generating_vsl');
      await sleep(800);

      // Step 4 — done
      setAnalysisStep('done');
      await sleep(600);

      // Build the project record
      const profile = result.brand_voice_profile || {};
      const generatedData = {
        title: result.brand_name || extractBrandName(normalizedUrl),
        website_url: normalizedUrl,
        brand_voice_profile: {
          ...profile,
          vsl_sections: result.vsl_sections || {},
        },
        vsl_script: result.vsl_script || '',
        voice_prompt: profile.voice_prompt || '',
        additional_scripts: [],
        status: 'draft',
      };

      // Save to DB
      const saved = await createMutation.mutateAsync(generatedData);
      setSavedId(saved.id);
      setBrandData({ ...generatedData, id: saved.id });
      setStage('review');
    } catch (err) {
      console.error('Brand analysis failed:', err);
      toast.error('Analysis failed. Please check the URL and try again.');
      setStage('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updated) => {
    setBrandData(prev => ({ ...prev, ...updated }));
    if (savedId) {
      await updateMutation.mutateAsync({ id: savedId, data: updated });
    }
  };

  const handleGenerateVoiceover = async () => {
    // Save as 'pending' — cron job will handle actual voice generation
    if (savedId) {
      await updateMutation.mutateAsync({ id: savedId, data: { status: 'pending' } });
    }


    setStage('rendering');

    // Wait for the overlay countdown (4s) then redirect
    await sleep(4200);
    toast.success('Brand project queued for voiceover generation!');
    navigate(createPageUrl('BrandStudioList'));
  };

  return (
    <>
      <AnimatePresence>
        {stage === 'analyzing' && (
          <AnalysisOverlay key="analysis" currentStep={analysisStep} />
        )}
        {stage === 'rendering' && (
          <RenderingOverlay key="render" />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto pb-12">
        {stage === 'input' && (
          <UrlInputStep onSubmit={handleUrlSubmit} isLoading={isLoading} />
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

function extractBrandName(url) {
  try {
    return new URL(url).hostname
      .replace('www.', '')
      .split('.')[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  } catch {
    return 'My Brand';
  }
}
