import React, { useState, useRef } from 'react';
import { Play, Pause, CheckCircle, Upload, VolumeX, Trash2, Music2, Search, Sparkles, Briefcase, Heart, Zap, Coffee, Sun, Moon, Film, Podcast, Guitar, Piano, Drum, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Resolve relative paths (e.g. /music/track.mp3) to full URLs using the backend origin
const BACKEND_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return BACKEND_ORIGIN + (url.startsWith('/') ? '' : '/') + url;
};

const musicCategories = [
  { id: 'all', label: 'All', icon: Music2, color: 'from-violet-500 to-purple-500' },
  { id: 'corporate', label: 'Corporate', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
  { id: 'cinematic', label: 'Cinematic', icon: Film, color: 'from-amber-500 to-orange-500' },
  { id: 'ambient', label: 'Ambient', icon: Moon, color: 'from-indigo-500 to-purple-500' },
  { id: 'podcast', label: 'Podcast', icon: Podcast, color: 'from-emerald-500 to-teal-500' },
  { id: 'upbeat', label: 'Upbeat', icon: Zap, color: 'from-pink-500 to-rose-500' },
  { id: 'electronic', label: 'Electronic', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
  { id: 'acoustic', label: 'Acoustic', icon: Guitar, color: 'from-orange-500 to-amber-500' },
];

export default function BackgroundMusicSection({ selectedMusic, onSelectMusic }) {
  const queryClient = useQueryClient();
  const [playingId, setPlayingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryExpanded, setLibraryExpanded] = useState(false);
  const audioRef = useRef(new Audio());
  const fileInputRef = useRef(null);

  // Fetch shared background music library from DB (admin-managed)
  const { data: libraryTracks = [], isLoading: loadingLibrary } = useQuery({
    queryKey: ['backgroundMusicLibrary'],
    queryFn: () => base44.entities.BackgroundMusicTrack.filter({ is_active: 1, sort: 'name' }),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch current user's uploaded music from DB (user-scoped)
  const { data: uploadedTracks = [], isLoading: loadingUploads } = useQuery({
    queryKey: ['userMusicUploads'],
    queryFn: () => base44.uploads.listAudio(),
  });

  // Filter music based on category and search
  const filteredMusic = libraryTracks.filter(track => {
    const matchesCategory = activeCategory === 'all' || track.category === activeCategory;
    const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (track.mood || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayPause = (e, music) => {
    e.stopPropagation();
    if (!music.audio) return;
    
    if (playingId === music.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = music.audio;
      audioRef.current.play().catch(() => setPlayingId(null));
      setPlayingId(music.id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Refresh the user's upload list from DB
      await queryClient.invalidateQueries({ queryKey: ['userMusicUploads'] });
      // Auto-select the newly uploaded track
      const name = file.name.replace(/\.[^/.]+$/, '');
      onSelectMusic(file_url, name, file_url);
      toast.success('Music uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteTrack = async (e, track) => {
    e.stopPropagation();
    try {
      await base44.uploads.deleteUpload(track.id);
      queryClient.invalidateQueries({ queryKey: ['userMusicUploads'] });
      if (selectedMusic === track.file_url) {
        onSelectMusic('none', 'No Music', '');
      }
      toast.success('Track removed');
    } catch {
      toast.error('Failed to remove track');
    }
  };

  const handlePlayPreview = (e, track) => {
    e.stopPropagation();
    // Library tracks: audio_url | Uploaded tracks (from DB): file_url
    const src = resolveUrl(track.audio_url || track.file_url || '');
    const key = resolveUrl(track.audio_url || track.file_url || '') || String(track.id);
    if (!src) return;
    if (playingId === key) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.play().catch(() => setPlayingId(null));
      setPlayingId(key);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  const getCategoryColor = (categoryId) => {
    return musicCategories.find(c => c.id === categoryId)?.color || 'from-violet-500 to-purple-500';
  };

  return (
    <div className="space-y-5">
      {/* None Option - Prominent */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => onSelectMusic('none', 'No Music', '')}
        className={cn(
          "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
          selectedMusic === 'none' || !selectedMusic
            ? 'border-violet-500 bg-gradient-to-r from-violet-500/20 to-purple-500/20 shadow-lg shadow-violet-500/20'
            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
        )}
      >
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
          selectedMusic === 'none' || !selectedMusic
            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
            : 'bg-slate-700/50'
        )}>
          <VolumeX className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-white text-lg">No Background Music</h5>
          <p className="text-sm text-slate-400">Clean voice-only audio</p>
        </div>
        {(selectedMusic === 'none' || !selectedMusic) && (
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        )}
      </motion.div>

      {/* Music Library Section */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 overflow-hidden">
        <button
          onClick={() => setLibraryExpanded(!libraryExpanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
        >
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music2 className="w-5 h-5 text-violet-400" />
            Music Library
            {loadingLibrary
              ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin ml-2" />
              : <span className="text-xs font-normal text-slate-400 ml-2">({libraryTracks.length} tracks)</span>
            }
          </h4>
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", libraryExpanded && "rotate-180")} />
        </button>

        <AnimatePresence>
          {libraryExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mood..."
            className="pl-10 bg-slate-900/50 border-slate-700 h-10"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {musicCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium shrink-0",
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Music Grid */}
        <div className="max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          {loadingLibrary ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : filteredMusic.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Music2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No tracks found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {filteredMusic.map((track) => (
                  <motion.div
                    key={track.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { const url = resolveUrl(track.audio_url); onSelectMusic(url || String(track.id), track.name, url); }}
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
                      selectedMusic === (resolveUrl(track.audio_url) || String(track.id))
                        ? 'border-violet-500 bg-violet-500/15 shadow-md shadow-violet-500/20'
                        : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/50'
                    )}
                  >
                    {/* Play Button / Icon */}
                    <button
                      onClick={(e) => handlePlayPreview(e, track)}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                        playingId === (resolveUrl(track.audio_url) || String(track.id))
                          ? 'bg-violet-500 text-white'
                          : `bg-gradient-to-br ${getCategoryColor(track.category)} text-white/90 hover:text-white`
                      )}
                    >
                      {playingId === (resolveUrl(track.audio_url) || String(track.id)) ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-white text-sm truncate">{track.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 capitalize">{track.mood}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-500">{track.duration}</span>
                      </div>
                    </div>

                    {/* Selected Check */}
                    {selectedMusic === (resolveUrl(track.audio_url) || String(track.id)) && (
                      <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Uploads Section */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-emerald-400" />
          Your Uploads
          {loadingUploads && <Loader2 className="w-4 h-4 text-slate-400 animate-spin ml-1" />}
        </h4>

        {/* Uploaded Tracks List */}
        {uploadedTracks.length > 0 && (
          <div className="space-y-2 mb-4">
            {uploadedTracks.map((track) => {
              const displayName = track.original_name.replace(/\.[^/.]+$/, '');
              const isPlaying = playingId === track.file_url;
              const isSelected = selectedMusic === track.file_url;
              return (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => onSelectMusic(track.file_url, displayName, track.file_url)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-md shadow-emerald-500/20'
                      : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600'
                  )}
                >
                  <button
                    onClick={(e) => handlePlayPreview(e, track)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                      isPlaying
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                    )}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-white text-sm truncate">{displayName}</h5>
                    <p className="text-xs text-slate-500">Custom upload</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-400 shrink-0"
                    onClick={(e) => handleDeleteTrack(e, track)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Upload Button */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all",
            isUploading ? 'opacity-50 cursor-wait' : 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
            'border-slate-700 bg-slate-900/30'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex items-center justify-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center",
              isUploading && "animate-pulse"
            )}>
              <Upload className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">
                {isUploading ? 'Uploading...' : 'Upload your music'}
              </p>
              <p className="text-xs text-slate-500">MP3, WAV, M4A • Max 10MB</p>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}