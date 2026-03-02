import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { createPageUrl } from '@/utils';
import { Sparkles, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import GeneratingOverlay from '@/components/ui/GeneratingOverlay';
import { toast } from 'sonner';

const examplePrompts = [
  "A warm, friendly female voice with a slight British accent, perfect for storytelling and audiobooks",
  "An energetic, upbeat male voice ideal for promotional content and advertisements",
  "A calm, soothing voice with measured pace, suitable for meditation and wellness content",
  "A professional, authoritative voice for corporate presentations and documentaries",
];

const categories = [
  { value: 'professional', label: '💼 Professional' },
  { value: 'casual', label: '😎 Casual' },
  { value: 'dramatic', label: '🎭 Dramatic' },
  { value: 'friendly', label: '🤗 Friendly' },
  { value: 'authoritative', label: '👔 Authoritative' },
];

const testScripts = [
  "Welcome to our platform. We're excited to have you here.",
  "In today's fast-paced world, efficiency is everything.",
  "Once upon a time, in a land far away...",
  "Breaking news: Scientists have made an incredible discovery.",
];

export default function CreateCustomVoice() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkLimit } = useUsageLimits();
  const customLimit = checkLimit('custom');
  const [showOverlay, setShowOverlay] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: '',
    style: '',
    use_case: '',
    test_script: testScripts[0],
    category: 'professional'
  });

  const createVoiceMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomVoice.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['customVoices'] });
      try {
        await Promise.all([
          base44.trackUsage('custom', 1),
          base44.trackUsage('credits', 1),
        ]);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
    },
    onError: (error) => {
      setShowOverlay(false);
      toast.error(`Failed to save voice: ${error.message}`);
    }
  });

  const saveVoice = async () => {
    if (!customLimit.allowed) return;
    setShowOverlay(true);
    try {
      await createVoiceMutation.mutateAsync({
        ...formData,
        status: 'pending'
      });
    } catch {
      // onError handles toast + hiding overlay
    }
  };

  const useExamplePrompt = (prompt) => {
    setFormData(prev => ({ ...prev, description: prompt }));
  };

  return (
    <>
    <GeneratingOverlay
      isVisible={showOverlay}
      type="customvoice"
      title="Creating Your Custom Voice"
      onComplete={() => navigate(createPageUrl('CustomVoiceList'))}
      autoComplete={true}
    />
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Create Custom Voice"
        description="Design a unique AI voice from text description"
        icon={Sparkles}
        backTo="CustomVoiceList"
        gradient="from-amber-500 to-orange-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">Voice Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Voice Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Give your voice a name"
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-slate-300">Voice Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the voice you want to create in detail. Include tone, accent, pace, personality..."
                  className="mt-1.5 min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Example Prompts</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => useExamplePrompt(prompt)}
                      className="text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 transition-all text-sm text-slate-300 hover:text-white"
                    >
                      "{prompt.slice(0, 60)}..."
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Tone</Label>
                  <Input
                    value={formData.tone}
                    onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                    placeholder="e.g., warm, energetic"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Style</Label>
                  <Input
                    value={formData.style}
                    onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                    placeholder="e.g., conversational, formal"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Primary Use Case</Label>
                <Input
                  value={formData.use_case}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
                  placeholder="e.g., podcast intros, product demos"
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </GlassCard>

          {/* Test Script */}
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">Test Script</h3>
            <p className="text-slate-300 text-sm mb-4">
              This script will be used to generate a preview of your custom voice.
            </p>

            <Textarea
              value={formData.test_script}
              onChange={(e) => setFormData(prev => ({ ...prev, test_script: e.target.value }))}
              placeholder="Enter a test script..."
              className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white"
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {testScripts.map((script, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, test_script: script }))}
                  className="border-slate-700 text-slate-300 hover:text-white"
                >
                  Sample {i + 1}
                </Button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!customLimit.allowed && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-semibold text-sm">Usage limit reached</p>
                  <p className="text-red-400/80 text-sm mt-0.5">
                    You have used {customLimit.used}/{customLimit.limit} custom voices this month. Please upgrade your plan to continue.
                  </p>
                </div>
              </div>
            )}
            <Button
              onClick={saveVoice}
              disabled={!formData.name || !formData.description || createVoiceMutation.isPending || !customLimit.allowed}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 h-12"
            >
              {createVoiceMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Voice</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}