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

  const { data: planLimitsData } = useQuery({
    queryKey: ['planLimits', currentUser?.base_plan],
    queryFn: () => base44.entities.PlanLimits.filter({ plan_id: currentUser?.base_plan }),
    enabled: !!currentUser?.base_plan,
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

  const addons = currentUser?.addons ?? {};
  const plan   = (currentUser?.base_plan || '').toUpperCase();

  // ALLACCESS plan or UNLIMITED plan — everything is unlimited
  const isAllAccess = plan === 'ALLACCESS';
  const isUnlimitedPlan = plan === 'UNLIMITED';

  // Add-on overrides — bump to a high cap
  const ADDON_LIMIT = 1000;
  const hasAddonTranscriptions = addons.transcribe    === true || addons.TRANSCRIBE    === true;
  const hasAddonVSL            = addons.vsl           === true || addons.VSL           === true;
  const hasAddonAdCopy         = addons.ad            === true || addons.AD            === true
                               || addons.adcopy       === true || addons.ADCOPY        === true;

  const checkLimit = (feature) => {
    // ALLACCESS — fully unlimited on everything
    if (isAllAccess) return { allowed: true, used: usage[`${feature}_used`] ?? 0, limit: -1 };

    const map = {
      clones:         { used: usage.clones_used         ?? 0, limit: limits.clones },
      vsl:            { used: usage.vsl_used            ?? 0, limit: hasAddonVSL ? ADDON_LIMIT : limits.vsl },
      ad:             { used: usage.ad_used             ?? 0, limit: hasAddonAdCopy ? ADDON_LIMIT : limits.ad },
      custom:         { used: usage.custom_used         ?? 0, limit: limits.custom },
      transcriptions: { used: usage.transcriptions_used ?? 0, limit: hasAddonTranscriptions ? ADDON_LIMIT : limits.transcriptions },
      credits:        { used: usage.credits_used        ?? 0, limit: limits.credits },
      brand_studio:   { used: usage.brand_studio_used   ?? 0, limit: limits.brand_studio },
      conversational: { used: usage.conversational_used ?? 0, limit: limits.conversational },
      audio_mix:      { used: usage.audio_mix_used      ?? 0, limit: limits.audio_mix },
      audiobook:      { used: usage.audiobook_used      ?? 0, limit: limits.audiobook },
    };

    const f = map[feature];
    if (!f) return { allowed: true, used: 0, limit: -1 };

    // -1 from plan_limits = unlimited
    if (isUnlimited(f.limit)) return { allowed: true, used: f.used, limit: -1 };

    return { allowed: f.used < f.limit, used: f.used, limit: f.limit };
  };

  return { checkLimit, isAllAccess, isUnlimitedPlan };
}
