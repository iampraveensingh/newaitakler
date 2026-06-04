import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44, systemVoices as systemVoicesApi } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import VoiceCard from './VoiceCard';
import IconTabs from '@/components/ui/IconTabs';
import { Mic, MessageSquare, BookOpen, Theater, Share2, GraduationCap, Megaphone, Star, Copy, Sparkles, Loader2, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

const BASE_VOICE_CATEGORIES = [
  { value: 'recent',        label: 'Recent',        icon: Clock          },
  { value: 'all',           label: 'All Voices',    icon: Mic            },
  { value: 'conversational',label: 'Conversational',icon: MessageSquare  },
  { value: 'narration',     label: 'Narration',     icon: BookOpen       },
  { value: 'characters',    label: 'Characters',    icon: Theater        },
  { value: 'social_media',  label: 'Social Media',  icon: Share2         },
  { value: 'educational',   label: 'Educational',   icon: GraduationCap  },
  { value: 'advertisement', label: 'Advertisement', icon: Megaphone      },
  { value: 'entertainment', label: 'Entertainment', icon: Star           },
  { value: 'cloned',        label: 'My Clones',     icon: Copy           },
  { value: 'custom',        label: 'Custom',        icon: Sparkles       },
];

const PREMIUM_TAB = { value: 'premium', label: 'Premium', icon: Zap };

export default function VoiceSelectionSection({ selectedVoiceId, onSelectVoice, initialTab, extraVoices = [], premiumVoices = [], hasPremiumAccess = false }) {
  const hasPremium = premiumVoices.length > 0;
  const voiceCategories = hasPremium
    ? [...BASE_VOICE_CATEGORIES, PREMIUM_TAB]
    : BASE_VOICE_CATEGORIES;
  const [activeTab, setActiveTab] = useState(initialTab || 'all');

  const handleTabChange = (tab) => {
    if (tab === 'premium' && !hasPremiumAccess) {
      toast('Subscription required', {
        description: 'Upgrade to Unlimited, Bundle, or All Access to unlock Premium Voices.',
        action: {
          label: 'Subscribe',
          onClick: () => window.open('https://aitalker.io/unlimited-v3', '_blank', 'noopener,noreferrer'),
        },
      });
      return;
    }
    setActiveTab(tab);
  };

  // Fetch system voices from DB
  const { data: rawSystemVoices = [], isLoading: loadingSystem } = useQuery({
    queryKey: ['systemVoices'],
    queryFn: systemVoicesApi.list,
    staleTime: 5 * 60_000,
  });
  const stockVoicesData = rawSystemVoices.map(v => ({
    id: `system_${v.id}`,
    name: v.name,
    type: v.type,
    description: v.description || '',
    audio: v.audio_url || '',
  }));

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

  // extraVoices (emotion) at the top of All; premiumVoices in their own tab only
  const allVoicesData = [...stockVoicesData, ...clonedVoicesList, ...customVoicesList];
  const allVoicesWithExtra = [...extraVoices, ...allVoicesData];

  const getVoicesForCategory = (categoryKey) => {
    if (categoryKey === 'all')     return allVoicesWithExtra;
    if (categoryKey === 'premium') return premiumVoices;
    if (categoryKey === 'cloned')  return clonedVoicesList;
    if (categoryKey === 'custom')  return customVoicesList;
    return stockVoicesData.filter(voice => voice.type === categoryKey);
  };

  const currentCategory = voiceCategories.find(c => c.value === activeTab);
  const voices = getVoicesForCategory(activeTab);
  const isLoading = loadingSystem ||
    (activeTab === 'cloned' && loadingClones) ||
    (activeTab === 'custom' && loadingCustom);

  // Get recently used voices from localStorage
  const [recentVoices, setRecentVoices] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentVoices');
    if (stored) {
      setRecentVoices(JSON.parse(stored));
    }
  }, []);

  const handleSelectVoice = (id, name, type, audio = '') => {
    // Save to recent voices
    const newRecent = [{ id, name, type }, ...recentVoices.filter(v => v.id !== id)].slice(0, 8);
    setRecentVoices(newRecent);
    localStorage.setItem('recentVoices', JSON.stringify(newRecent));
    onSelectVoice(id, name, type, audio);
  };

  // Map recent voice data to full voice objects (search all pools)
  const recentVoiceObjects = recentVoices.map(rv => {
    const found = allVoicesWithExtra.find(v => v.id === rv.id)
      || premiumVoices.find(v => v.id === rv.id);
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
        tabs={voiceCategories.map(t => t.value === 'premium' && !hasPremiumAccess
          ? { ...t, locked: true }
          : t
        )}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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