import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight, Sparkles, ShieldCheck, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const unlimitedBenefits = [
  'Unlimited voiceover credits',
  'No monthly credit resets',
  'Priority processing',
  'Use credits across all features',
];

const allaccessBenefits = [
  'Unlimited everything',
  'Unlimited voice clones',
  'Unlimited VSL & Ad Copy',
  'Unlimited transcriptions',
  'Unlimited Brand Studio',
  'Audio mixer & audiobooks',
  'All bonus apps unlocked',
  'Priority processing',
];

export default function UpgradeCard({ compact = false, currentPlan, addons, isAgencySubUser = false }) {
  // Agency sub-users — no independent upgrades
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

  const addonsObj       = (addons && typeof addons === 'object' && !Array.isArray(addons)) ? addons : {};
  const hasAllAccess    = addonsObj.ALLACCESS  === true || addonsObj.allaccess  === true;
  const hasUnlimited    = addonsObj.UNLIMITED  === true || addonsObj.unlimited  === true;
  const basePlan        = (currentPlan || '').toUpperCase();

  // Derive effective plan using priority order
  const effectivePlan   = hasAllAccess
    ? 'ALLACCESS'
    : basePlan === 'BUNDLE'
      ? 'BUNDLE'
      : hasUnlimited
        ? 'UNLIMITED'
        : basePlan;

  // ── Already fully unlocked (BUNDLE or ALLACCESS) ──────────────────────────
  if (effectivePlan === 'BUNDLE' || effectivePlan === 'ALLACCESS') {
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
                {effectivePlan}
              </span>
            </div>
            <p className="text-slate-400 mt-1">You have full access to all features!</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ── Upgrade card config ───────────────────────────────────────────────────
  // UNLIMITED plan → offer ALLACCESS upgrade
  // FE / XTREME    → offer UNLIMITED upgrade
  const upgradeToAllAccess = effectivePlan === 'UNLIMITED';

  const upgradeTitle       = upgradeToAllAccess ? 'Upgrade to ALLACCESS' : 'Upgrade to UNLIMITED';
  const upgradeDescription = upgradeToAllAccess
    ? 'Unlock every feature with no limits'
    : 'Get unlimited voiceover credits';
  const badgeText          = upgradeToAllAccess ? 'ALLACCESS' : 'UNLIMITED';
  const salesUrl           = upgradeToAllAccess ? null : 'https://aitalker.io/unlimited-v3';
  const benefits           = upgradeToAllAccess ? allaccessBenefits : unlimitedBenefits;

  const iconGradient  = upgradeToAllAccess ? 'from-emerald-400 to-teal-500'   : 'from-amber-400 to-orange-500';
  const iconShadow    = upgradeToAllAccess ? 'shadow-emerald-500/30'           : 'shadow-amber-500/30';
  const badgeGradient = upgradeToAllAccess ? 'from-emerald-500 to-teal-500'   : 'from-amber-500 to-orange-500';
  const btnGradient   = upgradeToAllAccess
    ? 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25'
    : 'from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/25';
  const cardGradient  = upgradeToAllAccess
    ? 'from-emerald-900/40 via-teal-900/30 to-cyan-900/20 border-emerald-500/30'
    : 'from-violet-900/40 via-purple-900/30 to-pink-900/20 border-violet-500/30';

  if (compact) {
    return (
      <GlassCard className={`p-5 bg-gradient-to-br ${cardGradient}`} hover={false}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg ${iconShadow} shrink-0`}>
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">{upgradeTitle}</h3>
            <p className="text-sm text-slate-400 truncate">{upgradeDescription}</p>
          </div>
          {salesUrl ? (
            <Button
              onClick={() => window.open(salesUrl, '_blank', 'noopener,noreferrer')}
              className={`bg-gradient-to-r ${btnGradient} shrink-0`}
            >
              Upgrade <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Link to={createPageUrl('Billing')}>
              <Button className={`bg-gradient-to-r ${btnGradient} shrink-0`}>
                Upgrade <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-6 bg-gradient-to-br ${cardGradient} relative overflow-hidden`} hover={false}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-start gap-4 mb-5">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg ${iconShadow}`}
          >
            <Crown className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{upgradeTitle}</h3>
              <span className={`px-2 py-0.5 text-xs font-bold bg-gradient-to-r ${badgeGradient} text-white rounded-full`}>
                {badgeText}
              </span>
            </div>
            <p className="text-slate-400 mt-1">{upgradeDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{benefit}</span>
            </motion.div>
          ))}
        </div>

        <div className="mb-4 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300 text-center font-medium">
            🔥 Limited time — Lock in your lifetime deal before prices increase
          </p>
        </div>

        <div className="flex items-center gap-3">
          {salesUrl ? (
            <Button
              onClick={() => window.open(salesUrl, '_blank', 'noopener,noreferrer')}
              className={`flex-1 bg-gradient-to-r ${btnGradient} h-11 text-base font-semibold shadow-lg`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          ) : (
            <Link to={createPageUrl('Billing')} className="flex-1">
              <Button className={`w-full bg-gradient-to-r ${btnGradient} h-11 text-base font-semibold shadow-lg`}>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          )}
          <Link to={createPageUrl('Billing')}>
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              View Billing
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 text-center mt-3">🔒 Secure checkout • Instant access • Cancel anytime</p>
      </div>
    </GlassCard>
  );
}
