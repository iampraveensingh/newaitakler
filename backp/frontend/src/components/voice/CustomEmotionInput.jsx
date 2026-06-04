import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const suggestionChips = [
  { label: 'Nostalgic',   emoji: '🎞️' },
  { label: 'Whispery',    emoji: '🤫'  },
  { label: 'Sarcastic',   emoji: '😏'  },
  { label: 'Mysterious',  emoji: '🔮'  },
  { label: 'Playful',     emoji: '🎭'  },
  { label: 'Dreamy',      emoji: '💭'  },
  { label: 'Intense',     emoji: '🔥'  },
  { label: 'Warm',        emoji: '☀️'  },
  { label: 'Melancholic', emoji: '🌧️' },
  { label: 'Confident',   emoji: '💪'  },
  { label: 'Gentle',      emoji: '🕊️' },
  { label: 'Dramatic',    emoji: '🎬'  },
];

export default function CustomEmotionInput({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestionChips);

  useEffect(() => {
    if (!value) {
      setFilteredSuggestions(suggestionChips);
    } else {
      const lc = value.toLowerCase();
      const filtered = suggestionChips.filter(
        s => s.label.toLowerCase().includes(lc) && s.label.toLowerCase() !== lc,
      );
      setFilteredSuggestions(
        filtered.length > 0
          ? filtered
          : suggestionChips.filter(s => s.label.toLowerCase() !== lc),
      );
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden"
    >
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className={cn(
          'relative rounded-2xl border-2 p-4 transition-all duration-300',
          isFocused
            ? 'border-violet-500/60 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/10 shadow-lg shadow-violet-500/10'
            : 'border-slate-700/60 bg-gradient-to-br from-slate-800/60 to-slate-800/40',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: isFocused ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center"
          >
            <Wand2 className="w-3.5 h-3.5 text-white" />
          </motion.div>
          <span className="text-sm font-medium text-violet-300">Describe your emotion</span>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400/60" />
          </motion.div>
        </div>

        {/* Input */}
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="e.g. playful and mischievous, warm like a grandmother..."
            className={cn(
              'bg-slate-900/60 text-white placeholder:text-slate-500 h-12 text-base transition-all duration-300',
              isFocused ? 'border-violet-500/50 ring-1 ring-violet-500/20' : 'border-slate-700',
            )}
          />
          {value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="text-lg">✨</span>
            </motion.div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="mt-3">
          <p className="text-[11px] text-slate-500 mb-2 uppercase tracking-wider font-medium">
            {value ? 'Try also' : 'Quick picks'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence mode="popLayout">
              {filteredSuggestions.slice(0, 8).map((chip, i) => (
                <motion.button
                  key={chip.label}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onChange(chip.label.toLowerCase())}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5',
                    value?.toLowerCase() === chip.label.toLowerCase()
                      ? 'bg-violet-500/30 text-violet-200 border border-violet-500/50'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-700/80 hover:border-slate-600',
                  )}
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
