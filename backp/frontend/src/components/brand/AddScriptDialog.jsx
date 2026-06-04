import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Sparkles, Globe, Pen, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const SCRIPT_MODES = [
  { id: 'write', label: 'Write Manually', icon: Pen, desc: 'Type or paste your script' },
  { id: 'ai', label: 'Generate with AI', icon: Sparkles, desc: 'AI writes a script from a prompt' },
  { id: 'salespage', label: 'From Sales Page', icon: Globe, desc: 'AI extracts a script from your URL' },
];

export default function AddScriptDialog({ open, onClose, onAdd, projectUrl, brandVoicePrompt }) {
  const [mode, setMode] = useState('write');
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [pageUrl, setPageUrl] = useState(projectUrl || '');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      let prompt = '';
      if (mode === 'ai') {
        prompt = `You are a professional copywriter. Write a compelling voiceover script based on this request: "${aiPrompt}".
${brandVoicePrompt ? `Use this brand voice style: ${brandVoicePrompt}` : ''}
Write only the script text, no stage directions or labels.`;
      } else if (mode === 'salespage') {
        prompt = `Visit and analyze this sales page URL: ${pageUrl}.
Write a compelling voiceover script that captures the key selling points, benefits, and call-to-action from this page.
${brandVoicePrompt ? `Use this brand voice style: ${brandVoicePrompt}` : ''}
Write only the script text, no stage directions or labels.`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'A short title for the script (3-6 words)' },
            script: { type: 'string', description: 'The full voiceover script text' }
          }
        },
        add_context_from_internet: mode === 'salespage',
      });

      setTitle(result.title || 'AI Generated Script');
      setScript(result.script || '');
      setMode('write'); // Switch to write mode so user can review
    } catch (err) {
      // Let it bubble
    } finally {
      setGenerating(false);
    }
  };

  const handleAdd = () => {
    if (!title.trim() || !script.trim()) return;
    onAdd(title.trim(), script.trim());
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setScript('');
    setAiPrompt('');
    setPageUrl(projectUrl || '');
    setMode('write');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Script</DialogTitle>
        </DialogHeader>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {SCRIPT_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                mode === m.id
                  ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              )}
            >
              <m.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 py-1">
          {mode === 'write' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Script Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow-up Ad, Landing Page Script..."
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Script Content</label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Write or paste your script here..."
                  rows={7}
                  className="bg-slate-800/50 border-slate-700 resize-none"
                />
              </div>
            </>
          )}

          {mode === 'ai' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Describe what the script should be about</label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. A 60-second ad for a fitness app targeting busy professionals, emphasizing quick workouts..."
                rows={4}
                className="bg-slate-800/50 border-slate-700 resize-none"
              />
              <Button
                onClick={handleGenerate}
                disabled={!aiPrompt.trim() || generating}
                className="w-full mt-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Generate Script'}
              </Button>
            </div>
          )}

          {mode === 'salespage' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sales Page URL</label>
              <Input
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://yourproduct.com/sales"
                className="bg-slate-800/50 border-slate-700"
              />
              <p className="text-[10px] text-slate-500 mt-1">AI will analyze this page and generate a voiceover script</p>
              <Button
                onClick={handleGenerate}
                disabled={!pageUrl.trim() || generating}
                className="w-full mt-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {generating ? 'Analyzing Page...' : 'Generate from Page'}
              </Button>
            </div>
          )}
        </div>

        {mode === 'write' && (
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!title.trim() || !script.trim()} className="bg-gradient-to-r from-violet-600 to-pink-600 gap-1">
              <Plus className="w-4 h-4" /> Add Script
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
