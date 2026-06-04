import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import apiClient from '@/api/base44Client';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import AddonUpgradeCard from '@/components/dashboard/AddonUpgradeCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Upload, Youtube, RefreshCw, Save, Download,
  Copy, FileText, Clock, Trash2, MoreVertical, Search,
  Sparkles, Play, CheckCircle, FileVideo, Mic, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const outputFormats = [
  { value: 'text', label: 'Plain Text', icon: FileText, description: 'Simple text format' },
  { value: 'srt', label: 'SRT Subtitles', icon: FileVideo, description: 'Standard subtitle format' },
  { value: 'vtt', label: 'VTT Subtitles', icon: FileVideo, description: 'Web subtitle format' },
  { value: 'json', label: 'JSON', icon: FileText, description: 'Structured data' },
];

export default function Transcribe() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkLimit } = useUsageLimits();
  const transLimit = checkLimit('transcriptions');
  const [sourceType, setSourceType] = useState('youtube');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  const [isProcessing,   setIsProcessing]   = useState(false);
  const [isUploading,    setIsUploading]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    output_format: 'text',
    language: 'en'
  });

  const { data: transcriptions = [], isLoading } = useQuery({
    queryKey: ['transcriptions'],
    queryFn: () => base44.entities.Transcription.list('-created_at')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transcription.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['transcriptions'] });
      try {
        await base44.trackUsage('transcriptions', 1);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
      toast.success('Transcription started!');
      setFormData({ title: '', source_url: '', output_format: 'text', language: 'en' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transcription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['transcriptions']);
      toast.success('Transcription deleted');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE_MB = 100;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds ${MAX_SIZE_MB}MB limit. Please choose a smaller file.`);
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);
    setFormData(prev => ({ ...prev, source_url: '' }));

    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      const { data } = await apiClient.post('/uploads/file', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });
      setFormData(prev => ({ ...prev, source_url: data.data?.file_url || data.file_url }));
      setUploadProgress(100);
      toast.success('File uploaded!');
    } catch {
      toast.error('Upload failed. Please try again.');
      setUploadedFileName('');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const startTranscription = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for this transcription.');
      return;
    }
    if (!formData.source_url) {
      toast.error(sourceType === 'youtube' ? 'Please enter a YouTube URL.' : 'Please upload a file first.');
      return;
    }
    if (sourceType === 'youtube') {
      const ytPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/i;
      if (!ytPattern.test(formData.source_url.trim())) {
        toast.error('Please enter a valid YouTube URL.');
        return;
      }
    }
    if (!transLimit.allowed) return;
    setIsProcessing(true);
    await createMutation.mutateAsync({
      ...formData,
      source_type: sourceType,
      status: 'pending'
    });
    setIsProcessing(false);
  };

  const filteredTranscriptions = transcriptions.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = transcriptions.filter(t => t.status === 'completed').length;
  const processingCount = transcriptions.filter(t => t.status === 'pending' || t.status === 'processing').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Video Transcription"
        description="Convert video and audio to text with AI"
        icon={Video}
        gradient="from-emerald-500 to-teal-500"
      />

      <AddonUpgradeCard type="transcriber" addons={currentUser?.addons} currentPlan={currentUser?.base_plan} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: transcriptions.length, icon: Video, color: 'emerald' },
          { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'blue' },
          { label: 'Processing', value: processingCount, icon: RefreshCw, color: 'amber' },
          { label: 'Format', value: formData.output_format.toUpperCase(), icon: FileText, color: 'violet' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  `bg-${stat.color}-500/20`
                )}>
                  <stat.icon className={cn("w-5 h-5", `text-${stat.color}-400`)} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              New Transcription
            </h3>
            
            <div className="space-y-5">
              <div>
                <Label className="text-slate-300 text-sm font-medium">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="My Transcription"
                  className="mt-2 bg-slate-800/50 border-slate-700 text-white h-11"
                />
              </div>

              {/* Source Type Tabs */}
              <Tabs value={sourceType} onValueChange={setSourceType}>
                <TabsList className="bg-slate-800/50 w-full h-12">
                  <TabsTrigger value="youtube" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 h-10">
                    <Youtube className="w-4 h-4 mr-2" /> YouTube
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 h-10">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">YouTube URL</Label>
                    <Input
                      value={formData.source_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-2 bg-slate-800/50 border-slate-700 text-white h-11"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4 mt-4">
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />

                  {/* Drop zone — hidden while uploading */}
                  {!isUploading && !formData.source_url && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Upload className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                      </motion.div>
                      <p className="text-white font-medium mb-1">Drop your file here</p>
                      <p className="text-sm text-slate-400 mb-3">MP4, MP3, WAV, M4A supported</p>
                      <Button variant="outline" className="border-slate-700" asChild>
                        <span>Choose File</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* Upload progress */}
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4 text-emerald-400 animate-bounce" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{uploadedFileName}</p>
                            <p className="text-xs text-slate-400">Uploading… {uploadProgress}%</p>
                          </div>
                          <span className="text-sm font-semibold text-emerald-400 shrink-0">{uploadProgress}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            initial={{ width: '0%' }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ ease: 'easeOut', duration: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success state */}
                  <AnimatePresence>
                    {formData.source_url && sourceType === 'upload' && !isUploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-emerald-400">File uploaded successfully</p>
                          <p className="text-xs text-slate-400 truncate">{uploadedFileName}</p>
                        </div>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, source_url: '' }));
                            setUploadedFileName('');
                            setUploadProgress(0);
                          }}
                          className="text-slate-500 hover:text-white transition-colors text-xs underline shrink-0"
                        >
                          Change
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>

              {/* Output Format Selection */}
              <div>
                <Label className="text-slate-300 text-sm font-medium mb-3 block">Output Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  {outputFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <motion.button
                        key={format.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFormData(prev => ({ ...prev, output_format: format.value }))}
                        className={cn(
                          "p-3 rounded-xl text-left transition-all",
                          formData.output_format === format.value
                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50"
                            : "bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5 mb-1",
                          formData.output_format === format.value ? "text-emerald-400" : "text-slate-400"
                        )} />
                        <p className={cn(
                          "text-sm font-medium",
                          formData.output_format === format.value ? "text-white" : "text-slate-300"
                        )}>
                          {format.label}
                        </p>
                        <p className="text-xs text-slate-500">{format.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {!transLimit.allowed && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Usage limit reached</p>
                    <p className="text-red-400/80 text-sm mt-0.5">
                      You have used {transLimit.used}/{transLimit.limit === -1 ? '∞' : transLimit.limit} transcriptions this month. Please upgrade your plan to continue.
                    </p>
                  </div>
                </div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={startTranscription}
                  disabled={!formData.title || !formData.source_url || isProcessing || isUploading || !transLimit.allowed}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 h-12 text-base font-semibold shadow-lg shadow-emerald-500/25"
                >
                  <Play className="w-5 h-5 mr-2" /> Start Transcription
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </div>

        {/* Transcriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-4" hover={false}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transcriptions..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
              />
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <GlassCard key={i} className="h-32 animate-pulse" hover={false} />
              ))}
            </div>
          ) : filteredTranscriptions.length === 0 ? (
            <GlassCard className="p-12 text-center" hover={false}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6">
                  <Video className="w-10 h-10 text-emerald-400" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">No transcriptions yet</h3>
              <p className="text-slate-400">Upload a video or paste a YouTube link to get started</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTranscriptions.map((trans, idx) => (
                  <motion.div
                    key={trans.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GlassCard className="p-5 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20"
                        >
                          <Video className="w-7 h-7 text-white" />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg">{trans.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <StatusBadge status={trans.status} size="sm" />
                            <span className="text-slate-400 text-sm capitalize px-2 py-0.5 bg-slate-800/50 rounded-full">
                              {trans.output_format}
                            </span>
                            {trans.duration && (
                              <span className="text-slate-400 text-sm">
                                {Math.floor(trans.duration / 60)}:{(trans.duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3" />
                            {format(new Date(trans.created_at), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {trans.transcript && (
                            <>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => {
                                    navigator.clipboard.writeText(trans.transcript);
                                    toast.success('Copied!');
                                  }}
                                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                                  onClick={() => {
                                    const ext = trans.output_format === 'json' ? 'json'
                                      : trans.output_format === 'srt' ? 'srt'
                                      : trans.output_format === 'vtt' ? 'vtt'
                                      : 'txt';
                                    const mimeType = trans.output_format === 'json' ? 'application/json' : 'text/plain';
                                    const blob = new Blob([trans.transcript], { type: mimeType });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${trans.title || 'transcription'}.${ext}`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                onClick={() => {
                                  sessionStorage.setItem('vo_prefill_script', trans.transcript);
                                  navigate(createPageUrl('CreateVoiceover'));
                                }}
                                disabled={!trans.transcript}
                                className="text-slate-200 focus:text-white focus:bg-slate-700"
                              >
                                <Mic className="w-4 h-4 mr-2" /> Create Voiceover
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(trans.id)}
                                className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}