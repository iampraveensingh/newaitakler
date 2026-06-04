import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FALLBACK_LIMITS = {
  credits: 1000,
  clones: 3,
  vsl: 10,
  ad: 15,
  custom: 2,
  transcriptions: 10,
  brand_studio: 5,
  conversational: 5,
  audio_mix: 10,
  audiobook: 5,
};

// -1 in plan_limits means unlimited — always allowed, no cap
const isUnlimited = (val) => val === -1 || val === null;

export function useUsageLimits() {
  const currentMonthYear = new Date().toISOString().slice(0, 7);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const addonsRaw       = currentUser?.addons ?? {};
  const hasAllAccess    = addonsRaw.ALLACCESS  === true || addonsRaw.allaccess  === true;
  const hasUnlimited    = addonsRaw.UNLIMITED  === true || addonsRaw.unlimited  === true;
  const basePlanUpper   = (currentUser?.base_plan || '').toUpperCase();
  // Priority: ALLACCESS addon > BUNDLE plan > UNLIMITED addon > base plan
  const effectivePlan   = hasAllAccess
    ? 'ALLACCESS'
    : basePlanUpper === 'BUNDLE'
      ? 'BUNDLE'
      : hasUnlimited
        ? 'UNLIMITED'
        : currentUser?.base_plan;

  const { data: planLimitsData } = useQuery({
    queryKey: ['planLimits', effectivePlan],
    queryFn: () => base44.entities.PlanLimits.filter({ plan_id: effectivePlan }),
    enabled: !!effectivePlan,
    staleTime: 10 * 60 * 1000,
  });

  const { data: monthlyUsageData } = useQuery({
    queryKey: ['monthlyUsage', currentUser?.id, currentMonthYear],
    queryFn: () => base44.entities.UserUsageMonthly.filter({
      user_id: currentUser?.id,
      month_year: currentMonthYear,
    }),
    enabled: !!currentUser?.id,
  });

  const limits = planLimitsData?.[0] ?? FALLBACK_LIMITS;
  const usage  = monthlyUsageData?.[0] ?? {};

  const plan = (effectivePlan || '').toUpperCase();

  // BUNDLE/ALLACCESS — fully unlimited, no plan_limits check needed
  const isBundle = plan === 'BUNDLE' || plan === 'ALLACCESS';

  // Feature-specific addon flags (addon keys match product_entitlements.code)
  const hasAddonVSL         = addonsRaw.vsl          === true || addonsRaw.VSL          === true;
  const hasAddonAd          = addonsRaw.ad            === true || addonsRaw.AD            === true;
  const hasAddonVoiceCloner = addonsRaw.voicecloner   === true || addonsRaw.VOICECLONER   === true;
  const hasAddonTranscribe  = addonsRaw.transcribe    === true || addonsRaw.TRANSCRIBE    === true;

  const checkLimit = (feature) => {
    if (isBundle) return { allowed: true, used: usage[`${feature}_used`] ?? 0, limit: -1 };

    const featureMap = {
      credits:        { usedKey: 'credits_used',        limitVal: limits.credits },
      clones:         { usedKey: 'clones_used',         limitVal: hasAddonVoiceCloner ? -1 : limits.clones },
      vsl:            { usedKey: 'vsl_used',            limitVal: hasAddonVSL         ? -1 : limits.vsl },
      ad:             { usedKey: 'ad_used',             limitVal: hasAddonAd          ? -1 : limits.ad },
      custom:         { usedKey: 'custom_used',         limitVal: limits.custom },
      transcriptions: { usedKey: 'transcriptions_used', limitVal: hasAddonTranscribe  ? -1 : limits.transcriptions },
      brand_studio:   { usedKey: 'brand_studio_used',   limitVal: limits.brand_studio },
      conversational: { usedKey: 'conversational_used', limitVal: limits.conversational },
      audio_mix:      { usedKey: 'audio_mix_used',      limitVal: limits.audio_mix },
      audiobook:      { usedKey: 'audiobook_used',      limitVal: limits.audiobook },
    };

    const f = featureMap[feature];
    if (!f) return { allowed: true, used: 0, limit: -1 };

    const used = usage[f.usedKey] ?? 0;

    // -1 = unlimited (from plan_limits or addon override)
    if (isUnlimited(f.limitVal)) return { allowed: true, used, limit: -1 };

    return { allowed: used < f.limitVal, used, limit: f.limitVal };
  };

  return { checkLimit, isBundle };
}
