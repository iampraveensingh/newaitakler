import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, Upload, Keyboard, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconTabs from '@/components/ui/IconTabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const scriptModes = [
  { value: 'manual', label: 'Write / Paste', icon: Keyboard },
  { value: 'ai', label: 'AI Generate', icon: Wand2 },
  { value: 'import', label: 'Import File', icon: Upload },
];

export default function ScriptInputSection({ script, onScriptChange, onAnalyze, isAnalyzing, isAnalyzed }) {
  const [mode, setMode] = useState('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [speakerCount, setSpeakerCount] = useState('2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a realistic, natural multi-speaker conversation script with ${speakerCount} speakers.

Topic/Description: ${aiPrompt}

Rules:
- Format each line as "SpeakerName: dialogue text"
- Use natural names (e.g., Host, Guest, Alex, Sarah) instead of "Speaker 1"
- Make the dialogue natural, engaging, and conversational
- Include ${speakerCount} distinct speakers
- Each speaker should have at least 3-4 lines
- Separate each line with a blank line
- Do NOT include stage directions or actions, only spoken dialogue
- Make it ready for text-to-speech conversion`,
        response_json_schema: {
          type: 'object',
          properties: {
            script: { type: 'string', description: 'The full conversation script' }
          }
        }
      });
      onScriptChange(response.script);
      setMode('manual');
      toast.success('Script generated! You can edit it below.');
    } catch {
      toast.error('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        onScriptChange(text);
        setMode('manual');
        toast.success('Script imported!');
        return;
      }
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            script_text: { type: 'string', description: 'The full conversation/dialogue text extracted from the file, preserving line breaks and speaker labels' }
          }
        }
      });
      if (result.status === 'success' && result.output?.script_text) {
        onScriptChange(result.output.script_text);
        toast.success('Script imported!');
        setMode('manual');
      } else {
        toast.error('Could not extract script from file');
      }
    } catch {
      toast.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <IconTabs tabs={scriptModes} activeTab={mode} onTabChange={setMode} />

      <AnimatePresence mode="wait">
        {mode === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20 space-y-4"
          >
            <div>
              <Label className="text-slate-300 mb-2 block">Describe the conversation</Label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="A podcast interview about the future of AI in music production. The host is curious and the guest is an industry expert..."
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-[200px]">
                <Label className="text-slate-300 mb-2 block text-sm">Number of Speakers</Label>
                <Input
                  type="number" min="2" max="5"
                  value={speakerCount}
                  onChange={(e) => {
                    const v = Math.min(5, Math.max(2, parseInt(e.target.value) || 2));
                    setSpeakerCount(String(v));
                  }}
                  className="bg-slate-800/50 border-slate-700 text-white h-10"
                />
              </div>
              <motion.button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                whileHover={!isGenerating && aiPrompt.trim() ? { scale: 1.02 } : {}}
                whileTap={!isGenerating && aiPrompt.trim() ? { scale: 0.98 } : {}}
                className="flex-1 relative overflow-hidden rounded-lg px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isGenerating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    : <><Wand2 className="w-4 h-4" /> Generate Script</>
                  }
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {mode === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx,.pdf,.csv"
              onChange={handleFileImport}
              className="hidden"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              whileHover={!isImporting ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isImporting ? { scale: 0.98 } : {}}
              className="w-full py-8 rounded-xl border-2 border-dashed border-blue-500/30 hover:border-blue-400/50 bg-blue-500/5 flex flex-col items-center gap-3 transition-all disabled:opacity-50"
            >
              {isImporting ? (
                <><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /><span className="text-sm text-blue-300">Importing script...</span></>
              ) : (
                <><Upload className="w-8 h-8 text-blue-400" /><span className="text-sm text-blue-300 font-medium">Click to upload a script file</span><span className="text-xs text-slate-500">Supports .txt, .doc, .docx, .pdf, .csv</span></>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'manual' && (
        <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Label className="text-slate-300 mb-2 block">Your conversation script</Label>
          <p className="text-xs text-slate-500 mb-3">
            Tip: Use "SpeakerName: text" format for best results — or just use line breaks and we'll auto-detect speakers.
          </p>
        </motion.div>
      )}

      <Textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder={`Host: Hey, have you tried the new AI voice tool?\n\nGuest: Yeah! It's incredible. The voices sound so natural.\n\nHost: I know, right? I've been using it for all my podcasts.\n\nGuest: You should try the multi-speaker feature too.`}
        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 min-h-[200px] text-base leading-relaxed focus-visible:ring-2 focus-visible:ring-violet-500/50 transition-all"
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">{script.length} characters</p>
        {script.length > 0 && (
          <p className="text-xs text-slate-500">
            ~{script.split(/\n\s*\n/).filter(Boolean).length} segments detected
          </p>
        )}
      </div>

      <motion.button
        onClick={onAnalyze}
        disabled={!script.trim() || isAnalyzing}
        whileHover={script.trim() && !isAnalyzing ? { scale: 1.02 } : {}}
        whileTap={script.trim() && !isAnalyzing ? { scale: 0.98 } : {}}
        className={cn(
          'w-full relative overflow-hidden rounded-xl px-6 py-4 font-semibold text-white transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isAnalyzed
            ? 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/25'
            : 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
        )}
      >
        <span className="relative flex items-center justify-center gap-2">
          {isAnalyzing
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Script...</>
            : isAnalyzed
              ? <><RefreshCw className="w-5 h-5" /> Re-Analyze Script</>
              : <><Sparkles className="w-5 h-5" /> Analyze & Detect Speakers</>
          }
        </span>
      </motion.button>
    </div>
  );
}
