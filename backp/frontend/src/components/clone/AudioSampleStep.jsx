import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Square, Upload, Youtube, Play, Pause, Trash2, CheckCircle, Clock, Waves, AudioLines, FileAudio, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const AnimatedWaveform = ({ isActive }) => (
  <div className="flex items-center justify-center gap-1 h-12">
    {Array.from({ length: 24 }).map((_, i) => (
      <motion.div
        key={i}
        className={cn(
          "w-1 rounded-full",
          isActive ? "bg-gradient-to-t from-red-500 to-orange-400" : "bg-slate-600"
        )}
        animate={isActive ? {
          height: [12, Math.random() * 40 + 10, 12],
        } : { height: 12 }}
        transition={{
          duration: 0.5,
          repeat: isActive ? Infinity : 0,
          delay: i * 0.05,
        }}
      />
    ))}
  </div>
);

const RecordedAudioCard = ({ duration, isPlaying, onPlay, onPause, onDelete, formatTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30"
  >
    <div className="flex items-center gap-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
        <AudioLines className="w-8 h-8 text-white" />
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h4 className="font-semibold text-white">Recording Complete!</h4>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="font-mono text-lg text-white">{formatTime(duration)}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            High Quality
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          size="lg"
          onClick={isPlaying ? onPause : onPlay}
          className={cn(
            "w-12 h-12 rounded-xl p-0",
            isPlaying 
              ? "bg-amber-500 hover:bg-amber-600" 
              : "bg-violet-500 hover:bg-violet-600"
          )}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <Button 
          size="lg"
          variant="outline" 
          onClick={onDelete}
          className="w-12 h-12 rounded-xl p-0 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>

    {/* Waveform Preview */}
    <div className="mt-4 p-3 rounded-xl bg-slate-800/50">
      <div className="flex items-center gap-1 h-8 justify-center">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-1 rounded-full",
              isPlaying ? "bg-gradient-to-t from-violet-500 to-purple-400" : "bg-slate-600"
            )}
            animate={isPlaying ? {
              height: [4, Math.random() * 28 + 4, 4],
            } : { height: Math.random() * 20 + 4 }}
            transition={{
              duration: 0.4,
              repeat: isPlaying ? Infinity : 0,
              delay: i * 0.02,
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default function AudioSampleStep({ formData, setFormData, onNext, onBack, limitExceeded = false, limitInfo = {} }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(''); // local blob URL for instant playback preview
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Timer effect - runs when isRecording changes
  useEffect(() => {
    let intervalId = null;
    
    if (isRecording) {
      intervalId = setInterval(() => {
        setTimer(prev => {
          const newVal = prev + 1;
          if (newVal >= 30) {
            stopRecording();
          }
          return newVal;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(blob);
        const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        const finalDuration = elapsedSeconds > 0 ? elapsedSeconds : 1;
        setRecordedDuration(finalDuration);

        // Use blob URL only for local preview — NOT stored in DB
        const blobUrl = URL.createObjectURL(blob);
        setPreviewUrl(blobUrl);
        setFormData(prev => ({ ...prev, source_type: 'record', sample_url: '' }));

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Upload to server so the real URL gets stored in DB
        const uploadBlob = async () => {
          setIsUploading(true);
          try {
            const file = new File([blob], 'voice-recording.wav', { type: 'audio/wav' });
            const { file_url } = await base44.integrations.Core.UploadFile({ file, track: false });
            setFormData(prev => ({ ...prev, sample_url: file_url }));
          } catch {
            toast.error('Failed to upload recording. Please try again.');
            setFormData(prev => ({ ...prev, source_type: '', sample_url: '' }));
            setPreviewUrl('');
            setRecordedBlob(null);
            setRecordedDuration(0);
          } finally {
            setIsUploading(false);
          }
        };
        uploadBlob();
      };

      mediaRecorder.start();
      setTimer(0);
      setIsRecording(true);

    } catch (err) {
      console.error("Error in startRecording:", err);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    // Use blob URL only for local preview while upload is in progress
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setRecordedBlob(file);
    setFormData(prev => ({ ...prev, source_type: 'upload', sample_url: '' }));

    const audio = new Audio(blobUrl);
    audio.onloadedmetadata = () => setRecordedDuration(Math.round(audio.duration));

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file, track: false });
      setFormData(prev => ({ ...prev, sample_url: file_url }));
      toast.success('Audio uploaded!');
    } catch {
      toast.error('Upload failed. Please try again.');
      setFormData(prev => ({ ...prev, source_type: '', sample_url: '' }));
      setPreviewUrl('');
      setRecordedBlob(null);
      setRecordedDuration(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeSubmit = () => {
    if (youtubeUrl) {
      setFormData(prev => ({ ...prev, sample_url: youtubeUrl, source_type: 'youtube' }));
      toast.success('YouTube link added!');
    }
  };

  const playAudio = () => {
    // Use the local blob URL for preview (works before upload completes)
    const src = previewUrl || formData.sample_url;
    if (src && formData.source_type !== 'youtube') {
      audioRef.current.src = src;
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const clearSample = () => {
    setRecordedBlob(null);
    setRecordedDuration(0);
    setPreviewUrl('');
    setIsUploading(false);
    setYoutubeUrl('');
    setFormData(prev => ({ ...prev, sample_url: '', source_type: '' }));
  };

  // sample_url must be a real server URL (not a blob) and upload must be finished
  const hasSample = formData.sample_url && formData.source_type && !isUploading;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Record Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <Label className="text-white text-lg font-semibold">Record Audio</Label>
            <p className="text-xs text-slate-400">Maximum 30 seconds</p>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {!isRecording && formData.source_type !== 'record' ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={startRecording}
                className="w-full h-20 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:via-orange-600 hover:to-amber-600 text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/20"
              >
                <Mic className="w-7 h-7 mr-3" /> Start Recording
              </Button>
            </motion.div>
          ) : isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Live Recording Animation */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
                <AnimatedWaveform isActive={true} />
                
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                  <span className="text-5xl font-mono font-bold text-white">{formatTime(timer)}</span>
                  <span className="text-slate-400 text-lg">/ 00:30</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full"
                    style={{ width: `${(timer / 30) * 100}%` }}
                  />
                </div>
              </div>
              
              <Button
                onClick={stopRecording}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-semibold rounded-xl"
              >
                <Square className="w-5 h-5 mr-2 fill-white" /> Stop Recording
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Recorded Audio Display */}
        <AnimatePresence>
          {formData.source_type === 'record' && recordedDuration > 0 && (
            <RecordedAudioCard
              duration={recordedDuration}
              isPlaying={isPlaying}
              onPlay={playAudio}
              onPause={pauseAudio}
              onDelete={clearSample}
              formatTime={formatTime}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Upload Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <Label className="text-white text-lg font-semibold">Upload Audio File</Label>
            <p className="text-xs text-slate-400">MP3, WAV, M4A supported</p>
          </div>
        </div>
        
        <div className="relative">
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
              formData.source_type === 'upload'
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-600 hover:border-violet-500/50 hover:bg-slate-800/50"
            )}
          >
            <FileAudio className="w-10 h-10 mb-2 text-slate-400" />
            <span className="text-slate-300 font-medium">
              {formData.source_type === 'upload' ? '✓ File uploaded' : 'Click or drag to upload'}
            </span>
            <span className="text-xs text-slate-500 mt-1">Maximum 10MB</span>
          </label>
        </div>
        
        <AnimatePresence>
          {formData.source_type === 'upload' && (
            <RecordedAudioCard
              duration={recordedDuration}
              isPlaying={isPlaying}
              onPlay={playAudio}
              onPause={pauseAudio}
              onDelete={clearSample}
              formatTime={formatTime}
            />
          )}
        </AnimatePresence>
      </div>

      {/* YouTube Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <Label className="text-white text-lg font-semibold">YouTube / Podcast Link</Label>
            <p className="text-xs text-slate-400">Extract audio from video</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-slate-800/50 border-slate-700 h-14 text-lg rounded-xl"
          />
          <Button 
            onClick={handleYoutubeSubmit}
            disabled={!youtubeUrl}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-14 px-6 rounded-xl"
          >
            <Youtube className="w-6 h-6" />
          </Button>
        </div>
        
        <AnimatePresence>
          {formData.source_type === 'youtube' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">YouTube link added successfully</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload progress indicator */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/30"
          >
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin shrink-0" />
            <span className="text-violet-300 text-sm font-medium">Uploading audio to server…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit exceeded alert */}
      {limitExceeded && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">Usage limit reached</p>
            <p className="text-red-400/80 text-sm mt-0.5">
              You have used {limitInfo.used}/{limitInfo.limit} voice clones this month. Please upgrade your plan to continue.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" className="h-12 px-6">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasSample || limitExceeded}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 h-12 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
          ) : (
            'Next: Start Training'
          )}
        </Button>
      </div>
    </div>
  );
}