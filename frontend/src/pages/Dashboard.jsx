import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  AudioLines, Copy, Sparkles, FileText, Video, Music2, 
  TrendingUp, Clock, Star
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PageHeader from '@/components/ui/PageHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentProjectCard from '@/components/dashboard/RecentProjectCard';
import CreditsCard from '@/components/dashboard/CreditsCard';
import UsageLimitsCard from '@/components/dashboard/UsageLimitsCard';
import UpgradeCard from '@/components/dashboard/UpgradeCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  // Fetch current user with plan info
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch plan limits based on user's base_plan
  const { data: planLimits } = useQuery({
    queryKey: ['planLimits', currentUser?.base_plan],
    queryFn: () => base44.entities.PlanLimits.filter({ plan_id: currentUser?.base_plan }),
    enabled: !!currentUser?.base_plan
  });

  // Fetch current month usage
  const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { data: monthlyUsage } = useQuery({
    queryKey: ['monthlyUsage', currentUser?.id, currentMonthYear],
    queryFn: () => base44.entities.UserUsageMonthly.filter({ 
      user_id: currentUser?.id, 
      month_year: currentMonthYear 
    }),
    enabled: !!currentUser?.id
  });

  const { data: voiceovers = [], isLoading: loadingVO } = useQuery({
    queryKey: ['voiceovers'],
    queryFn: () => base44.entities.VoiceOver.list('-created_at', 5)
  });

  const { data: clones = [], isLoading: loadingClones } = useQuery({
    queryKey: ['clones'],
    queryFn: () => base44.entities.VoiceClone.list('-created_at', 5)
  });

  const { data: vslCopies = [], isLoading: loadingVSL } = useQuery({
    queryKey: ['vslCopies'],
    queryFn: () => base44.entities.VSLCopy.list('-created_at', 5)
  });

  const { data: transcriptions = [], isLoading: loadingTrans } = useQuery({
    queryKey: ['transcriptions'],
    queryFn: () => base44.entities.Transcription.list('-created_at', 5)
  });

  const { data: customVoices = [] } = useQuery({
    queryKey: ['customVoices'],
    queryFn: () => base44.entities.CustomVoice.list()
  });

  const { data: adCopies = [] } = useQuery({
    queryKey: ['adCopies'],
    queryFn: () => base44.entities.AdCopy.list()
  });

  const isLoading = loadingVO || loadingClones || loadingVSL || loadingTrans;

  // Get limits from plan or use defaults
  const limits = planLimits?.[0] || {
    credits: 1000,
    clones: 3,
    vsl: 10,
    ad: 15,
    custom: 2,
    transcriptions: 10,
    brand_studio: 5,
    conversational: 5,
    audio_mix: 10,
  };

  // Get usage from monthly record or default to 0
  const usage = monthlyUsage?.[0] || {
    credits_used: 0,
    clones_used: 0,
    vsl_used: 0,
    ad_used: 0,
    custom_used: 0,
    transcriptions_used: 0,
    brand_studio_used: 0,
    conversational_used: 0,
    audio_mix_used: 0,
  };

  // Agency sub-users have a personal credit allocation instead of a plan-level limit
  const isAgencySubUser = !!currentUser?.agency_owner_id;

  // Add-on holders get a high fixed limit (1000) instead of their plan's default
  const ADDON_LIMIT = 1000;
  const addons = currentUser?.addons ?? {};

  const hasAddonTranscriptions = addons.transcribe === true || addons.TRANSCRIBE === true;
  const hasAddonVSL            = addons.vsl === true || addons.VSL === true;
  const hasAddonAdCopy         = addons.adcopy === true || addons.ADCOPY === true || addons.ad_copy === true;

  // Build usage data for cards
  const usageCounts = {
    credits: { used: usage.credits_used, limit: currentUser?.credits_balance ?? limits.credits },
    clones: { used: usage.clones_used, limit: limits.clones },
    brand_studio: { used: usage.brand_studio_used, limit: limits.brand_studio },
    vsl: { used: usage.vsl_used, limit: hasAddonVSL ? ADDON_LIMIT : limits.vsl },
    adcopy: { used: usage.ad_used, limit: hasAddonAdCopy ? ADDON_LIMIT : limits.ad },
    customvoice: { used: usage.custom_used, limit: limits.custom },
    transcriptions: { used: usage.transcriptions_used, limit: hasAddonTranscriptions ? ADDON_LIMIT : limits.transcriptions },
    conversational: { used: usage.conversational_used, limit: limits.conversational },
    audio_mix: { used: usage.audio_mix_used, limit: limits.audio_mix },
  };

  // Combine recent projects
  const recentProjects = [
    ...voiceovers.map(v => ({ ...v, type: 'voiceover', icon: AudioLines, editPage: 'CreateVoiceover' })),
    ...clones.map(c => ({ ...c, type: 'clone', icon: Copy, editPage: 'CloneVoice' })),
    ...vslCopies.map(v => ({ ...v, type: 'vsl', icon: FileText, editPage: 'CreateVSL' })),
    ...transcriptions.map(t => ({ ...t, type: 'transcription', icon: Video, editPage: 'Transcribe' })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  const completedCount = [...voiceovers, ...clones, ...vslCopies, ...transcriptions]
    .filter(p => p.status === 'completed' || p.status === 'ready').length;

  const processingCount = [...voiceovers, ...clones, ...vslCopies, ...transcriptions]
    .filter(p => p.status === 'processing').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome Back"
        description="Your AI Voice & Content Creation Hub"
        icon={AudioLines}
      />

      {/* Credits & Usage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CreditsCard 
          creditsUsed={usageCounts.credits.used} 
          creditsLimit={usageCounts.credits.limit}
          planName={currentUser?.base_plan}
        />
        <UsageLimitsCard counts={usageCounts} />
        <UpgradeCard currentPlan={currentUser?.base_plan} addons={currentUser?.addons} isAgencySubUser={isAgencySubUser} />
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6" hover={false}>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          Quick Actions
        </h2>
        <QuickActions />
      </GlassCard>

      {/* Recent Projects */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-300" />
            Recent Projects
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/30 border border-slate-700/30 p-5">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl bg-slate-700" />
                  <Skeleton className="w-8 h-8 rounded-lg bg-slate-700" />
                </div>
                <Skeleton className="h-5 w-3/4 bg-slate-700 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-slate-700" />
              </div>
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recentProjects.map((project) => (
              <RecentProjectCard
                key={`${project.type}-${project.id}`}
                project={project}
                type={project.type}
                icon={project.icon}
                editPage={project.editPage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <AudioLines className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-300">No projects yet. Start creating!</p>
          </div>
        )}
      </GlassCard>

      {/* Favorites Section */}
      {voiceovers.some(v => v.is_favorite) && (
        <GlassCard className="p-6" hover={false}>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Favorites
          </h2>
          <div className="space-y-3">
            {voiceovers.filter(v => v.is_favorite).map((project) => (
              <RecentProjectCard
                key={project.id}
                project={project}
                type="voiceover"
                icon={AudioLines}
                editPage="CreateVoiceover"
              />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}