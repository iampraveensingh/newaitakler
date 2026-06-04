import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Mail, MessageCircle, Book, ChevronDown,
  Play, ExternalLink
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

const faqs = [
  {
    question: 'How do I create my first voiceover?',
    answer: 'Go to Voice Studio → Create Voiceover. Type or paste your script, choose a voice style and emotion, then hit Generate. Your voiceover is processed instantly and saved to your Voice Library for playback, editing, or download.'
  },
  {
    question: 'Can I edit a voiceover after it has been generated?',
    answer: 'Yes. Open Voice Studio → Voice Library, click the menu (⋮) on any voiceover, and choose Edit. Update the script or voice settings and regenerate — the original file will be replaced with the new version.'
  },
  {
    question: 'What is the difference between Clone Voice and Custom Voice?',
    answer: 'Clone Voice replicates a real voice — upload a short audio sample and the AI learns to mimic it. Custom Voice creates a brand-new AI voice from a written description (tone, gender, accent, style) without requiring any audio sample. Both clones and custom voices appear in your voice selection when creating voiceovers.'
  },
  {
    question: 'How does the Audio Mixer work?',
    answer: 'Navigate to Audio Tools → Audio Mixer. Select one or more voiceovers from your library, pick a background music track, set individual volume levels for voice and music, then generate the final mixed file. Completed projects are saved under Mixer Projects for later download or re-mixing.'
  },
  {
    question: 'What are VSL Copy and Ad Copy, and how do I use them?',
    answer: 'VSL Copy generates long-form video sales letter scripts tailored to your product or offer. Ad Copy produces short-form advertising copy for social media, email, or landing pages. Both are found under Copy Creator. Fill in your product details, choose a tone, generate, and save to the respective library for future reference.'
  },
  {
    question: 'How does Transcription work and what file types are supported?',
    answer: 'Go to the Transcribe page, upload an audio or video file (MP3, MP4, WAV, M4A), and the AI will produce a full text transcript. You can review, copy, or download the result. Transcription usage is tracked monthly on your Dashboard.'
  },
  {
    question: 'What are credits and how are they consumed?',
    answer: 'Credits are consumed each time you generate a voiceover. Your monthly credit balance is shown on the Dashboard. Agency sub-users draw from a separate credit allocation set by the admin — not from the main account balance. Upgrading your plan increases your monthly credit limit.'
  },
  {
    question: 'I use the Support portal and the Members Dashboard — do I need two logins?',
    answer: 'No. Expressive Voice uses a centralized login system. Your Support portal credentials and Members Dashboard credentials are the same username and password. Sign in once at the login page to access everything.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click the "Forgot Password?" link on the login page. You will be redirected to the ProWebVentures account portal where you can request a password reset link via email.'
  },
  {
    question: 'How does the Agency feature work?',
    answer: 'Agency (available on PRO and XTREME plans with the Agency add-on) lets you create and manage sub-users under your account. Go to the Agency page to add users, assign credit balances, and monitor their usage. Sub-users log in with their own credentials and only see their own work.'
  },
  {
    question: 'Where can I track my overall usage?',
    answer: 'The Dashboard displays your monthly usage across all features: voiceover credits used, voice clones created, VSL scripts, ad copies, custom voices, and transcription minutes. The stats reset at the start of each billing month.'
  },
  {
    question: 'How do I download a finished voiceover or mixed audio?',
    answer: 'From the Voice Library or Mixer Projects page, click the download icon on any completed item. Files are exported as high-quality MP3. Make sure your browser allows file downloads from this domain if the download does not start automatically.'
  },
];

const resources = [
  { title: 'Getting Started Guide', icon: Book, page: 'GettingStarted' },
  { title: 'Video Tutorials', icon: Play, page: 'VideoTutorials' },
];

export default function Support() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketEmail, setTicketEmail] = useState('');

  const openHelpDesk = () => {
    if (!ticketEmail.trim()) return;
    const url = `https://help.prowebventures.com/service?email=${encodeURIComponent(ticketEmail.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Support Center"
        description="Get help and find answers to your questions"
        icon={HelpCircle}
        gradient="from-blue-500 to-cyan-500"
      />

      {/* Quick Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {resources.map((resource, i) => (
          <motion.button
            key={resource.title}
            onClick={() => navigate(createPageUrl(resource.page))}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="block w-full text-left"
          >
            <GlassCard className="p-5 text-center group ring-1 ring-violet-500/20 hover:ring-violet-500/50">
              <resource.icon className="w-8 h-8 mx-auto mb-3 text-violet-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-white text-sm">{resource.title}</h3>
              <span className="inline-block mt-2 text-xs text-violet-400/70 group-hover:text-violet-300 transition-colors">
                Open →
              </span>
            </GlassCard>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQs */}
        <GlassCard className="p-6" hover={false}>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-700/50 last:border-0">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left py-4 flex items-start justify-between gap-4 group"
                >
                  <span className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-slate-400 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Contact Form */}
        <GlassCard className="p-6" hover={false}>
          <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Submit a Ticket
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            Enter your email and we'll take you to our helpdesk with it pre-filled.
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Your Email</Label>
              <Input
                type="email"
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && openHelpDesk()}
                placeholder="your@email.com"
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <Button
              onClick={openHelpDesk}
              disabled={!ticketEmail.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 h-11"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open Help Desk
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Contact Info */}
      <GlassCard className="p-6 text-center" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-1">Need Immediate Help?</h3>
        <p className="text-sm text-slate-400 mb-4">Our support team typically responds within 24 hours.</p>
        <div className="flex justify-center">
          <a href="mailto:support@prowebventures.com">
            <Button variant="outline" className="border-slate-700 hover:border-violet-500/60 hover:text-violet-300 transition-colors">
              <Mail className="w-4 h-4 mr-2" /> support@prowebventures.com
            </Button>
          </a>
        </div>
      </GlassCard>
    </div>
  );
}