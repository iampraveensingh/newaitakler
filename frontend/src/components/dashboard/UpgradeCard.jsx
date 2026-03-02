import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight, Sparkles, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const proBenefits = [
  'Unlimited voiceovers',
  'Unlimited voice clones',
  'Priority processing',
  'Advanced features',
];

const agencyBenefits = [
  'Team collaboration',
  'Client management',
  'White-label options',
  'Priority support',
];

export default function UpgradeCard({ compact = false, currentPlan, addons, isAgencySubUser = false }) {
  // Agency sub-users are on a managed account — no independent upgrades allowed
  if (isAgencySubUser) {
    return (
      <GlassCard
        className="p-6 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-700/20 border-slate-600/30 relative overflow-hidden"
        hover={false}
      >
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20 shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Managed Account</h3>
            <p className="text-slate-400 text-sm mt-0.5">Your account is managed by your agency. Contact your agency admin to adjust your access or credits.</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // addons comes from API as an object e.g. { AGENCY: true, unlimited: true }
  // (NOT an array — previous code incorrectly used Array.isArray)
  const addonsObj = (addons && typeof addons === 'object' && !Array.isArray(addons)) ? addons : {};

  const hasAgency    = addonsObj?.AGENCY    === true || addonsObj?.agency    === true;
  const hasUnlimited = addonsObj?.UNLIMITED === true || addonsObj?.unlimited === true;
  const plan         = (currentPlan || '').toUpperCase();

  // PRO / XTREME is the base_plan field — NOT an addon
  const hasPro = plan === 'PRO' || plan === 'XTREME';

  // ── All unlocked: Agency addon OR Unlimited addon OR XTREME plan ──────────
  if (hasAgency || hasUnlimited || plan === 'XTREME') {
    return (
      <GlassCard
        className="p-6 bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-cyan-900/20 border-emerald-500/30 relative overflow-hidden"
        hover={false}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white">All Features Unlocked</h3>
              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full">
                {hasAgency ? 'AGENCY' : hasUnlimited ? 'UNLIMITED' : 'XTREME'}
              </span>
            </div>
            <p className="text-slate-400 mt-1">You have full access to all features!</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ── PRO plan but no Agency addon: suggest Agency upgrade ─────────────────
  if (hasPro) {
    if (compact) {
      return (
        <GlassCard className="p-5 bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-violet-900/20 border-blue-500/30" hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white">Upgrade to Agency</h3>
              <p className="text-sm text-slate-400 truncate">Scale with team features</p>
            </div>
            <Link to={createPageUrl('Billing')}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shrink-0">
                Upgrade <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </GlassCard>
      );
    }

    return (
      <GlassCard
        className="p-6 bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-violet-900/20 border-blue-500/30 relative overflow-hidden"
        hover={false}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start gap-4 mb-5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Upgrade to Agency</h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full">
                  AGENCY
                </span>
              </div>
              <p className="text-slate-400 mt-1">Scale your voice business with team features</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {agencyBenefits.map((benefit, idx) => (
              <motion.div key={benefit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Billing')} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 h-11 text-base font-semibold shadow-lg shadow-blue-500/25">
                <Sparkles className="w-4 h-4 mr-2" /> Upgrade to Agency
              </Button>
            </Link>
            <Link to={createPageUrl('Billing')}>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">View Billing</Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ── FE plan: upgrade to PRO ───────────────────────────────────────────────
  if (compact) {
    return (
      <GlassCard className="p-5 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-pink-900/20 border-violet-500/30" hover={false}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">Upgrade to PRO</h3>
            <p className="text-sm text-slate-400 truncate">Unlock the full power of VoiceAI</p>
          </div>
          <Link to={createPageUrl('Billing')}>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shrink-0">
              Upgrade <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className="p-6 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-pink-900/20 border-violet-500/30 relative overflow-hidden"
      hover={false}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-start gap-4 mb-5">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <Crown className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Upgrade to PRO</h3>
              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">PRO</span>
            </div>
            <p className="text-slate-400 mt-1">Unlock the full power of VoiceAI</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {proBenefits.map((benefit, idx) => (
            <motion.div key={benefit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{benefit}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Billing')} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 h-11 text-base font-semibold shadow-lg shadow-violet-500/25">
              <Sparkles className="w-4 h-4 mr-2" /> Upgrade Now
            </Button>
          </Link>
          <Link to={createPageUrl('Billing')}>
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">View Billing</Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
