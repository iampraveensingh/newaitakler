import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const languages = [
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'da', label: 'Danish' },
  { value: 'nl', label: 'Dutch' },
  { value: 'en', label: 'English' },
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

const qualityLevels = [
  { value: 'standard', label: 'Standard', desc: 'Good quality, faster processing', emoji: '⚡' },
  { value: 'premium', label: 'Premium', desc: 'High quality voice clone', emoji: '💎' },
  { value: 'studio', label: 'Studio', desc: 'Best quality, longer processing', emoji: '🎬' },
];

export default function VoiceDetailsStep({ formData, setFormData, onNext }) {
  const isFormValid = formData.name && formData.description && formData.language && formData.clone_mode;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-slate-300 mb-2 block">Voice Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="My Unique Voice"
          className="bg-slate-800/50 border-slate-700 text-white h-12"
        />
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the voice characteristics..."
          className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Language *</Label>
        <Select
          value={formData.language}
          onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
        >
          <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Quality Level *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {qualityLevels.map(level => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, clone_mode: level.value }))}
              className={cn(
                "p-4 rounded-xl border text-center transition-all",
                formData.clone_mode === level.value
                  ? "border-violet-500 bg-violet-500/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              )}
            >
              <span className="text-2xl">{level.emoji}</span>
              <p className="font-semibold text-white mt-1">{level.label}</p>
              <p className="text-xs text-slate-400 mt-1">{level.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <div>
          <Label className="text-white">Make Public</Label>
          <p className="text-sm text-slate-400">Allow others to use this voice</p>
        </div>
        <Switch
          checked={formData.is_public}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!isFormValid}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 h-12 px-8"
        >
          Next: Audio Samples
        </Button>
      </div>
    </div>
  );
}