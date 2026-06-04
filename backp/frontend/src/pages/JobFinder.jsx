import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import JobCard from '@/components/jobs/JobCard';
import ProposalModal from '@/components/jobs/ProposalModal';
import { toast } from 'sonner';

const popularSearches = [
  'Voice Over Artist', 'Video Editor', 'Logo Design', 'Web Developer',
  'Copywriter', 'Social Media Manager', 'AI Automation', 'WordPress'
];

const PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    proposal: { type: 'string' },
  },
  required: ['proposal'],
};

export default function JobFinder() {
  const [query, setQuery]               = useState('');
  const [jobs, setJobs]                 = useState([]);
  const [searching, setSearching]       = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [selectedJob, setSelectedJob]   = useState(null);
  const [stats, setStats]               = useState({ searched: 0, proposals: 0 });

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      toast.error('Please enter a skill or keyword to search for jobs.');
      return;
    }

    setSearching(true);
    setJobs([]);
    try {
      const result = await base44.jobs.search(q);
      const jobList = result?.jobs || [];
      if (!jobList.length) {
        toast.error('No jobs found. Try different keywords.');
        return;
      }
      setJobs(jobList);
      setStats(prev => ({ ...prev, searched: prev.searched + 1 }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to search jobs. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateProposal = async (job) => {
    setGeneratingFor(job.job_title);
    try {
      const jobDescription = `Job Title: ${job.job_title}
Platform: ${job.platform}
Description: ${job.job_description}
Budget: ${job.budget || 'Not specified'}
Skills Required: ${job.skills_required?.join(', ') || 'Not specified'}
Client: ${job.client_name || 'Not specified'}`;

      const prompt = `You are an expert freelance proposal writer. Write a compelling, professional proposal for the following job posting.

Job Description:
${jobDescription}

Write a proposal that:
1. Opens with a personalized hook showing you understand the client's needs
2. Highlights relevant experience and skills
3. Outlines a clear approach/plan
4. Mentions timeline and availability
5. Ends with a confident call to action

Keep it between 150-250 words. Be professional but personable. Don't use generic templates - make it feel custom.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: PROPOSAL_SCHEMA,
      });

      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      const proposal = parsed?.proposal || '';

      if (!proposal) {
        toast.error('Failed to generate proposal. Please try again.');
        return;
      }

      const updatedJobs = jobs.map(j =>
        j.job_title === job.job_title
          ? { ...j, generated_proposal: proposal, proposal_status: 'generated' }
          : j
      );
      setJobs(updatedJobs);
      setStats(prev => ({ ...prev, proposals: prev.proposals + 1 }));

      const updatedJob = updatedJobs.find(j => j.job_title === job.job_title);
      setSelectedJob(updatedJob);
      toast.success('Proposal generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate proposal. Please try again.');
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Job Finder"
        description="Search freelance jobs across all platforms, create AI proposals, and apply instantly"
        icon={Briefcase}
        gradient="from-blue-500 to-cyan-500"
      />

      {/* Stats Bar */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <Search className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">{stats.searched} searches</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">{stats.proposals} proposals</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search for jobs... e.g. 'Voice Over Artist', 'React Developer'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12 text-base bg-slate-800/50 border-slate-700"
            />
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={searching || !query.trim()}
            size="lg"
            className="px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search Jobs'}
          </Button>
        </div>

        {/* Popular searches */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-slate-500 self-center">Popular:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => { setQuery(term); handleSearch(term); }}
              className="text-xs px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 hover:bg-violet-500/20 hover:text-violet-300 border border-slate-700/50 hover:border-violet-500/30 transition-all"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {searching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30"
          >
            <Search className="w-7 h-7 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-1">Searching across platforms...</h3>
          <p className="text-sm text-slate-400">Finding the best "{query}" jobs for you</p>
        </motion.div>
      )}

      {/* Results */}
      {!searching && jobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{jobs.length} Jobs Found</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.map((job, i) => (
              <JobCard
                key={i}
                job={job}
                index={i}
                onCreateProposal={handleCreateProposal}
                isGenerating={generatingFor === job.job_title}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searching && jobs.length === 0 && query && (
        <div className="text-center py-12">
          <p className="text-slate-400">No jobs found. Try a different search term.</p>
        </div>
      )}

      {/* Proposal Modal */}
      {selectedJob?.generated_proposal && (
        <ProposalModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
