import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Gift, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BONUSES = [
  {
    id: 1,
    title: '100 DFY Multi-Speaker Conversation Scripts',
    description: '10 categories × 10 dialogue scripts with speaker roles and voice prompt suggestions for podcast interviews, sales calls, debates, comedy sketches, and more.',
    url: 'https://drive.google.com/file/d/1GMhPNrkH1lVbQn5fx8zC0ZqZeAZ2aakp/view?usp=drive_link',
  },
  {
    id: 2,
    title: '100 DFY Podcast Scripts — The Ultimate Episode Vault',
    description: '100 complete episode scripts across 10 genres with intro hooks, transitions, outro CTAs, and multi-speaker voice prompts.',
    url: 'https://drive.google.com/file/d/1GkfjD4kWvdHd5viYhrhXKYWwTCHUVX9Y/view',
  },
  {
    id: 3,
    title: '50 DFY YouTube Video Scripts + Voice Prompts',
    description: '50 scripts across 10 faceless niches with hook, body, CTA, and exact AI Talker voice prompt per script.',
    url: 'https://drive.google.com/file/d/10-71BaDc0CF1NtJmwMHDFKOmM8tchcis/view?usp=drive_link',
  },
  {
    id: 4,
    title: '100 DFY Brand Voice Prompts — URL-to-Voice Industry Templates',
    description: '100 brand voice templates across 20 industries for Brand Architect. Paste client URL, grab template, get brand-matched voice in 2 minutes.',
    url: 'https://drive.google.com/file/d/17YvgVEUn5H97lJjWB8fyeTxJRssCpSZ1/view?usp=drive_link',
  },
  {
    id: 5,
    title: '200 Advanced Voiceover Niche Prompts — The Mega Vault',
    description: '200 voice prompts across 40 micro-niches. The ultimate prompt library from meditation to startup pitch to true crime.',
    url: 'https://drive.google.com/file/d/1lkkrbun2TliiJ428vfKqAFuz3pl_vFSS/view?usp=drive_link',
  },
  {
    id: 6,
    title: '100 DFY Voiceover Gig Descriptions',
    description: '100 gig listings across 4 freelance platforms (25 each: Upwork, Fiverr, Freelancer, PeoplePerHour). Copy, paste, dominate.',
    url: 'https://drive.google.com/file/d/1EIg3Ye47ZidLr3XMUI-GzWU6vHq1RgSZ/view?usp=drive_link',
  },
  {
    id: 7,
    title: '50 Cold Outreach Messages',
    description: '50 copy-paste messages across Email, LinkedIn, Instagram, and WhatsApp with opener, value hook, sample offer, CTA, and 2 follow-ups.',
    url: 'https://drive.google.com/file/d/1UTht26BeBzU-6MXocLY9lsTXTXp83jqY/view?usp=drive_link',
  },
  {
    id: 8,
    title: '50 High-Ticket Closer Scripts — Phone, Zoom & Chat',
    description: '50 closing scripts organized by deal size ($200 to $2,500) with opening, discovery, pitch, objection handling, and close.',
    url: 'https://drive.google.com/file/d/1Wxi5uNma8tr3QFbE83FdWilcIRmidYOP/view?usp=drive_link',
  },
  {
    id: 9,
    title: '100 DFY Social Media Posts — Voice Sample Content Kit',
    description: '100 days of ready-to-post content (35 LinkedIn, 35 Instagram, 30 Twitter/X) with voice prompt, caption, and hashtags per post.',
    url: 'https://drive.google.com/file/d/1ESy-1dWk5WrZyjkK387S2BSjiSn9sDCe/view?usp=drive_link',
  },
  {
    id: 10,
    title: 'VIP Live Training — AI Talker Profit Setup Workshop + Recording',
    description: 'Live walkthrough creating samples, publishing gigs, applying to jobs, setting pricing, and sending outreach with full recording and Q&A included.',
    url: 'https://drive.google.com/file/d/1uA_JY31eouDrlZZAdxfEzjebphHrf_G3/view?usp=drive_link',
  },
  {
    id: 11,
    title: 'First Client In 7 Days Checklist',
    description: 'Step-by-step daily checklist from Day 1 (set up profiles) to Day 7 (deliver first paid order). No guesswork, no fluff.',
    url: 'https://drive.google.com/file/d/1x2Lyp3fQwW8LaCweMiZtcXUrSskaJKmJ/view?usp=drive_link',
  },
  {
    id: 12,
    title: 'The AI Voice Prompt Vault',
    description: 'Advanced prompt engineering guide with 100+ prompt formulas, modifier stacking techniques, and voice tuning workflows for Voice Designer power users.',
    url: 'https://drive.google.com/file/d/1iHFDtZi1dZ8hP1rZbfM9HGp3zeK9yWyR/view?usp=drive_link',
  },
  {
    id: 13,
    title: 'The Viral VSL Script Bank',
    description: '100+ VSL frameworks built around proven structures (Problem-Agitate-Solve, Hook-Story-Offer, Before-After-Bridge) optimized for AI voice delivery.',
    url: 'https://drive.google.com/file/d/1rx5BNSCTAe4UKMOgQNWt9XS9f2u6ISgd/view?usp=drive_link',
  },
  {
    id: 14,
    title: 'The Voice Cloning Cash Machine',
    description: '100+ done-for-you client outreach scripts, service proposals, and pricing templates for launching a voice cloning agency or freelance service.',
    url: 'https://drive.google.com/file/d/1TCdRFaNU-V9GQsyta7JiBKCgqovFJpIH/view?usp=drive_link',
  },
  {
    id: 15,
    title: 'The Faceless YouTube Empire Kit',
    description: '100+ niche breakdowns with channel blueprints, content calendars, monetization strategies, and AI voice workflow guides for faceless creators.',
    url: 'https://drive.google.com/file/d/1HLHdqqMqJTJNTU1hqAXDN0HmlVDGmmWK/view?usp=drive_link',
  },
  {
    id: 16,
    title: 'The AI Audiobook Profit Playbook',
    description: '100+ public domain book picks with narration templates, ACX/Audible submission guides, and royalty strategies for passive audiobook income.',
    url: 'https://drive.google.com/file/d/1SV7jwMBiRhnoSwsKpG5f2yZmJsCMI3MT/view?usp=drive_link',
  },
  {
    id: 17,
    title: 'The Podcast-to-Profit Blueprint',
    description: '100+ podcast niche ideas with full episode structures, intro/outro scripts, guest interview frameworks, and monetization playbooks using AI voices.',
    url: 'https://drive.google.com/file/d/1JTvLvXVqsp2fuo0_800zAb4SxZ6-i83b/view?usp=drive_link',
  },
];

const toDownloadUrl = (url) => {
  const match = url.match(/\/file\/d\/([^/]+)/);
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : url;
};

export default function BonusesNew() {
  const [activeId, setActiveId] = useState(1);
  const active = BONUSES.find((b) => b.id === activeId);

  const handleDownload = (url) => {
    window.open(toDownloadUrl(url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Gift className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Bonuses</h1>
          <p className="text-slate-400 text-sm mt-0.5">{BONUSES.length} exclusive resources — click any item to download</p>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/60">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {BONUSES.length} Bonuses Included
              </p>
            </div>
            <nav className="p-2 space-y-0.5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {BONUSES.map((bonus) => {
                const isActive = bonus.id === activeId;
                return (
                  <button
                    key={bonus.id}
                    onClick={() => setActiveId(bonus.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group
                      ${isActive
                        ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                      ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                      {bonus.id}
                    </span>
                    <span className="flex-1 text-xs font-medium leading-snug line-clamp-2">{bonus.title}</span>
                    <ChevronRight className={`flex-shrink-0 w-3.5 h-3.5 transition-transform duration-150
                      ${isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-700 group-hover:text-slate-500'}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Panel */}
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
              {/* Accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />

              <div className="p-6 sm:p-8 space-y-6">

                {/* Number + Title */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-amber-300">{String(active.id).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white leading-snug">{active.title}</h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500">Bonus Resource</span>
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
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold px-6 h-11 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200"
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
                <span className="text-xs text-slate-600">{activeId} / {BONUSES.length}</span>
                <button
                  onClick={() => setActiveId(Math.min(BONUSES.length, activeId + 1))}
                  disabled={activeId === BONUSES.length}
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
