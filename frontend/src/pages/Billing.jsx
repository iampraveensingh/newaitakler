import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  CreditCard, Crown, Zap, Check, Star, Sparkles,
  Mic, Copy, FileText, PenTool, Video, TrendingUp,
  Infinity, Users, Rocket, Shield, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

// Addon definitions with their limits
const addonDefinitions = {
  unlimited: {
    key: 'unlimited',
    name: 'Unlimited Edition',
    description: 'Remove all limits on voiceovers and credits',
    icon: Infinity,
    color: 'from-violet-500 via-purple-500 to-fuchsia-500',
    shadow: 'shadow-violet-500/30',
    glow: 'violet',
    features: [
      'Unlimited voiceover credits',
      'Unlimited voice generations',
      'Priority processing',
      'No monthly resets'
    ]
  },
  vsl_edition: {
    key: 'vsl_edition',
    name: 'VSL Edition',
    description: 'Unlock advanced VSL script generation',
    icon: FileText,
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    shadow: 'shadow-emerald-500/30',
    glow: 'emerald',
    features: [
      'Unlimited VSL scripts',
      'Advanced frameworks',
      'Hook & CTA optimization',
      'Sales page analysis'
    ]
  },
  adcopy_edition: {
    key: 'adcopy_edition',
    name: 'Ad Copy Edition',
    description: 'Create unlimited ad copies for all platforms',
    icon: PenTool,
    color: 'from-amber-500 via-orange-500 to-red-500',
    shadow: 'shadow-amber-500/30',
    glow: 'amber',
    features: [
      'Unlimited ad copies',
      'All platform templates',
      'A/B variations',
      'Headline generator'
    ]
  },
  transcriber_edition: {
    key: 'transcriber_edition',
    name: 'Transcriber Edition',
    description: 'Transcribe unlimited videos and audio files',
    icon: Video,
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    shadow: 'shadow-emerald-500/30',
    glow: 'emerald',
    features: [
      'Unlimited transcriptions',
      'All output formats',
      'Speaker detection',
      'Key highlights'
    ]
  },
  agency: {
    key: 'agency',
    name: 'Agency License',
    description: 'White-label & team collaboration features',
    icon: Users,
    color: 'from-blue-500 via-indigo-500 to-violet-500',
    shadow: 'shadow-blue-500/30',
    glow: 'blue',
    features: [
      'Unlimited team members',
      'Client workspaces',
      'White-label exports',
      'Priority support'
    ]
  }
};

const usageIcons = {
  credits: Zap,
  clones: Copy,
  vsl: FileText,
  ad: PenTool,
  custom: Sparkles,
  transcriptions: Video
};

export default function Billing() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: planLimits } = useQuery({
    queryKey: ['planLimits', currentUser?.base_plan],
    queryFn: () => base44.entities.PlanLimits.filter({ plan_id: currentUser?.base_plan }),
    enabled: !!currentUser?.base_plan
  });

  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const { data: monthlyUsage } = useQuery({
    queryKey: ['monthlyUsage', currentUser?.id, currentMonthYear],
    queryFn: () => base44.entities.UserUsageMonthly.filter({ 
      user_id: currentUser?.id, 
      month_year: currentMonthYear 
    }),
    enabled: !!currentUser?.id
  });

  const basePlan = currentUser?.base_plan || 'FE';
  const addons = currentUser?.addons || {};
  const limits = planLimits?.[0] || {};
  const usage = monthlyUsage?.[0] || {};

  const usageData = [
    { key: 'credits', label: 'Voiceover Credits', used: usage.credits_used || 0, limit: limits.credits || 0 },
    { key: 'clones', label: 'Voice Clones', used: usage.clones_used || 0, limit: limits.clones || 0 },
    { key: 'vsl', label: 'VSL Scripts', used: usage.vsl_used || 0, limit: limits.vsl || 0 },
    { key: 'ad', label: 'Ad Copies', used: usage.ad_used || 0, limit: limits.ad || 0 },
    { key: 'custom', label: 'Custom Voices', used: usage.custom_used || 0, limit: limits.custom || 0 },
    { key: 'transcriptions', label: 'Transcriptions', used: usage.transcriptions_used || 0, limit: limits.transcriptions || 0 },
  ];

  const activeAddons = Object.entries(addons).filter(([_, active]) => active).map(([key]) => key);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Plan"
        description="Manage your subscription and upgrade your experience"
        icon={CreditCard}
        gradient="from-emerald-500 to-teal-500"
      />

      {/* Current Plan Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 20px rgba(139,92,246,0.3)', '0 0 40px rgba(139,92,246,0.5)', '0 0 20px rgba(139,92,246,0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Current Plan</p>
              <h2 className="text-3xl font-bold text-white">{basePlan} Plan</h2>
              <div className="flex items-center gap-2 mt-2">
                {activeAddons.length > 0 && (
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                    +{activeAddons.length} Add-on{activeAddons.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {currentUser?.plan_updated_at && (
                  <span className="text-xs text-slate-500">
                    Since {new Date(currentUser.plan_updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Usage This Month */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            Usage This Month
          </h3>
          <Badge variant="outline" className="border-slate-600 text-slate-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {usageData.map((item, idx) => {
            const Icon = usageIcons[item.key];
            const percentage = item.limit > 0 ? Math.min((item.used / item.limit) * 100, 100) : 0;
            const isNearLimit = percentage >= 80;
            const isAtLimit = percentage >= 100;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  isAtLimit ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-white"
                )}>
                  {item.used}
                </p>
                <p className="text-xs text-slate-500">/ {item.limit}</p>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={cn(
                      "h-full rounded-full",
                      isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-violet-500"
                    )}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Unlimited Plan - Featured */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 rounded-3xl blur-2xl" />
        <div className="relative rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Popular Badge */}
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-6 py-2 rounded-bl-2xl shadow-lg">
              🔥 MOST POPULAR
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              {/* Left side - Plan info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div 
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(251,191,36,0.4)', '0 0 40px rgba(251,191,36,0.6)', '0 0 20px rgba(251,191,36,0.4)'],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-xl"
                  >
                    <Infinity className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                      Unlimited Plan
                    </h3>
                    <p className="text-slate-400 mt-1">Remove all limits forever</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    'Unlimited voiceover credits',
                    'Unlimited voice generations',
                    'Unlimited voice clones',
                    'Unlimited VSL scripts',
                    'Unlimited ad copies',
                    'Unlimited transcriptions',
                    'Priority processing',
                    'No monthly resets',
                    'Premium support',
                    'All future updates'
                  ].map((feature, idx) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right side - Pricing */}
              <div className="md:w-72 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-amber-500/30 text-center">
                <p className="text-slate-400 text-sm mb-2">Monthly Investment</p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">$37</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-emerald-400 text-sm mb-6">Cancel anytime</p>
                
                <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 shadow-xl shadow-orange-500/30">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade to Unlimited
                </Button>
                
                <p className="text-xs text-slate-500 mt-4">
                  🔒 Secure payment • Instant access
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Other Add-ons */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Additional Add-ons</h3>
            <p className="text-sm text-slate-400">Enhance specific features</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.values(addonDefinitions).filter(a => a.key !== 'unlimited').map((addon, idx) => {
            const Icon = addon.icon;
            const isActive = addons[addon.key];

            return (
              <motion.div
                key={addon.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                  addon.color
                )} style={{ filter: 'blur(40px)' }} />
                
                <div className={cn(
                  "relative rounded-2xl border overflow-hidden transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-emerald-500/50" 
                    : "bg-slate-900/80 border-slate-700/50 hover:border-slate-600/50"
                )}>
                  {/* Header */}
                  <div className={cn(
                    "p-5 bg-gradient-to-r",
                    addon.color,
                    "bg-opacity-10"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={cn(
                            "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                            addon.color,
                            addon.shadow
                          )}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{addon.name}</h4>
                          <p className="text-sm text-slate-400">{addon.description}</p>
                        </div>
                      </div>
                      {isActive && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-5 pt-4">
                    <ul className="space-y-2.5 mb-5">
                      {addon.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <div className={cn(
                            "w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                            addon.color
                          )}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isActive ? (
                      <Button disabled className="w-full bg-slate-700/50 text-slate-400 border border-slate-600/50">
                        <Shield className="w-4 h-4 mr-2" />
                        Already Owned
                      </Button>
                    ) : (
                      <Button className={cn(
                        "w-full bg-gradient-to-r group/btn",
                        addon.color
                      )}>
                        <span>Get {addon.name}</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}