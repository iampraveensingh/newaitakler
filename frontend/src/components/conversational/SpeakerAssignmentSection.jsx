import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import SpeakerCard from './SpeakerCard';
import { toast } from 'sonner';

export default function SpeakerAssignmentSection({ speakers, segments, onSpeakersChange, onSegmentsChange }) {

  const handleVoiceSelect = (speakerIndex, voiceId, voiceName, voiceType, voiceUrl) => {
    const updated = [...speakers];
    updated[speakerIndex] = { ...updated[speakerIndex], voice_id: voiceId, voice_name: voiceName, voice_type: voiceType, voice_url: voiceUrl || '' };
    onSpeakersChange(updated);

    const label = speakers[speakerIndex].label;
    const updatedSegs = segments.map(seg =>
      seg.speaker_label === label
        ? { ...seg, voice_id: voiceId, voice_name: voiceName, voice_type: voiceType, voice_url: voiceUrl || '' }
        : seg
    );
    onSegmentsChange(updatedSegs);
  };

  const handleLabelChange = (speakerIndex, newLabel) => {
    const oldLabel = speakers[speakerIndex].label;
    const updated = [...speakers];
    updated[speakerIndex] = { ...updated[speakerIndex], label: newLabel };
    onSpeakersChange(updated);

    const updatedSegs = segments.map(seg =>
      seg.speaker_label === oldLabel ? { ...seg, speaker_label: newLabel } : seg
    );
    onSegmentsChange(updatedSegs);
  };

  const handleRemoveSpeaker = (index) => {
    const label = speakers[index].label;
    const updated = speakers.filter((_, i) => i !== index);
    onSpeakersChange(updated);

    if (updated.length > 0) {
      const updatedSegs = segments.map(seg =>
        seg.speaker_label === label ? { ...seg, speaker_label: updated[0].label } : seg
      );
      onSegmentsChange(updatedSegs);
    }
  };

  const MAX_SPEAKERS = 5;

  const handleAddSpeaker = () => {
    if (speakers.length >= MAX_SPEAKERS) {
      toast.error(`Maximum ${MAX_SPEAKERS} speakers allowed.`);
      return;
    }
    onSpeakersChange([...speakers, {
      label: `Speaker ${speakers.length + 1}`,
      voice_id: '',
      voice_name: '',
      voice_type: '',
      voice_url: '',
    }]);
  };

  const allVoicesAssigned = speakers.every(s => s.voice_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            {speakers.length} speaker{speakers.length !== 1 ? 's' : ''} detected
          </span>
        </div>
        {allVoicesAssigned && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full"
          >
            All voices assigned
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {speakers.map((speaker, i) => (
          <SpeakerCard
            key={speaker.label + i}
            speaker={speaker}
            index={i}
            segments={segments}
            onVoiceSelect={(id, name, type, url) => handleVoiceSelect(i, id, name, type, url)}
            onLabelChange={(newLabel) => handleLabelChange(i, newLabel)}
            onRemove={() => handleRemoveSpeaker(i)}
            canRemove={speakers.length > 1}
          />
        ))}
      </AnimatePresence>

      <motion.button
        onClick={handleAddSpeaker}
        disabled={speakers.length >= MAX_SPEAKERS}
        whileHover={speakers.length < MAX_SPEAKERS ? { scale: 1.02, y: -1 } : {}}
        whileTap={speakers.length < MAX_SPEAKERS ? { scale: 0.98 } : {}}
        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 text-slate-400 hover:text-violet-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:text-slate-400"
        title={speakers.length >= MAX_SPEAKERS ? `Maximum ${MAX_SPEAKERS} speakers allowed` : 'Add Speaker'}
      >
        <Plus className="w-4 h-4" />
        {speakers.length >= MAX_SPEAKERS ? `Max ${MAX_SPEAKERS} speakers reached` : 'Add Speaker'}
      </motion.button>
    </div>
  );
}
