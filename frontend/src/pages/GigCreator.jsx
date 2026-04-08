import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import GigResultCard from '@/components/gigs/GigResultCard';
import GigGenerateOverlay from '@/components/gigs/GigGenerateOverlay';
import { toast } from 'sonner';

const GIG_SCHEMA = {
  type: 'object',
  properties: {
    gig_title:       { type: 'string' },
    gig_description: { type: 'string' },
    category:        { type: 'string' },
    subcategory:     { type: 'string' },
    basic_package: {
      type: 'object',
      properties: { title: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' }, delivery_days: { type: 'number' }, revisions: { type: 'number' } },
      required: ['title', 'description', 'price', 'delivery_days', 'revisions'],
    },
    standard_package: {
      type: 'object',
      properties: { title: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' }, delivery_days: { type: 'number' }, revisions: { type: 'number' } },
      required: ['title', 'description', 'price', 'delivery_days', 'revisions'],
    },
    premium_package: {
      type: 'object',
      properties: { title: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' }, delivery_days: { type: 'number' }, revisions: { type: 'number' } },
      required: ['title', 'description', 'price', 'delivery_days', 'revisions'],
    },
    search_tags:  { type: 'array', items: { type: 'string' } },
    faq: {
      type: 'array',
      items: {
        type: 'object',
        properties: { question: { type: 'string' }, answer: { type: 'string' } },
        required: ['question', 'answer'],
      },
    },
    requirements: { type: 'array', items: { type: 'string' } },
  },
  required: ['gig_title', 'gig_description', 'basic_package', 'standard_package', 'premium_package', 'search_tags', 'faq'],
};

const examples = [
  'Professional voiceover for ads and explainer videos',
  'Natural female narration for audiobooks and podcasts',
  'Energetic male voice for YouTube intros and commercials',
  'Calm, soothing voiceover for meditation and wellness apps',
  'Character voices for animation and video games',
  'Corporate voiceover for e-learning and training videos',
];

export default function GigCreator() {
  const [serviceInput, setServiceInput] = useState('');
  const [generating, setGenerating]     = useState(false);
  const [gigResult, setGigResult]       = useState(null);

  const handleGenerate = async (input) => {
    const desc = input || serviceInput;
    if (!desc.trim()) return;
    setServiceInput(desc);
    setGenerating(true);
    setGigResult(null);

    try {
      const prompt = `You are an expert Fiverr gig optimization specialist. Create a complete, highly optimized Fiverr gig listing for the following service:

Service Description: ${desc}

Create a professional, conversion-optimized gig with:
1. Title: Compelling, SEO-optimized title under 80 characters that starts with "I will"
2. Description: Detailed, engaging description (400-600 words) with sections for what you offer, why choose you, what you need from buyers, and a CTA
3. 3 Packages (Basic, Standard, Premium): Realistic, tiered pricing that makes sense for this service
4. Tags: 5 highly relevant SEO tags (single words or short phrases)
5. FAQ: 4 common questions buyers ask about this type of service, with helpful answers

Make everything specific, professional, and optimized for Fiverr's search algorithm.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: GIG_SCHEMA });
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;

      if (!parsed?.gig_title) {
        toast.error('Failed to generate gig. Please try again.');
        return;
      }
      setGigResult(parsed);
      toast.success('Gig created successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate gig. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Gig Creator"
        description="Describe your service and AI will create a complete, optimized Fiverr gig for you"
        icon={Store}
        gradient="from-emerald-500 to-teal-500"
      />

      {/* Input Section */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-xl">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          What service do you want to offer?
        </label>
        <textarea
          value={serviceInput}
          onChange={(e) => setServiceInput(e.target.value)}
          placeholder="Describe your service in detail... e.g. 'I create professional voiceovers for commercials, explainer videos, and podcasts with natural, engaging delivery'"
          rows={4}
          className="w-full rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />

        <Button
          onClick={() => handleGenerate()}
          disabled={generating || !serviceInput.trim()}
          size="lg"
          className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Fiverr Gig</>
          )}
        </Button>

        {/* Example prompts */}
        <div className="mt-4">
          <span className="text-xs text-slate-500 block mb-2">💡 Try these:</span>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => handleGenerate(ex)}
                disabled={generating}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700/50 hover:border-emerald-500/30 transition-all disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generating Overlay */}
      {generating && <GigGenerateOverlay />}

      {/* Result */}
      {!generating && gigResult && (
        <GigResultCard gig={gigResult} onReset={() => { setGigResult(null); setServiceInput(''); }} />
      )}
    </div>
  );
}
