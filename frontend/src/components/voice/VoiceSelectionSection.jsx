import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import VoiceCard from './VoiceCard';
import IconTabs from '@/components/ui/IconTabs';
import { Mic, Heart, Briefcase, Drama, Copy, Sparkles, Loader2, Clock } from 'lucide-react';

const stockVoicesData = [
  { id: 'sarah', name: 'Sarah', type: 'emotional', description: 'Warm & friendly', audio: '' },
  { id: 'emma', name: 'Emma', type: 'emotional', description: 'Calm & soothing', audio: '' },
  { id: 'luna', name: 'Luna', type: 'emotional', description: 'Playful & light', audio: '' },
  { id: 'olivia', name: 'Olivia', type: 'emotional', description: 'Empathetic tone', audio: '' },
  { id: 'mia', name: 'Mia', type: 'emotional', description: 'Gentle & caring', audio: '' },
  { id: 'alex', name: 'Alex', type: 'professional', description: 'Clear & confident', audio: '' },
  { id: 'michael', name: 'Michael', type: 'professional', description: 'Deep & authoritative', audio: '' },
  { id: 'david', name: 'David', type: 'professional', description: 'Energetic presenter', audio: '' },
  { id: 'james', name: 'James', type: 'professional', description: 'News anchor style', audio: '' },
  { id: 'robert', name: 'Robert', type: 'professional', description: 'Corporate tone', audio: '' },
  { id: 'aria', name: 'Aria', type: 'expressive', description: 'Dynamic range', audio: '' },
  { id: 'felix', name: 'Felix', type: 'expressive', description: 'Dramatic flair', audio: '' },
  { id: 'ivy', name: 'Ivy', type: 'expressive', description: 'Storyteller', audio: '' },
  { id: 'max', name: 'Max', type: 'expressive', description: 'Animated & fun', audio: '' },
  { id: 'zoe', name: 'Zoe', type: 'expressive', description: 'Versatile artist', audio: '' },
];

const voiceCategories = [
  { value: 'recent', label: 'Recent', icon: Clock },
  { value: 'all', label: 'All Voices', icon: Mic },
  { value: 'emotional', label: 'Emotional', icon: Heart },
  { value: 'professional', label: 'Professional', icon: Briefcase },
  { value: 'expressive', label: 'Expressive', icon: Drama },
  { value: 'cloned', label: 'My Clones', icon: Copy },
  { value: 'custom', label: 'Custom', icon: Sparkles },
];

export default function VoiceSelectionSection({ selectedVoiceId, onSelectVoice, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'all');

  // Fetch user's own cloned voices
  const { data: ownClones = [], isLoading: loadingClones } = useQuery({
    queryKey: ['voiceClones'],
    queryFn: () => base44.entities.VoiceClone.filter({ status: 'ready' })
  });

  // Fetch public cloned voices from all users (is_public = 1)
  const { data: publicClones = [] } = useQuery({
    queryKey: ['voiceClonesPublic'],
    queryFn: () => base44.entities.VoiceClone.publicList()
  });

  // Merge own clones + public clones from others (deduplicate by id)
  const ownCloneIds = new Set(ownClones.map(v => v.id));
  const allCloneData = [
    ...ownClones,
    ...publicClones.filter(v => !ownCloneIds.has(v.id)),
  ];

  // Fetch user's custom voices
  const { data: customVoices = [], isLoading: loadingCustom } = useQuery({
    queryKey: ['customVoices'],
    queryFn: () => base44.entities.CustomVoice.filter({ status: 'ready' })
  });

  // Transform cloned voices to match voice card format
  // audio_url = generated output (preferred); sample_url = training sample (fallback)
  const clonedVoicesList = allCloneData.map(v => ({
    id: `clone_${v.id}`,
    name: v.name,
    type: 'cloned',
    description: v.description || 'Cloned voice',
    audio: v.audio_url || v.sample_url || ''
  }));

  // Transform custom voices to match voice card format
  // custom_voices uses audio_url (no sample_url column)
  const customVoicesList = customVoices.map(v => ({
    id: `custom_${v.id}`,
    name: v.name,
    type: 'custom',
    description: v.description || 'Custom voice',
    audio: v.audio_url || ''
  }));

  // Combine all voices
  const allVoicesData = [...stockVoicesData, ...clonedVoicesList, ...customVoicesList];

  const getVoicesForCategory = (categoryKey) => {
    if (categoryKey === 'all') {
      return allVoicesData;
    }
    if (categoryKey === 'cloned') {
      return clonedVoicesList;
    }
    if (categoryKey === 'custom') {
      return customVoicesList;
    }
    return stockVoicesData.filter(voice => voice.type === categoryKey);
  };

  const currentCategory = voiceCategories.find(c => c.value === activeTab);
  const voices = getVoicesForCategory(activeTab);
  const isLoading = (activeTab === 'cloned' && loadingClones) || (activeTab === 'custom' && loadingCustom);

  // Get recently used voices from localStorage
  const [recentVoices, setRecentVoices] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentVoices');
    if (stored) {
      setRecentVoices(JSON.parse(stored));
    }
  }, []);

  const handleSelectVoice = (id, name, type) => {
    // Save to recent voices
    const newRecent = [{ id, name, type }, ...recentVoices.filter(v => v.id !== id)].slice(0, 8);
    setRecentVoices(newRecent);
    localStorage.setItem('recentVoices', JSON.stringify(newRecent));
    onSelectVoice(id, name, type);
  };

  // Map recent voice data to full voice objects
  const recentVoiceObjects = recentVoices.map(rv => {
    const found = allVoicesData.find(v => v.id === rv.id);
    return found || { id: rv.id, name: rv.name, type: rv.type, description: '', audio: '' };
  }).filter(Boolean);

  const getVoicesForCategoryUpdated = (categoryKey) => {
    if (categoryKey === 'recent') {
      return recentVoiceObjects;
    }
    return getVoicesForCategory(categoryKey);
  };

  const voicesDisplay = getVoicesForCategoryUpdated(activeTab);

  return (
    <div className="space-y-4 pt-4">
      <IconTabs
        tabs={voiceCategories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="max-h-[420px] overflow-y-auto pr-2 pt-2 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : voicesDisplay.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {voicesDisplay.map(voice => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={handleSelectVoice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">No {currentCategory?.label.toLowerCase() || ''} voices available yet.</p>
            {activeTab === 'cloned' && <p className="text-sm mt-1">Clone your voice to see it here</p>}
            {activeTab === 'custom' && <p className="text-sm mt-1">Create a custom voice to see it here</p>}
            {activeTab === 'recent' && <p className="text-sm mt-1">Select a voice to add it to your recent list</p>}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}

// Add padding to the grid container for bottom spacing
VoiceSelectionSection.defaultProps = {
  selectedVoiceId: '',
  onSelectVoice: () => {}
};