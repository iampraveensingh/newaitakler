import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Crown, Check, Zap, TrendingUp, Users, 
  Mic, Video, Instagram, MessageCircle, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

const features = [
  { icon: TrendingUp, title: 'Viral Script Templates', description: 'Pre-tested hooks and formats that drive engagement' },
  { icon: Mic, title: 'Influencer Voice Presets', description: 'Trendy voice styles optimized for social media' },
  { icon: Video, title: 'Reel-Ready Formats', description: 'Scripts optimized for Instagram Reels & TikTok' },
  { icon: MessageCircle, title: 'Engagement Boosters', description: 'CTAs and patterns proven to increase interaction' },
  { icon: Zap, title: 'Trending Topics', description: 'AI-powered trend analysis and content ideas' },
  { icon: Users, title: 'Platform Analytics', description: 'Track performance across platforms' },
];

const plans = [
  {
    name: 'Standard',
    price: '$29',
    period: '/month',
    features: [
      'Basic voiceover tools',
      'Standard voices',
      '50 generations/month',
      'Email support'
    ],
    current: true
  },
  {
    name: 'AI Viral Pro',
    price: '$79',
    period: '/month',
    features: [
      'Everything in Standard',
      'Viral script templates',
      'Influencer voice presets',
      'Unlimited generations',
      'Reel-ready formats',
      'Trending topic analysis',
      'Priority support',
      'Advanced analytics'
    ],
    highlighted: true
  },
  {
    name: 'Agency',
    price: '$199',
    period: '/month',
    features: [
      'Everything in Viral Pro',
      'Unlimited team members',
      'White-label exports',
      'Custom branding',
      'API access',
      'Dedicated account manager'
    ]
  }
];

export default function ViralPro() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Talker Viral Influencer Pro"
        description="Unlock viral content creation superpowers"
        icon={Sparkles}
        gradient="from-amber-500 to-orange-500"
      />

      {/* Hero Section */}
      <GlassCard className="p-8 sm:p-12 text-center bg-gradient-to-br from-amber-900/20 via-violet-900/20 to-orange-900/20" hover={false}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Create Content That Goes Viral
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Get access to proven viral scripts, influencer-style voices, and AI-powered trend analysis 
            to create content that resonates with your audience.
          </p>
        </motion.div>
      </GlassCard>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">What You'll Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard 
                className={`p-6 h-full flex flex-col ${
                  plan.highlighted 
                    ? 'border-2 border-amber-500 bg-gradient-to-br from-amber-900/10 to-orange-900/10' 
                    : ''
                }`}
                hover={false}
              >
                {plan.highlighted && (
                  <Badge className="w-fit mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="w-fit mb-4 bg-slate-700 text-white border-0">
                    Current Plan
                  </Badge>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full h-12 ${
                    plan.highlighted 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400' 
                      : plan.current
                        ? 'bg-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : plan.highlighted ? (
                    <>
                      <Crown className="w-5 h-5 mr-2" /> Upgrade to {plan.name}
                    </>
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sample Viral Content */}
      <GlassCard className="p-6" hover={false}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-amber-400" />
          Preview: Viral Content Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: '5-Second Hook Formula', category: 'Reels' },
            { title: 'Product Demo Script', category: 'TikTok' },
            { title: 'Before/After Transformation', category: 'Instagram' },
            { title: 'Trending Audio Script', category: 'Viral' },
          ].map((template, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-amber-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                  {template.title}
                </h4>
                <Badge className="bg-amber-500/10 text-amber-400 text-xs">
                  {template.category}
                </Badge>
              </div>
              <p className="text-sm text-slate-400">
                Unlock to access this template
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}