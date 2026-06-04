import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Package, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const ITEMS = [
  {
    id: 1,
    title: '500 AI Voiceover Scripts Mega Vault',
    description: 'The complete master library of 500 ready-to-narrate voiceover scripts spanning every niche, tone, and format you\'ll ever need.',
    url: 'https://drive.google.com/file/d/1gGZMSiwXdX0S4o20gIV52MyLvvlVZL_S/view?usp=drive_link',
  },
  {
    id: 2,
    title: '100 Audio Ad Scripts for Local Businesses',
    description: 'Plug-and-play 30 and 60-second radio, podcast, and digital ad scripts for restaurants, dentists, plumbers, salons, and 50+ local niches.',
    url: 'https://drive.google.com/file/d/1Qv_ny8pHw4-GG0khhQ1jj2HKu4Mmo2bO/view?usp=drive_link',
  },
  {
    id: 3,
    title: '100 IVR & Phone System Scripts',
    description: 'Professional phone greetings, hold messages, voicemail, call menu prompts, and after-hours scripts that make any business sound enterprise-level.',
    url: 'https://drive.google.com/file/d/17Mi1NawEOhW6YAqvdX-B-uJ3M3bqNNxT/view?usp=drive_link',
  },
  {
    id: 4,
    title: '100 Explainer Video Narration Scripts',
    description: 'High-converting voiceover scripts for SaaS demos, product walkthroughs, app launches, and animated explainer videos across every industry.',
    url: 'https://drive.google.com/file/d/1r0oz2oTFyRg_Dvw-CBCunmejwZtTKnSD/view?usp=drive_link',
  },
  {
    id: 5,
    title: '100 Faceless YouTube Channel Scripts',
    description: 'Complete 7-15 minute video scripts for top-trending faceless niches: top 10 lists, motivation, history, mystery, finance, and more.',
    url: 'https://drive.google.com/file/d/11b6r2y4fsoWYuxxZJuuULr7bIqqrEKM_/view?usp=drive_link',
  },
  {
    id: 6,
    title: '100 Meditation & Wellness Audio Scripts',
    description: 'Guided meditations, sleep stories, breathwork sessions, affirmations, and morning rituals for the booming $7B wellness audio market.',
    url: 'https://drive.google.com/file/d/1bQqQypZxzns-tTA6R0PQ4MAeTTR6AvLs/view?usp=drive_link',
  },
  {
    id: 7,
    title: '100 Sales Video (VSL) Narration Scripts',
    description: 'High-converting video sales letter scripts proven to drive clicks, opt-ins, and purchases across info products, coaching, and SaaS.',
    url: 'https://drive.google.com/file/d/1J_tKZvm5bBwZtTxeDR2LbRNK0xlKldIb/view?usp=drive_link',
  },
  {
    id: 8,
    title: '100 Voice Demo Reel Scripts',
    description: 'Genre-specific demo reel samples covering commercial, narration, character, e-learning, and IVR to help any voice talent book paid work fast.',
    url: 'https://drive.google.com/file/d/10Gm_WX0GeMBrE2yyY5CY_kExCLqZa3bc/view?usp=drive_link',
  },
  {
    id: 9,
    title: '100 Social Media Video Narration Scripts',
    description: 'Hook-driven scripts engineered for Instagram Reels, TikTok, YouTube Shorts, and LinkedIn — each designed to stop the scroll and drive engagement.',
    url: 'https://drive.google.com/file/d/1J_tKZvm5bBwZtTxeDR2LbRNK0xlKldIb/view?usp=drive_link',
  },
  {
    id: 10,
    title: '100 Cold Outreach Emails That Land Clients',
    description: 'Battle-tested cold email templates and voice-note scripts that book discovery calls and convert prospects into paying clients.',
    url: 'https://drive.google.com/file/d/1cExaRblBeQJXeUgPduq7Pb6rPIM3U4mE/view?usp=drive_link',
  },
  {
    id: 11,
    title: '100 Fiverr & Upwork Gig Domination Kit',
    description: 'Gig video intros, sample work, client communications, upsells, and review requests built to dominate freelancer marketplaces.',
    url: 'https://drive.google.com/file/d/1aWyJ3DEAUIU5SaAIjYhx7dR2IK2wTM3G/view?usp=drive_link',
  },
  {
    id: 12,
    title: '100 E-Learning & Course Narration Scripts',
    description: 'Course welcomes, module intros, lesson openers, exercises, and conclusions ready for Udemy, Teachable, Kajabi, and Skool.',
    url: 'https://drive.google.com/file/d/1EIf4kgxyiuWFyU4YLveUfIX5uzUTWDDL/view?usp=drive_link',
  },
  {
    id: 13,
    title: '100 YouTube & Podcast Intro/Outro Scripts',
    description: 'Channel intros, episode openers, guest introductions, sponsor reads, and outros across 10 creator niches and content styles.',
    url: 'https://drive.google.com/file/d/1NVjBMOJD1CwLnyAR41BcPLG147IKLI9I/view?usp=drive_link',
  },
  {
    id: 14,
    title: '100 Corporate Training & HR Narration Scripts',
    description: 'Onboarding, compliance, leadership, soft skills, and safety training scripts for the $370B+ corporate learning and development industry.',
    url: 'https://drive.google.com/file/d/1nAmlSfE-gZI_lTFQSJTXk2gUTZTV7W37/view?usp=drive_link',
  },
  {
    id: 15,
    title: '100 Real Estate & Property Scripts',
    description: 'Listing showcases, agent intros, virtual tours, market updates, and CTAs that turn property videos into listing magnets.',
    url: 'https://drive.google.com/file/d/1V2VwfY_cK4Ix521tOz8lLoa-3E3O5sfk/view?usp=drive_link',
  },
  {
    id: 16,
    title: '100 Audiobook & Story Narration Scripts',
    description: 'Genre-specific samples across literary fiction, thriller, romance, sci-fi, fantasy, horror, and 4 more genres for narrators and authors.',
    url: 'https://drive.google.com/file/d/1X9QUQNrwpmtrTrKX2XS7gSd4UMH7EQ7r/view?usp=drive_link',
  },
  {
    id: 17,
    title: '100 Event & Announcement Scripts',
    description: 'Webinar intros, product launches, event invitations, live emcee scripts, and announcements that build hype and drive attendance.',
    url: 'https://drive.google.com/file/d/1qDN1mlpDFYCaKadKZCYrcFSSYrrLzxKj/view?usp=drive_link',
  },
  {
    id: 18,
    title: '100 Client Onboarding & Communication Templates',
    description: 'Welcome sequences, kickoff calls, milestone updates, and offboarding scripts that reduce churn and lift client retention by 60%+.',
    url: 'https://drive.google.com/file/d/15oFBi5wC8TtCBGDnsZn7m7ZezHTLfLuZ/view?usp=drive_link',
  },
  {
    id: 19,
    title: 'DFY AI Voiceover Agency Complete Business Kit',
    description: 'Everything needed to launch a profitable AI voiceover agency: pitches, proposals, statements of work, case studies, and full client systems.',
    url: 'https://drive.google.com/file/d/1rS9peQanAmptdDPnLD6Kf5SmJIGizHu3/view?usp=drive_link',
  },
  {
    id: 20,
    title: '100-Day Voiceover Empire Quickstart Calendar',
    description: 'A day-by-day publishing roadmap with 100 ready-to-record scripts that grow your voiceover business from zero to authority in 14 weeks.',
    url: 'https://drive.google.com/file/d/1SjKaZc7dnoVVoP0emJKhMThBk1SKg-CH/view?usp=drive_link',
  },
];

const MEGA_BUNDLE_PRODUCT_ID = '3851';

export default function MegaBundle() {
  const [activeId, setActiveId] = useState(1);
  const active = ITEMS.find((i) => i.id === activeId);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const hasAccess = (() => {
    const ids = currentUser?.billing_product_ids;
    if (!Array.isArray(ids)) return false;
    return ids.some((id) => String(id) === MEGA_BUNDLE_PRODUCT_ID);
  })();

  const handleDownload = (url) => {
    if (!hasAccess) {
      toast('Upgrade Required', {
        description: 'To access this, upgrade to Mega Bundle.',
        action: {
          label: 'Upgrade',
          onClick: () => window.open('https://pages.aitalker.io/megabundle/', '_blank', 'noopener,noreferrer'),
        },
      });
      return;
    }
    // Convert Google Drive view URL to direct download URL
    const match = url.match(/\/file\/d\/([^/]+)/);
    const downloadUrl = match
      ? `https://drive.google.com/uc?export=download&id=${match[1]}`
      : url;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Package className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Access Mega Bundle Here</h1>
          <p className="text-slate-400 text-sm mt-0.5">20 premium script libraries — click any item to download</p>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Sidebar ── */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/60">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {ITEMS.length} Bonuses Included
              </p>
            </div>
            <nav className="p-2 space-y-0.5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {ITEMS.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group
                      ${isActive
                        ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                      ${isActive ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                      {item.id}
                    </span>
                    <span className="flex-1 text-xs font-medium leading-snug line-clamp-2">{item.title}</span>
                    <ChevronRight className={`flex-shrink-0 w-3.5 h-3.5 transition-transform duration-150
                      ${isActive ? 'text-violet-400 translate-x-0.5' : 'text-slate-700 group-hover:text-slate-500'}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/60 overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

              <div className="p-6 sm:p-8 space-y-6">

                {/* Number + Title */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-violet-300">{String(active.id).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white leading-snug">{active.title}</h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">PDF Script Library</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-slate-300 text-sm leading-relaxed">{active.description}</p>
                </div>

                {/* Download CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-slate-500">Opens in Google Drive for instant access and download.</p>
                  <Button
                    onClick={() => handleDownload(active.url)}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-6 h-11 rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Download Now
                  </Button>
                </div>
              </div>

              {/* Footer nav */}
              <div className="px-6 sm:px-8 py-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => setActiveId(Math.max(1, activeId - 1))}
                  disabled={activeId === 1}
                  className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Previous
                </button>
                <span className="text-xs text-slate-600">{activeId} / {ITEMS.length}</span>
                <button
                  onClick={() => setActiveId(Math.min(ITEMS.length, activeId + 1))}
                  disabled={activeId === ITEMS.length}
                  className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
