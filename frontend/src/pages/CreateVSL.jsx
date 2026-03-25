import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AddonUpgradeCard from '@/components/dashboard/AddonUpgradeCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Wand2, RefreshCw, Copy, Save, Mic,
  Sparkles, TrendingUp, MessageSquare, Target, Loader2, Globe, AlertTriangle
} from 'lucide-react';
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
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

const frameworks = [
  { value: 'pas', label: '🎯 Problem-Agitate-Solve (PAS)', description: 'Classic persuasion formula' },
  { value: 'hso', label: '📖 Hook-Story-Offer (HSO)', description: 'Engage with narrative' },
  { value: 'aida', label: '⚡ AIDA', description: 'Attention-Interest-Desire-Action' },
  { value: 'bab', label: '🌉 Before-After-Bridge (BAB)', description: 'Transformation focused' },
  { value: 'big_domino', label: '🎲 Big Domino / One Belief', description: 'Single belief shift' },
  { value: 'value_stack', label: '💰 Value Stack + Scarcity', description: 'Stack value with urgency' },
  { value: 'emotional_logical', label: '💜 Emotional Story + Logical Offer', description: 'Heart then head' },
  { value: 'myth_busting', label: '🔥 Myth Busting Framework', description: 'Debunk false beliefs' },
  { value: 'demo_driven', label: '🎬 Demo-Driven Script', description: 'Show don\'t tell' },
  { value: 'what_if_loop', label: '🔄 What If Loop Script', description: 'Open curiosity loops' },
  { value: 'cta_first', label: '🚀 CTA First, Proof Next', description: 'Lead with action' },
  { value: 'faq_driven', label: '❓ FAQ-Driven Script', description: 'Answer common questions' },
  { value: 'objection_handling', label: '🛡️ Objection Handling Stack', description: 'Overcome resistance' },
  { value: 'expert_authority', label: '👔 Expert Authority Script', description: 'Position as expert' },
  { value: 'old_vs_new', label: '🔀 Old Way vs New Way', description: 'Compare approaches' },
];

const emotions = [
  { value: 'urgency', label: '⏰ Urgency', color: 'from-red-500 to-orange-500' },
  { value: 'curiosity', label: '🤔 Curiosity', color: 'from-blue-500 to-cyan-500' },
  { value: 'hope', label: '🌟 Hope', color: 'from-amber-400 to-yellow-500' },
  { value: 'trust', label: '🤝 Trust', color: 'from-emerald-500 to-teal-500' },
  { value: 'fear', label: '😨 Fear', color: 'from-slate-600 to-slate-700' },
  { value: 'greed', label: '💎 Greed / Desire', color: 'from-amber-500 to-orange-500' },
  { value: 'frustration', label: '😤 Frustration', color: 'from-rose-500 to-red-500' },
  { value: 'belonging', label: '👥 Belonging', color: 'from-violet-500 to-purple-500' },
  { value: 'rebellion', label: '✊ Rebellion', color: 'from-pink-500 to-rose-500' },
  { value: 'relief', label: '😌 Relief / Liberation', color: 'from-green-500 to-emerald-500' },
];

const tones = [
  { value: 'bold', label: '💥 Bold' },
  { value: 'friendly', label: '😊 Friendly' },
  { value: 'casual', label: '🎒 Casual' },
  { value: 'professional', label: '👔 Professional' },
  { value: 'energetic', label: '⚡ Energetic' },
  { value: 'authoritative', label: '🎖️ Authoritative' },
  { value: 'empathetic', label: '💜 Empathetic' },
  { value: 'humorous', label: '😂 Humorous' },
  { value: 'inspirational', label: '🌈 Inspirational' },
  { value: 'direct', label: '🎯 Direct' },
];

export default function CreateVSL() {
  const queryClient = useQueryClient();
  const { checkLimit } = useUsageLimits();
  const vslLimit = checkLimit('vsl');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [formData, setFormData] = useState({
    product_name: '',
    sales_page_url: '',
    framework: 'pas',
    emotion: 'excited',
    tone: 'friendly',
    keywords: ''
  });

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const { data: existingVSL } = useQuery({
    queryKey: ['vsl', editId],
    queryFn: () => base44.entities.VSLCopy.filter({ id: editId }),
    enabled: !!editId
  });

  useEffect(() => {
    if (existingVSL?.[0]) {
      setFormData(existingVSL[0]);
      if (existingVSL[0].script) {
        setGeneratedScript({
          variations: [existingVSL[0].script]
        });
      }
    }
  }, [existingVSL]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editId) {
        return base44.entities.VSLCopy.update(editId, data);
      }
      return base44.entities.VSLCopy.create(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['vslCopies'] });
      if (!editId) {
        try {
          await Promise.all([
            base44.trackUsage('vsl', 1),
            base44.trackUsage('credits', 1),
          ]);
        } catch (e) {
          console.warn('Usage tracking failed:', e);
        } finally {
          queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
        }
      }
      toast.success(editId ? 'VSL updated!' : 'VSL saved!');
    }
  });

  const generateVSL = async () => {
    if (!editId && !vslLimit.allowed) return;
    setShowOverlay(true);
    setIsGenerating(true);

    // Normalise URL — prepend https:// if user omitted the protocol
    let salesUrl = formData.sales_page_url.trim();
    if (salesUrl && !salesUrl.startsWith('http')) salesUrl = 'https://' + salesUrl;

    // Scrape sales page if URL is provided
    let scrapedContext = '';
    if (salesUrl) {
      setIsScraping(true);
      try {
        const scraped = await base44.integrations.Core.ScrapePage({ url: salesUrl });
        scrapedContext = `
SCRAPED SALES PAGE CONTENT (from ${salesUrl}):
Page Title: ${scraped.title || ''}
Meta Description: ${scraped.metaDescription || ''}
Key Headings: ${scraped.headings?.join(' | ') || ''}
Page Content:
${scraped.bodyText || ''}
---
Use the above scraped content to write highly relevant, specific, and compelling VSL scripts that reflect the actual product, benefits, and language used on the sales page.`;
      } catch {
        // Silently fall back — generate using URL reference only
      } finally {
        setIsScraping(false);
      }
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 3 different Video Sales Letter (VSL) script variations for:
        Product: ${formData.product_name}
        Sales Page URL: ${salesUrl || 'Not provided'}
        Framework: ${formData.framework}
        Emotion: ${formData.emotion}
        Tone: ${formData.tone}
        Additional Keywords: ${formData.keywords || 'None'}
        ${scrapedContext}
        Each script should include a hook, body following the ${formData.framework} framework, and a strong CTA.
        Make them natural, conversational, and optimized for video narration.
        Each variation should have a different angle or approach.`,
        response_json_schema: {
          type: 'object',
          properties: {
            variation1: { type: 'string', description: 'Complete VSL script variation 1' },
            variation2: { type: 'string', description: 'Complete VSL script variation 2' },
            variation3: { type: 'string', description: 'Complete VSL script variation 3' }
          }
        }
      });
      const extractText = (v) =>
        typeof v === 'string' ? v : (v?.description || v?.text || v?.script || JSON.stringify(v) || '');

      setGeneratedScript({
        variations: [
          extractText(response?.variation1),
          extractText(response?.variation2),
          extractText(response?.variation3),
        ]
      });
    } catch (err) {
      console.error('VSL generation failed:', err);
      toast.error('Failed to generate VSL script. Please try again.');
    } finally {
      setShowOverlay(false);
      setIsGenerating(false);
    }
  };

  const regenerateVariation = async (index) => {
    setIsGenerating(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a new VSL script for:
        Product: ${formData.product_name}
        Framework: ${formData.framework}
        Emotion: ${formData.emotion}
        Tone: ${formData.tone}
        
        Current script: ${generatedScript.variations[index]}
        
        Create a completely different and more compelling version.`,
      response_json_schema: {
        type: 'object',
        properties: {
          script: { type: 'string' }
        }
      }
    });
    const newVariations = [...generatedScript.variations];
    newVariations[index] = response.script;
    setGeneratedScript({ variations: newVariations });
    setIsGenerating(false);
  };

  const saveVSL = (variationIndex) => {
    saveMutation.mutate({
      ...formData,
      script: generatedScript?.variations?.[variationIndex] || '',
      status: 'completed'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleOverlayComplete = () => {
    setShowOverlay(false);
  };

  const selectedEmotion = emotions.find(e => e.value === formData.emotion);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <GeneratingOverlay 
        isVisible={showOverlay} 
        type="vsl" 
        title="Creating Your VSL Script"
        onComplete={handleOverlayComplete}
      />

      <PageHeader
        title={editId ? 'Edit VSL Copy' : 'Create VSL Copy'}
        description="Generate compelling video sales letter scripts with AI"
        icon={FileText}
        backTo="VSLList"
        gradient="from-rose-500 to-pink-500"
      />

      <AddonUpgradeCard type="vsl" addons={currentUser?.addons} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Framework', value: frameworks.find(f => f.value === formData.framework)?.label.split(' ')[0] || 'PAS', icon: Target, color: 'violet' },
          { label: 'Emotion', value: selectedEmotion?.label || 'Excited', icon: Sparkles, color: 'pink' },
          { label: 'Tone', value: formData.tone || 'Friendly', icon: MessageSquare, color: 'blue' },
          { label: 'Status', value: generatedScript ? 'Ready' : 'Draft', icon: TrendingUp, color: 'emerald' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  `bg-${stat.color}-500/20`
                )}>
                  <stat.icon className={cn("w-5 h-5", `text-${stat.color}-400`)} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-sm font-semibold text-white capitalize">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              Product Details
            </h3>
            
            <div className="space-y-5">
              <div>
                <Label className="text-slate-300 text-sm font-medium">Product Name <span className="text-rose-400">*</span></Label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="e.g., FitPro App"
                  className="mt-2 bg-slate-800/50 border-slate-700 text-white h-11"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-300 text-sm font-medium">Sales Page URL <span className="text-rose-400">*</span></Label>
                <div className="relative mt-2">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={formData.sales_page_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, sales_page_url: e.target.value }))}
                    placeholder="https://..."
                    className="pl-9 bg-slate-800/50 border-slate-700 text-white h-11"
                    required
                  />
                </div>
                {isScraping && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Scraping sales page content...
                  </p>
                )}
                {formData.sales_page_url && !isScraping && (
                  <p className="mt-1.5 text-xs text-slate-500">Page will be scraped automatically when you generate</p>
                )}
              </div>

              <div>
                <Label className="text-slate-300 text-sm font-medium mb-3 block">Framework</Label>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                  {frameworks.map((framework) => (
                    <motion.button
                      key={framework.value}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, framework: framework.value }))}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                        formData.framework === framework.value
                          ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/50"
                          : "bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50"
                      )}
                    >
                      <span className="text-lg">{framework.label.split(' ')[0]}</span>
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          formData.framework === framework.value ? "text-white" : "text-slate-300"
                        )}>
                          {framework.label.split(' ').slice(1).join(' ')}
                        </p>
                        <p className="text-xs text-slate-500">{framework.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Emotion Pills */}
              <div>
                <Label className="text-slate-300 text-sm font-medium mb-3 block">Emotion</Label>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((em) => (
                    <motion.button
                      key={em.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData(prev => ({ ...prev, emotion: em.value }))}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                        formData.emotion === em.value
                          ? `bg-gradient-to-r ${em.color} text-white shadow-lg`
                          : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700"
                      )}
                    >
                      {em.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-sm font-medium">Tone</Label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, tone: v }))}
                >
                  <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-700 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {tones.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 text-sm font-medium">Keywords (optional)</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="fitness, health, busy professionals"
                  className="mt-2 bg-slate-800/50 border-slate-700 text-white h-11"
                />
              </div>

              {!editId && !vslLimit.allowed && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Usage limit reached</p>
                    <p className="text-red-400/80 text-sm mt-0.5">
                      You have used {vslLimit.used}/{vslLimit.limit} VSL scripts this month. Please upgrade your plan to continue.
                    </p>
                  </div>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300 animate-pulse" />
                <Button
                  onClick={generateVSL}
                  disabled={!formData.product_name || !formData.sales_page_url || isGenerating || (!editId && !vslLimit.allowed)}
                  className="relative w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 h-12 text-base font-semibold shadow-lg shadow-rose-500/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" /> Generate VSL Script
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </div>

        {/* Generated Script */}
        <div className="lg:col-span-2 space-y-6">
          {!generatedScript ? (
            <GlassCard className="p-12 text-center bg-gradient-to-br from-slate-900/80 to-slate-800/50" hover={false}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-rose-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Create Magic</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Fill in your product details on the left and click Generate to create 3 high-converting VSL script variations powered by AI.
              </p>
            </GlassCard>
          ) : (
            <>
              {/* Variation Tabs */}
              <div className="flex gap-2">
                {generatedScript.variations?.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVariation(index)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-semibold transition-all",
                      selectedVariation === index
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-slate-400 hover:text-white"
                    )}
                  >
                    Variation {index + 1}
                  </motion.button>
                ))}
              </div>

              {/* Script Content */}
              <AnimatePresence mode="wait">
                {generatedScript.variations?.map((script, index) => (
                  selectedVariation === index && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <GlassCard className="p-6" hover={false}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">VSL Script - Variation {index + 1}</h3>
                              <p className="text-xs text-slate-400">Complete video sales letter script</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => regenerateVariation(index)} 
                              disabled={isGenerating}
                              className="border-slate-700 hover:bg-slate-800"
                            >
                              <RefreshCw className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} /> Regenerate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => copyToClipboard(script)} 
                              className="border-slate-700 hover:bg-slate-800"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={script}
                          onChange={(e) => {
                            const newVariations = [...generatedScript.variations];
                            newVariations[index] = e.target.value;
                            setGeneratedScript({ variations: newVariations });
                          }}
                          className="min-h-[350px] bg-slate-800/50 border-slate-700 text-white"
                        />

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              onClick={() => saveVSL(index)}
                              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 h-11"
                            >
                              <Save className="w-4 h-4 mr-2" /> Save This Version
                            </Button>
                          </motion.div>
                          <Link
                            to={createPageUrl('CreateVoiceover')}
                            className="flex-1"
                            onClick={() => {
                              const script = generatedScript?.variations?.[selectedVariation];
                              if (script) sessionStorage.setItem('vo_prefill_script', script);
                            }}
                          >
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 h-11">
                                <Mic className="w-4 h-4 mr-2" /> Create Voiceover
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}