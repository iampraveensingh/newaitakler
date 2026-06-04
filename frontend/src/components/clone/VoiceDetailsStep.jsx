import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Wand2, FileText, RefreshCw, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { integrations } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const qualityLevels = [
  { value: 'standard', label: 'Standard', desc: 'Good quality, faster processing', emoji: '⚡' },
  { value: 'premium', label: 'Premium', desc: 'High quality voice clone', emoji: '💎' },
  { value: 'studio', label: 'Studio', desc: 'Best quality, longer processing', emoji: '🎬' },
];

const SAMPLE_SCRIPTS = [
  {
    label: 'Professional Introduction',
    text: "Hello, my name is Alex. I'm a professional consultant with over ten years of experience in business strategy. I help companies achieve their goals through clear communication and innovative thinking. It's a pleasure to connect with you today.",
  },
  {
    label: 'Friendly & Warm',
    text: "Hey there! Thanks so much for tuning in. Today we're going to explore something really exciting together, and I can't wait to share it with you. Whether you're new here or a long-time listener, I'm glad you're with us.",
  },
  {
    label: 'News & Narration',
    text: "Good evening. Tonight's top stories include major developments in global technology, an update on climate initiatives, and a heartwarming story from the local community. Stay with us as we break down the details.",
  },
  {
    label: 'Educational & Clear',
    text: "Welcome to today's lesson. We'll be covering three key concepts that form the foundation of this subject. By the end of this session, you'll have a clear understanding of how each concept connects and why it matters in practice.",
  },
];

export default function VoiceDetailsStep({ formData, setFormData, onNext }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  const isFormValid = formData.name && formData.description && formData.script && formData.clone_mode;

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a natural-sounding voice cloning script (3–5 sentences) for a voice named "${formData.name || 'the voice'}"${formData.description ? ` described as: "${formData.description}"` : ''}. The script should showcase varied tone and natural speech patterns. Return only the script text, no extra commentary.`;
      const response = await integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: 'object', properties: { script: { type: 'string' } } },
      });
      const cleaned = (response.script || '')
        .replace(/—|–/g, '-')   // em/en dash → hyphen
        .replace(/[""]/g, '"')  // smart double quotes → straight
        .replace(/['']/g, "'")  // smart single quotes → straight
        .replace(/…/g, '...')   // ellipsis char → three dots
        .trim();
      setFormData(prev => ({ ...prev, script: cleaned }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSample = (text) => {
    setFormData(prev => ({ ...prev, script: text }));
    setShowSamples(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-slate-300 mb-2 block">Voice Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="My Unique Voice"
          className="bg-slate-800/50 border-slate-700 text-white h-12"
        />
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the voice characteristics..."
          className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
        />
      </div>

      {/* Cloning Script */}
      <div>
        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <Label className="text-slate-300">
            Cloning Script <span className="text-red-400">*</span>
            <span className="ml-2 text-xs font-normal text-slate-500">— text your voice reads during cloning</span>
          </Label>
          <div className="flex items-center gap-2">
            {/* Sample Text button */}
            <button
              type="button"
              onClick={() => setShowSamples(v => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                showSamples
                  ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                  : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-blue-500/50 hover:text-blue-300'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Sample Text
              {showSamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* AI Generate button */}
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-600/50 bg-violet-500/10 text-violet-300 hover:border-violet-500 hover:bg-violet-500/20 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                : <><Wand2 className="w-3.5 h-3.5" /> AI Generate</>
              }
            </button>
          </div>
        </div>

        {/* Sample scripts dropdown */}
        {showSamples && (
          <div className="mb-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
            <p className="text-xs text-slate-500 mb-2">Choose a sample to use as your cloning script:</p>
            {SAMPLE_SCRIPTS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleUseSample(s.text)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all group',
                  formData.script === s.text
                    ? 'border-blue-500 bg-blue-500/15 text-white'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-400">{s.label}</span>
                  {formData.script === s.text && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{s.text}</p>
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={formData.script}
          onChange={(e) => setFormData(prev => ({ ...prev, script: e.target.value }))}
          placeholder="e.g. Hello, my name is Alex. I'm here to guide you through today's session with clarity and warmth..."
          className="bg-slate-800/50 border-slate-700 text-white min-h-[130px]"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Write 3–5 natural sentences. The AI reads this aloud to capture your voice's tone, pitch, and rhythm.
        </p>
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Quality Level *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {qualityLevels.map(level => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, clone_mode: level.value }))}
              className={cn(
                "p-4 rounded-xl border text-center transition-all",
                formData.clone_mode === level.value
                  ? "border-violet-500 bg-violet-500/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              )}
            >
              <span className="text-2xl">{level.emoji}</span>
              <p className="font-semibold text-white mt-1">{level.label}</p>
              <p className="text-xs text-slate-400 mt-1">{level.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <div>
          <Label className="text-white">Make Public</Label>
          <p className="text-sm text-slate-400">Allow others to use this voice</p>
        </div>
        <Switch
          checked={formData.is_public}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!isFormValid}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 h-12 px-8"
        >
          Next: Audio Samples
        </Button>
      </div>
    </div>
  );
}
