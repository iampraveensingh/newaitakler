import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FALLBACK_LIMITS = {
  credits: 1000,
  clones: 3,
  vsl: 10,
  ad: 15,
  custom: 2,
  transcriptions: 10,
};

/**
 * Returns `checkLimit(feature)` → { allowed: bool, used: number, limit: number }
 *
 * Uses the same query keys as Dashboard so the cache is shared.
 * Feature pages that call `invalidateQueries({ queryKey: ['monthlyUsage'] })`
 * also invalidate this hook's usage query (prefix match in TanStack Query v5).
 */
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
  const usage = monthlyUsageData?.[0] ?? {};

  // null limit = unlimited (e.g. addon unlocks the feature)
  const hasUnlimitedTranscriptions =
    currentUser?.addons?.transcribe === true || currentUser?.addons?.TRANSCRIBE === true;

  const checkLimit = (feature) => {
    const map = {
      clones:         { used: usage.clones_used ?? 0,         limit: limits.clones },
      vsl:            { used: usage.vsl_used ?? 0,            limit: limits.vsl },
      ad:             { used: usage.ad_used ?? 0,             limit: limits.ad },
      custom:         { used: usage.custom_used ?? 0,         limit: limits.custom },
      transcriptions: { used: usage.transcriptions_used ?? 0, limit: hasUnlimitedTranscriptions ? null : limits.transcriptions },
      credits:        { used: usage.credits_used ?? 0,        limit: limits.credits },
    };
    const f = map[feature];
    if (!f) return { allowed: true, used: 0, limit: 999 };
    if (f.limit === null) return { allowed: true, used: f.used, limit: null };
    return { allowed: f.used < f.limit, used: f.used, limit: f.limit };
  };

  return { checkLimit };
}
