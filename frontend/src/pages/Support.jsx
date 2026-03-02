import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, Mail, MessageCircle, Book, ChevronDown, 
  ExternalLink, Send, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';

const faqs = [
  {
    question: 'How do I create my first voiceover?',
    answer: 'Navigate to Voice Studio > Create Voiceover, enter your script, select a voice type and emotion, then click Generate. Your voiceover will be ready in seconds!'
  },
  {
    question: 'What\'s the difference between Clone Voice and Custom Voice?',
    answer: 'Clone Voice creates an AI replica of an existing voice by uploading a sample. Custom Voice lets you design a completely new voice from a text description without any audio sample.'
  },
  {
    question: 'Can I edit voiceovers after generation?',
    answer: 'Yes! Go to Voice Library, click the menu on any voiceover, and select Edit. You can modify the script, change voice settings, and regenerate.'
  },
  {
    question: 'How does the Audio Mixer work?',
    answer: 'The Audio Mixer combines your voiceovers with background music. Select one or more voiceovers, choose music from the library or upload your own, adjust volumes, and generate the final mix.'
  },
  {
    question: 'What formats are supported for transcription?',
    answer: 'We support MP4, MP3, WAV, M4A files and YouTube URLs. You can export transcriptions as plain text, SRT, VTT, or JSON format.'
  },
  {
    question: 'How do I invite team members?',
    answer: 'Go to Agency > Invite User, enter their email and role. They\'ll receive an invitation link to join your workspace.'
  }
];

const resources = [
  { title: 'Getting Started Guide', icon: Book, link: '#' },
  { title: 'Video Tutorials', icon: ExternalLink, link: '#' },
  { title: 'API Documentation', icon: Book, link: '#' },
  { title: 'Community Forum', icon: MessageCircle, link: '#' },
];

export default function Support() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketData, setTicketData] = useState({
    subject: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Support ticket submitted!');
      setTicketData({ subject: '', email: '', message: '' });
    }, 1500);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((resource, i) => (
          <motion.a
            key={resource.title}
            href={resource.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="block"
          >
            <GlassCard className="p-5 text-center group">
              <resource.icon className="w-8 h-8 mx-auto text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-white text-sm">{resource.title}</h3>
            </GlassCard>
          </motion.a>
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
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Submit a Ticket
          </h2>

          {!submitted ? (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-400">Email</Label>
                <Input
                  type="email"
                  value={ticketData.email}
                  onChange={(e) => setTicketData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Subject</Label>
                <Input
                  value={ticketData.subject}
                  onChange={(e) => setTicketData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="How can we help?"
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-400">Message</Label>
                <Textarea
                  value={ticketData.message}
                  onChange={(e) => setTicketData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue or question..."
                  className="mt-1.5 min-h-[150px] bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <Button
                onClick={submitTicket}
                disabled={!ticketData.email || !ticketData.subject || !ticketData.message || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 h-12"
              >
                {isSubmitting ? (
                  <><MessageCircle className="w-5 h-5 mr-2 animate-pulse" /> Submitting...</>
                ) : (
                  <><Send className="w-5 h-5 mr-2" /> Submit Ticket</>
                )}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ticket Submitted!</h3>
              <p className="text-slate-400 mb-6">
                We've received your message and will get back to you within 24 hours.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="border-slate-700"
              >
                Submit Another
              </Button>
            </motion.div>
          )}
        </GlassCard>
      </div>

      {/* Contact Info */}
      <GlassCard className="p-6 text-center" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">Need Immediate Help?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="border-slate-700">
            <Mail className="w-4 h-4 mr-2" /> support@voiceai.com
          </Button>
          <Button variant="outline" className="border-slate-700">
            <MessageCircle className="w-4 h-4 mr-2" /> Live Chat
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}