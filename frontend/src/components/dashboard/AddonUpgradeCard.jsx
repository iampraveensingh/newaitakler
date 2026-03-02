import React from 'react';
import { motion } from 'framer-motion';
import { FileText, PenTool, Video, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { auth } from '@/api/base44Client';

const addonConfig = {
  vsl: {
    title: 'Unlock VSL Edition',
    description: 'Get unlimited VSL scripts and advanced features',
    icon: FileText,
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-900/40 via-pink-900/30 to-fuchsia-900/20',
    borderColor: 'border-rose-500/30',
    // objectKeys: API addon object keys that unlock this feature (checked case-insensitively)
    objectKeys: ['vsl', 'VSL'],
    benefits: [
      'Unlimited VSL scripts',
      'Advanced frameworks',
      'Priority generation',
      'Export options',
    ],
  },
  adcopy: {
    title: 'Unlock Ad Copy Edition',
    description: 'Create unlimited ad copies for all platforms',
    icon: PenTool,
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-900/40 via-blue-900/30 to-cyan-900/20',
    borderColor: 'border-indigo-500/30',
    objectKeys: ['adcopy', 'ADCOPY', 'ad_copy'],
    benefits: [
      'Unlimited ad copies',
      'All platforms supported',
      'Advanced styles',
      'A/B variations',
    ],
  },
  transcriber: {
    title: 'Unlock Transcriber Edition',
    description: 'Transcribe unlimited videos and audio files',
    icon: Video,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-900/40 via-teal-900/30 to-cyan-900/20',
    borderColor: 'border-emerald-500/30',
    objectKeys: ['transcribe', 'TRANSCRIBE', 'transcriber'],
    benefits: [
      'Unlimited transcriptions',
      'All output formats',
      'Speaker detection',
      'Key highlights',
    ],
  },
};

export default function AddonUpgradeCard({ type, addons }) {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const config = addonConfig[type];
  if (!config) return null;

  // Agency sub-users cannot upgrade — managed by their agency admin
  if (currentUser?.agency_owner_id) return null;

  // addons from API is an object { transcribe: true, agency: true, ... }
  // Check all possible key variants for this addon type
  const addonsObj = currentUser?.addons ?? {};
  const hasAddon = config.objectKeys.some(key => addonsObj[key] === true);

  // If user already has the addon, don't show the upgrade card
  if (hasAddon) return null;

  const Icon = config.icon;

  return (
    <GlassCard 
      className={`p-6 bg-gradient-to-br ${config.bgGradient} ${config.borderColor} relative overflow-hidden`} 
      hover={false}
    >
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-3xl" />
      
      <div className="relative flex flex-col md:flex-row md:items-center gap-5">
        <motion.div 
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shrink-0`}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{config.title}</h3>
            <span className={`px-2 py-0.5 text-xs font-bold bg-gradient-to-r ${config.gradient} text-white rounded-full`}>
              ADDON
            </span>
          </div>
          <p className="text-slate-400 mb-4">{config.description}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {config.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <Link to={createPageUrl('Billing')}>
          <Button className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 h-11 px-6 font-semibold shadow-lg whitespace-nowrap`}>
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </GlassCard>
  );
}