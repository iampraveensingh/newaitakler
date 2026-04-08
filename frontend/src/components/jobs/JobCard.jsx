import { motion } from 'framer-motion';
import { ExternalLink, Clock, DollarSign, Users, Briefcase, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const platformColors = {
  upwork:        'from-green-500/20 to-green-600/10 border-green-500/30',
  freelancer:    'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  fiverr:        'from-teal-500/20 to-teal-600/10 border-teal-500/30',
  golance:       'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
  peopleperhour: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  guru:          'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  other:         'from-slate-500/20 to-slate-600/10 border-slate-500/30',
};

const platformLabels = {
  upwork:        '🟢 Upwork',
  freelancer:    '🔵 Freelancer',
  fiverr:        '🟩 Fiverr',
  golance:       '🔷 GoLance',
  peopleperhour: '🟠 PeoplePerHour',
  guru:          '🟣 Guru',
  other:         '⚪ Other',
};

export default function JobCard({ job, onCreateProposal, isGenerating, index }) {
  const platform = (job.platform || 'other').toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'relative rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-xl transition-all hover:scale-[1.01]',
        platformColors[platform] || platformColors.other
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-tight line-clamp-2">{job.job_title}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
              {platformLabels[platform] || platform}
            </span>
            {job.client_name && (
              <span className="text-xs text-slate-400">by {job.client_name}</span>
            )}
            {job.posted_date && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {job.posted_date}
              </span>
            )}
          </div>
        </div>
        {job.budget && (
          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> {job.budget}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-3">{job.job_description}</p>

      {/* Skills */}
      {job.skills_required?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills_required.slice(0, 5).map((skill, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/20">
              {skill}
            </span>
          ))}
          {job.skills_required.length > 5 && (
            <span className="text-xs text-slate-500">+{job.skills_required.length - 5} more</span>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
        {job.job_type && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {job.job_type === 'fixed' ? 'Fixed Price' : 'Hourly'}
          </span>
        )}
        {job.proposals_count && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {job.proposals_count} proposals
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onCreateProposal(job)}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isGenerating ? 'Generating...' : 'Create Proposal'}
        </Button>
        {job.job_url && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(job.job_url, '_blank')}
            className="gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Apply
          </Button>
        )}
      </div>

      {/* Inline Proposal */}
      {job.generated_proposal && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-violet-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">✨ AI Proposal</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => navigator.clipboard.writeText(job.generated_proposal)}
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{job.generated_proposal}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
