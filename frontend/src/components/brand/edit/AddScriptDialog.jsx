import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddScriptDialog({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');

  const handleAdd = () => {
    if (!script.trim()) return;
    onAdd({ title: title.trim() || 'Untitled Script', script: script.trim() });
    setTitle('');
    setScript('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h3 className="font-semibold text-white">Add Script Variation</h3>
              <Button size="icon" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white w-8 h-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Script Title</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Short Version, Facebook Ad..."
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Script Content</Label>
                <Textarea
                  value={script}
                  onChange={e => setScript(e.target.value)}
                  placeholder="Enter your script here..."
                  rows={8}
                  className="bg-slate-800/60 border-slate-700 text-white text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <Button variant="outline" onClick={onClose}
                className="flex-1 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!script.trim()}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Script
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
