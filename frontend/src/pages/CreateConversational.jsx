import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, MessageSquare, AudioLines, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import ScriptInputSection from '@/components/conversational/ScriptInputSection';
import SpeakerAssignmentSection from '@/components/conversational/SpeakerAssignmentSection';
import ConversationPreview from '@/components/conversational/ConversationPreview';
import GenerateConversationOverlay from '@/components/conversational/GenerateConversationOverlay';

function analyzeScript(script) {
  const rawSegments = script.split(/\n\s*\n/).filter(s => s.trim());
  const lines = rawSegments.length <= 1
    ? script.split(/\n/).filter(s => s.trim())
    : rawSegments.map(s => s.trim());

  const labelPattern = /^([A-Za-z0-9\s]+):\s*(.+)/;
  const speakers = new Map();
  let autoSpeakerIndex = 0;

  const segments = lines.map((line) => {
    const match = line.match(labelPattern);
    let speakerLabel, text;

    if (match) {
      speakerLabel = match[1].trim();
      text = match[2].trim();
    } else {
      speakerLabel = `Speaker ${(autoSpeakerIndex % 2) + 1}`;
      autoSpeakerIndex++;
      text = line.trim();
    }

    if (!speakers.has(speakerLabel)) {
      speakers.set(speakerLabel, { label: speakerLabel, voice_id: '', voice_name: '', voice_type: '' });
    }

    return { text, speaker_label: speakerLabel, voice_id: '', voice_name: '', voice_type: '' };
  });

  return { segments, speakers: Array.from(speakers.values()) };
}

export default function CreateConversational() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [segments, setSegments] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [showGenerating, setShowGenerating] = useState(false);

  const { data: existingConv } = useQuery({
    queryKey: ['conversationalVoice', editId],
    queryFn: async () => {
      const all = await base44.entities.ConversationalVoice.filter({ id: editId });
      return all[0] || null;
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (existingConv) {
      setTitle(existingConv.title || '');
      setScript(existingConv.full_script || '');
      if (existingConv.segments?.length) {
        setSegments(existingConv.segments);
        setSpeakers(existingConv.speakers || []);
        setIsAnalyzed(true);
      }
    }
  }, [existingConv]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editId) return base44.entities.ConversationalVoice.update(editId, data);
      return base44.entities.ConversationalVoice.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries(['conversationalVoices'])
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = analyzeScript(script);
    setSegments(result.segments);
    setSpeakers(result.speakers);
    setIsAnalyzing(false);
    setIsAnalyzed(true);
    toast.success(`Detected ${result.speakers.length} speakers and ${result.segments.length} lines`);
  };

  const allVoicesAssigned = speakers.length > 0 && speakers.every(s => s.voice_id);

  const handleGenerate = async () => {
    setShowGenerating(true);
    await saveMutation.mutateAsync({
      title: title || 'Untitled Conversation',
      full_script: script,
      segments,
      speakers,
      status: 'processing'
    });
  };

  const handleGenerationComplete = () => {
    toast.success('Conversational audio generated!');
    setTimeout(() => navigate(createPageUrl('ConversationalList')), 300);
  };

  const SectionTitle = ({ icon: Icon, title: t, subtitle }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{t}</h3>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {showGenerating && (
          <GenerateConversationOverlay
            isVisible={showGenerating}
            onComplete={handleGenerationComplete}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <PageHeader
          title={editId ? 'Edit Conversation' : 'Multi-Conversational Voice'}
          description={editId ? 'Update your conversation draft' : 'Create natural conversations with multiple AI voices'}
          icon={Users}
          backTo="ConversationalList"
          gradient="from-violet-500 to-purple-500"
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6" hover={false}>
            <SectionTitle icon={FileText} title="Project Details" subtitle="Name your conversation project" />
            <Label className="text-slate-300 mb-2 block">Project Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Podcast Episode, Interview Script..."
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
            />
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6" hover={false}>
            <SectionTitle icon={MessageSquare} title="Conversation Script" subtitle="Paste your script — we'll detect the speakers" />
            <ScriptInputSection
              script={script}
              onScriptChange={setScript}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              isAnalyzed={isAnalyzed}
            />
          </GlassCard>
        </motion.div>

        <AnimatePresence>
          {isAnalyzed && speakers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <GlassCard className="p-6" hover={false}>
                <SectionTitle icon={Users} title="Assign Voices" subtitle="Pick a unique voice for each speaker" />
                <SpeakerAssignmentSection
                  speakers={speakers}
                  segments={segments}
                  onSpeakersChange={setSpeakers}
                  onSegmentsChange={setSegments}
                />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAnalyzed && segments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20, delay: 0.1 }}
            >
              <GlassCard className="p-6" hover={false}>
                <SectionTitle icon={MessageSquare} title="Conversation Preview" subtitle="See how your conversation flows" />
                <ConversationPreview segments={segments} speakers={speakers} />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAnalyzed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                onClick={handleGenerate}
                disabled={!allVoicesAssigned || showGenerating}
                whileHover={allVoicesAssigned && !showGenerating ? { scale: 1.01 } : {}}
                whileTap={allVoicesAssigned && !showGenerating ? { scale: 0.99 } : {}}
                className="flex-1 relative overflow-hidden rounded-xl px-6 py-4 font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {showGenerating
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                    : <><AudioLines className="w-5 h-5" /> Generate Conversational Audio</>
                  }
                </span>
              </motion.button>

              <Button
                onClick={() => {
                  saveMutation.mutate({
                    title: title || 'Untitled Conversation',
                    full_script: script,
                    segments,
                    speakers,
                    status: 'draft'
                  });
                  toast.success('Draft saved!');
                }}
                variant="outline"
                className="w-full sm:w-auto border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 h-14 px-8"
              >
                <Save className="w-5 h-5 mr-2" /> Save Draft
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
