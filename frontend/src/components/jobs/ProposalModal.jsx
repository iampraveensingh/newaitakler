import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProposalModal({ job, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(job.generated_proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI-Generated Proposal</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{job.job_title}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {job.generated_proposal}
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 flex gap-3">
            <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Proposal'}
            </Button>
            {job.job_url && (
              <Button
                onClick={() => window.open(job.job_url, '_blank')}
                className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-purple-600"
              >
                <ExternalLink className="w-4 h-4" /> Apply on {job.platform || 'Platform'}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
