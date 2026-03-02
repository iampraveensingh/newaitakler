import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AddonUpgradeCard from '@/components/dashboard/AddonUpgradeCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Wand2, RefreshCw, Copy, Save, Mic, Zap, Sparkles,
  Facebook, Instagram, Linkedin, Mail, Twitter, Search as SearchIcon, Loader2, Globe, AlertTriangle
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

const platforms = [
  { value: 'facebook', label: 'Facebook/Meta', icon: Facebook, color: 'from-blue-600 to-blue-500' },
  { value: 'google', label: 'Google Ads', icon: SearchIcon, color: 'from-red-500 to-yellow-500' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
  { value: 'email', label: 'Email', icon: Mail, color: 'from-emerald-500 to-teal-500' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-600' },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'from-slate-700 to-slate-600' },
];

const styles = [
  { value: 'aida', label: '⚡ AIDA', description: 'Attention-Interest-Desire-Action' },
  { value: 'pas', label: '🎯 PAS', description: 'Problem-Agitate-Solve' },
  { value: 'direct', label: '💰 Direct Response / Salesy', description: 'Straight to the sale' },
  { value: 'conversational', label: '💬 Conversational / Friendly', description: 'Warm and approachable' },
  { value: 'storytelling', label: '📖 Emotional Storytelling', description: 'Narrative approach' },
  { value: 'feature', label: '🔧 Feature-Focused', description: 'Highlight specs & features' },
  { value: 'benefit', label: '✨ Benefit-Focused', description: 'Emphasize outcomes' },
  { value: 'urgency', label: '⏰ Scarcity / Urgency', description: 'Time-sensitive offers' },
  { value: 'clickbait', label: '🪝 Clickbait-Style Hook', description: 'Attention-grabbing hooks' },
  { value: 'testimonial', label: '⭐ Testimonial-Based', description: 'Social proof focused' },
  { value: 'authority', label: '🎖️ Authority + Social Proof', description: 'Expert positioning' },
  { value: 'minimalist', label: '✂️ Minimalist / Snappy', description: 'Short one-liners' },
  { value: 'luxury', label: '👑 Luxury / Premium Feel', description: 'High-end positioning' },
  { value: 'funny', label: '😂 Funny / Entertaining', description: 'Humor-driven copy' },
  { value: 'relatable', label: '🙋 Relatable / Humanized', description: 'Personal connection' },
];

export default function CreateAdCopy() {
  const queryClient = useQueryClient();
  const { checkLimit } = useUsageLimits();
  const adLimit = checkLimit('ad');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const [generatedCopies, setGeneratedCopies] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [formData, setFormData] = useState({
    product_name: '',
    product_url: '',
    platform: 'facebook',
    style: 'direct',
  });

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const { data: existingAd } = useQuery({
    queryKey: ['adCopy', editId],
    queryFn: () => base44.entities.AdCopy.filter({ id: editId }),
    enabled: !!editId
  });

  useEffect(() => {
    if (existingAd?.[0]) {
      setFormData(existingAd[0]);
      if (existingAd[0].variations) {
        setGeneratedCopies({
          variations: existingAd[0].variations
        });
      } else if (existingAd[0].copy_text) {
        setGeneratedCopies({
          variations: [existingAd[0].copy_text]
        });
      }
    }
  }, [existingAd]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editId) {
        return base44.entities.AdCopy.update(editId, data);
      }
      return base44.entities.AdCopy.create(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['adCopies'] });
      if (!editId) {
        try {
          await base44.trackUsage('ad', 1);
        } catch (e) {
          console.warn('Usage tracking failed:', e);
        } finally {
          queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
        }
      }
      toast.success(editId ? 'Ad copy updated!' : 'Ad copy saved!');
    }
  });
const formatAd = (ad) => {
  if (!ad) return '';

  return `Headline:
${ad.headline || ''}

Description:
${ad.description || ''}

Call To Action:
${ad.call_to_action || ''}`;
};
  const generateAdCopy = async () => {
    if (!editId && !adLimit.allowed) return;
    setShowOverlay(true);
    setIsGenerating(true);

    // Scrape product page if URL is provided
    let scrapedContext = '';
    if (formData.product_url) {
      setIsScraping(true);
      try {
        const scraped = await base44.integrations.Core.ScrapePage({ url: formData.product_url });
        scrapedContext = `
SCRAPED PRODUCT PAGE CONTENT (from ${formData.product_url}):
Page Title: ${scraped.title || ''}
Meta Description: ${scraped.metaDescription || ''}
Key Headings: ${scraped.headings?.join(' | ') || ''}
Page Content:
${scraped.bodyText || ''}
---
Use the above scraped content to write highly relevant and compelling ad copy that reflects the actual product features, benefits, and language used on the product page.`;
      } catch {
        // Silently fall back — generate using URL reference only
      } finally {
        setIsScraping(false);
      }
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create 3 different ${formData.platform} ad copy variations for:
        Product: ${formData.product_name}
        URL: ${formData.product_url || 'Not provided'}
        Style: ${formData.style}
        ${scrapedContext}
        Each variation should be a complete ad copy including headline, description, and call to action.
        Optimize for ${formData.platform} best practices and character limits.
        Make each variation have a different angle or approach.`,
      response_json_schema: {
        type: 'object',
        properties: {
          variation1: { type: 'string', description: 'Complete ad copy variation 1' },
          variation2: { type: 'string', description: 'Complete ad copy variation 2' },
          variation3: { type: 'string', description: 'Complete ad copy variation 3' }
        }
      }
    });
    setGeneratedCopies({
     variations: [
    formatAd(response?.variation1),
    formatAd(response?.variation2),
    formatAd(response?.variation3)
  ]
   //variations: [response.variation1, response.variation2, response.variation3]
    });
    setShowOverlay(false);
    setIsGenerating(false);
  };

  const regenerateVariation = async (index) => {
    setIsGenerating(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a new ${formData.platform} ad copy for:
        Product: ${formData.product_name}
        Style: ${formData.style}
        
        Current copy: ${generatedCopies.variations[index]}
        
        Create a completely different and more compelling version.`,
      response_json_schema: {
        type: 'object',
        properties: {
          copy: { type: 'string' }
        }
      }
    });
    const newVariations = [...generatedCopies.variations];
    newVariations[index] = response.copy;
    setGeneratedCopies({ variations: newVariations });
    setIsGenerating(false);
  };

  const saveAdCopy = (variationIndex) => {
    saveMutation.mutate({
      ...formData,
      copy_text: generatedCopies.variations[variationIndex],
      variations: generatedCopies.variations,
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

  const selectedPlatform = platforms.find(p => p.value === formData.platform);
  const PlatformIcon = selectedPlatform?.icon || Facebook;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <GeneratingOverlay 
        isVisible={showOverlay} 
        type="adcopy" 
        title="Creating Ad Variations"
        onComplete={handleOverlayComplete}
      />

      <PageHeader
        title={editId ? 'Edit Ad Copy' : 'Create Ad Copy'}
        description="Generate high-converting ad copy for any platform"
        icon={PenTool}
        backTo="AdCopyList"
        gradient="from-indigo-500 to-blue-500"
      />

      <AddonUpgradeCard type="adcopy" addons={currentUser?.addons} />

      {/* Platform Quick Select */}
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <motion.button
              key={platform.value}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData(prev => ({ ...prev, platform: platform.value }))}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                formData.platform === platform.value
                  ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                  : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {platform.label}
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-400" />
              Product Details
            </h3>
            
            <div className="space-y-5">
              <div>
                <Label className="text-slate-300 text-sm font-medium">Product Name <span className="text-indigo-400">*</span></Label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="e.g., FitPro App"
                  className="mt-2 bg-slate-800/50 border-slate-700 text-white h-11"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-300 text-sm font-medium">Product URL <span className="text-indigo-400">*</span></Label>
                <div className="relative mt-2">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={formData.product_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                    placeholder="https://..."
                    className="pl-9 bg-slate-800/50 border-slate-700 text-white h-11"
                    required
                  />
                </div>
                {isScraping && (
                  <p className="mt-1.5 text-xs text-indigo-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Scraping product page content...
                  </p>
                )}
                {formData.product_url && !isScraping && (
                  <p className="mt-1.5 text-xs text-slate-500">Page will be scraped automatically when you generate</p>
                )}
              </div>

              {/* Ad Style Selection */}
              <div>
                <Label className="text-slate-300 text-sm font-medium mb-3 block">Ad Style</Label>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                  {styles.map((style) => (
                    <motion.button
                      key={style.value}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, style: style.value }))}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                        formData.style === style.value
                          ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/50"
                          : "bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50"
                      )}
                    >
                      <span className="text-lg">{style.label.split(' ')[0]}</span>
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          formData.style === style.value ? "text-white" : "text-slate-300"
                        )}>
                          {style.label.split(' ').slice(1).join(' ')}
                        </p>
                        <p className="text-xs text-slate-500">{style.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {!editId && !adLimit.allowed && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Usage limit reached</p>
                    <p className="text-red-400/80 text-sm mt-0.5">
                      You have used {adLimit.used}/{adLimit.limit} ad copies this month. Please upgrade your plan to continue.
                    </p>
                  </div>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300 animate-pulse" />
                <Button
                  onClick={generateAdCopy}
                  disabled={!formData.product_name || !formData.product_url || isGenerating || (!editId && !adLimit.allowed)}
                  className="relative w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 h-12 text-base font-semibold shadow-lg shadow-indigo-500/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" /> Generate Ad Copy
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </div>

        {/* Generated Variations */}
        <div className="lg:col-span-2">
          {!generatedCopies ? (
            <GlassCard className="p-12 text-center bg-gradient-to-br from-slate-900/80 to-slate-800/50" hover={false}>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                  <PlatformIcon className="w-10 h-10 text-indigo-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">Create {selectedPlatform?.label} Ads</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Enter your product details and we'll generate 3 high-converting ad variations optimized for {selectedPlatform?.label}.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {/* Variation Tabs */}
              <div className="flex gap-2 mb-4">
                {generatedCopies.variations?.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVariation(index)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-semibold transition-all",
                      selectedVariation === index
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-slate-400 hover:text-white"
                    )}
                  >
                    Variation {index + 1}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {generatedCopies.variations?.map((copy, index) => (
                  selectedVariation === index && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <GlassCard className="p-6" hover={false}>
                        {/* Preview Card */}
                        <div className={cn(
                          "p-5 rounded-xl mb-6 border",
                          `bg-gradient-to-br ${selectedPlatform?.color} bg-opacity-10 border-slate-700/50`
                        )}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <PlatformIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white/80 text-sm font-medium">{selectedPlatform?.label} Ad Preview</span>
                          </div>
                          <p className="text-white whitespace-pre-wrap">{copy}</p>
                        </div>

                        {/* Editable Field */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                              <PenTool className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Ad Copy - Variation {index + 1}</h3>
                              <p className="text-xs text-slate-400">Complete ad copy for {selectedPlatform?.label}</p>
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
                              onClick={() => copyToClipboard(copy)} 
                              className="border-slate-700 hover:bg-slate-800"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={copy}
                          onChange={(e) => {
                            const newVariations = [...generatedCopies.variations];
                            newVariations[index] = e.target.value;
                            setGeneratedCopies({ variations: newVariations });
                          }}
                          className="min-h-[250px] bg-slate-800/50 border-slate-700 text-white"
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button 
                              onClick={() => saveAdCopy(index)}
                              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 h-11"
                            >
                              <Save className="w-4 h-4 mr-2" /> Save This Version
                            </Button>
                          </motion.div>
                          <Link to={createPageUrl('CreateVoiceover')} className="flex-1">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button variant="outline" className="w-full border-slate-700 h-11">
                                <Mic className="w-4 h-4 mr-2" /> Turn into Voiceover
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}