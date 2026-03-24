import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/ui/GlassCard';

export default function UrlInputStep({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    let formatted = url.trim();
    if (!formatted.startsWith('http')) formatted = 'https://' + formatted;
    onSubmit(formatted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/20 to-pink-600/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-600/15 to-violet-600/15 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative z-10 mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-3 rounded-2xl border border-violet-500/20"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-4xl sm:text-5xl font-bold mb-4"
      >
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Brand Studio
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-slate-400 text-lg max-w-lg mb-8"
      >
        Drop your website URL and we'll instantly create a custom brand voice,
        VSL script, and voiceover — powered by AI.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 w-full max-w-xl"
      >
        <GlassCard hover={false} className="p-2">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your website or sales page URL..."
                className="pl-12 pr-4 h-14 text-lg bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="h-14 px-6 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl text-base font-semibold shadow-lg shadow-violet-500/25"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 flex flex-wrap justify-center gap-3 mt-8"
      >
        {['AI Website Analysis', 'Brand Voice Creation', 'VSL Script Generator', 'One-Click Voiceover'].map((f, i) => (
          <motion.span
            key={f}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="px-4 py-2 rounded-full text-sm bg-slate-800/60 border border-slate-700/50 text-slate-300"
          >
            {f}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
