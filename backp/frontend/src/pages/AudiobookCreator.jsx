import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Upload, AudioLines, Loader2, CheckCircle2, Lock, AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import VoiceSelectionSection from '@/components/voice/VoiceSelectionSection';
import GeneratingOverlay from '@/components/ui/GeneratingOverlay';

// Same language list as CreateVoiceover
const languages = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'da', label: 'Danish' },
  { value: 'nl', label: 'Dutch' },
  { value: 'fi', label: 'Finnish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'el', label: 'Greek' },
  { value: 'he', label: 'Hebrew' },
  { value: 'hi', label: 'Hindi' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ms', label: 'Malay' },
  { value: 'no', label: 'Norwegian' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'sw', label: 'Swahili' },
  { value: 'sv', label: 'Swedish' },
  { value: 'tr', label: 'Turkish' },
];

const ACCEPTED_FORMATS = '.epub,.pdf,.txt';

// Statuses that allow editing
const EDITABLE_STATUSES = ['pending', 'completed', 'failed', 'draft'];

function StepLabel({ number, label, locked }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
        locked
          ? 'bg-slate-700'
          : 'bg-gradient-to-br from-amber-500 to-orange-600'
      }`}>
        {locked ? <Lock className="w-3.5 h-3.5" /> : number}
      </div>
      <span className={`font-semibold ${locked ? 'text-slate-500' : 'text-white'}`}>{label}</span>
    </div>
  );
}

export default function AudiobookCreator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkLimit } = useUsageLimits();
  const audiobookLimit = checkLimit('audiobook');
  const fileInputRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const [title, setTitle]         = useState('');
  const [fileUrl, setFileUrl]     = useState('');
  const [fileName, setFileName]   = useState('');
  const [voiceId, setVoiceId]     = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [voiceType, setVoiceType] = useState('');
  const [voiceUrl, setVoiceUrl]   = useState('');
  const [language, setLanguage]   = useState('en');
  const [isUploading, setIsUploading]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track original values from DB to detect meaningful changes on edit
  const originalFileUrl = useRef('');
  const originalVoiceId = useRef('');

  // Load existing audiobook when editing
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['audiobook', editId],
    queryFn: async () => {
      const all = await base44.entities.Audiobook.filter({ id: editId });
      return all[0] || null;
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title || '');
    setFileUrl(existing.file_url || '');
    setFileName(existing.original_file || '');
    setVoiceId(existing.voice_id || '');
    setVoiceName(existing.voice_name || '');
    setVoiceType(existing.voice_type || '');
    setVoiceUrl(existing.voice_url || '');
    setLanguage(existing.language || 'en');
    // Store originals for change detection
    originalFileUrl.current = existing.file_url || '';
    originalVoiceId.current = existing.voice_id || '';
  }, [existing]);

  // Derive locked state — processing = fully locked
  const isProcessing = existing?.status === 'processing';
  const isLocked = editId ? isProcessing : false;

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editId) return base44.entities.Audiobook.update(editId, data);
      return base44.entities.Audiobook.create(data);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries(['audiobooks']);
      // Only track on create, not on update
      if (!editId) {
        base44.trackUsage('audiobook', 1);
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
    },
  });

  // ── File Upload ───────────────────────────────────────────────────────────

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['epub', 'pdf', 'txt'].includes(ext)) {
      toast.error('Only .epub, .pdf, and .txt files are supported.');
      return;
    }
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds ${MAX_SIZE_MB}MB limit. Please choose a smaller file.`);
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file, track: false });
      setFileUrl(file_url);
      setFileName(file.name);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
      toast.success('File uploaded successfully!');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Voice selection — same handler shape as CreateVoiceover ──────────────

  const handleSelectVoice = (id, name, type, url = '') => {
    setVoiceId(id);
    setVoiceName(name);
    setVoiceType(type);
    setVoiceUrl(url);
  };

  // ── Determine status for save/update ─────────────────────────────────────
  // On edit: only reset to 'pending' if file or voice changed; keep existing otherwise
  const resolveStatus = () => {
    if (!editId) return 'pending'; // new record always starts as pending

    const fileChanged  = fileUrl  !== originalFileUrl.current;
    const voiceChanged = voiceId  !== originalVoiceId.current;

    if (fileChanged || voiceChanged) return 'pending';
    return existing?.status || 'pending'; // preserve current status
  };

  // ── Generate (new record) ─────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!fileUrl) { toast.error('Please upload an eBook first.'); return; }
    if (!voiceId) { toast.error('Please select a voice.'); return; }
    if (!audiobookLimit.allowed) {
      toast.error(`Audiobook limit reached (${audiobookLimit.used}/${audiobookLimit.limit}). Please upgrade your plan.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync({
        title: title || 'Untitled Audiobook',
        original_file: fileName,
        file_url: fileUrl,
        voice_id:   voiceId,
        voice_name: voiceName,
        voice_type: voiceType,
        voice_url:  voiceUrl,
        language,
        status: 'pending',
      });
      // Let the overlay finish its animation — onComplete handles navigation
    } catch {
      setIsSubmitting(false);
      toast.error('Failed to submit. Please try again.');
    }
  };

  const handleOverlayComplete = () => {
    toast.success('Audiobook submitted! Audio will be ready shortly.');
    navigate(createPageUrl('AudiobookList'));
  };

  // ── Save Changes (edit mode) ──────────────────────────────────────────────

  const handleSaveChanges = async () => {
    if (!fileUrl) { toast.error('Please upload an eBook first.'); return; }
    if (!voiceId) { toast.error('Please select a voice.'); return; }

    const status = resolveStatus();

    try {
      await saveMutation.mutateAsync({
        title: title || 'Untitled Audiobook',
        original_file: fileName,
        file_url: fileUrl,
        voice_id:   voiceId,
        voice_name: voiceName,
        voice_type: voiceType,
        voice_url:  voiceUrl,
        language,
        status,
      });

      const fileChanged  = fileUrl  !== originalFileUrl.current;
      const voiceChanged = voiceId  !== originalVoiceId.current;

      if (fileChanged || voiceChanged) {
        toast.success('Changes saved — audiobook re-queued for generation.');
      } else {
        toast.success('Changes saved.');
      }

      setTimeout(() => navigate(createPageUrl('AudiobookList')), 400);
    } catch {
      toast.error('Failed to save changes.');
    }
  };

  const canSubmit = !!fileUrl && !!voiceId && (editId || audiobookLimit.allowed);

  // Show loading skeleton while fetching existing record
  if (editId && loadingExisting) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <PageHeader
          title="Edit Audiobook"
          description="Convert your eBook into an AI-narrated audiobook"
          icon={BookOpen}
          backTo="AudiobookList"
          gradient="from-amber-500 to-orange-500"
        />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title={editId ? 'Edit Audiobook' : 'Audiobook Creator'}
        description="Convert your eBook into an AI-narrated audiobook"
        icon={BookOpen}
        backTo="AudiobookList"
        gradient="from-amber-500 to-orange-500"
      />

      {/* Usage limit banner — only on create */}
      {!editId && !audiobookLimit.allowed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-red-300 font-semibold text-sm">Audiobook limit reached</p>
            <p className="text-red-400/70 text-xs mt-0.5">
              You've used {audiobookLimit.used} of {audiobookLimit.limit} audiobooks this month. Please upgrade your plan to create more.
            </p>
          </div>
        </motion.div>
      )}

      {/* Usage counter — only on create when within limit */}
      {!editId && audiobookLimit.allowed && audiobookLimit.limit != null && (
        <div className="flex justify-end">
          <span className="text-xs text-slate-500">
            {audiobookLimit.used} / {audiobookLimit.limit} audiobooks used this month
          </span>
        </div>
      )}

      {/* Processing lock banner */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
          <div>
            <p className="text-amber-300 font-semibold text-sm">Audiobook is currently being processed</p>
            <p className="text-amber-400/70 text-xs mt-0.5">Editing is disabled while processing. Check back once it completes.</p>
          </div>
        </motion.div>
      )}

      {/* Wrapper that dims + blocks input when locked */}
      <div className={isLocked ? 'pointer-events-none select-none opacity-50' : ''}>

        {/* Step 1 — Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6" hover={false}>
            <StepLabel number={1} label="Upload your eBook" locked={isLocked} />

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS}
              onChange={handleFileChange}
              className="hidden"
              disabled={isLocked}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLocked}
              className="w-full rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/40 hover:bg-amber-500/5 transition-all py-10 flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-sm text-slate-400">Uploading…</span>
                </>
              ) : fileUrl ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">{fileName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{isLocked ? 'Locked during processing' : 'Click to replace'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">Upload your eBook (.epub, .pdf, .txt)</p>
                    <p className="text-xs text-slate-500 mt-1">Click to browse files</p>
                  </div>
                </>
              )}
            </button>

            <div className="mt-5">
              <Label className="text-slate-400 text-xs mb-1.5 block">Audiobook Title (optional — auto-filled from filename)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Audiobook…"
                disabled={isLocked}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 h-11 disabled:opacity-60"
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Step 2 — Voice Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <GlassCard className="p-6" hover={false}>
            <StepLabel number={2} label="Choose a Narrator Voice" locked={isLocked} />
            <VoiceSelectionSection
              selectedVoiceId={voiceId}
              onSelectVoice={handleSelectVoice}
            />
          </GlassCard>
        </motion.div>

        {/* Step 3 — Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <GlassCard className="p-6" hover={false}>
            <StepLabel number={3} label="Select Language" locked={isLocked} />
            <Select value={language} onValueChange={setLanguage} disabled={isLocked}>
              <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>
        </motion.div>

      </div>{/* end locked wrapper */}

      {/* Step 4 — Action button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {isLocked ? (
          <div className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed">
            <Lock className="w-5 h-5" />
            <span className="font-semibold">Editing locked during processing</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={editId ? handleSaveChanges : handleGenerate}
              disabled={!canSubmit || saveMutation.isPending}
              className="w-full relative overflow-hidden rounded-xl px-6 py-4 font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
            >
              <span className="flex items-center justify-center gap-2">
                {saveMutation.isPending
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                  : editId
                    ? <><AudioLines className="w-5 h-5" /> Save Changes</>
                    : <><AudioLines className="w-5 h-5" /> Generate Audiobook</>
                }
              </span>
            </button>
            {!canSubmit && (
              <p className="text-center text-xs text-slate-600 mt-2">
                {!fileUrl ? 'Upload an eBook to continue' : 'Select a voice to continue'}
              </p>
            )}
            {editId && canSubmit && (fileUrl !== originalFileUrl.current || voiceId !== originalVoiceId.current) && (
              <p className="text-center text-xs text-amber-500/80 mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                File or voice changed — saving will re-queue for generation
              </p>
            )}
          </>
        )}
      </motion.div>

      <GeneratingOverlay
        isVisible={isSubmitting}
        type="audiobook"
        title="Submitting Audiobook..."
        autoComplete
        onComplete={handleOverlayComplete}
      />
    </div>
  );
}
