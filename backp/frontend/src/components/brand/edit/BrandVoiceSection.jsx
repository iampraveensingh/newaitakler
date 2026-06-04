import { useState } from 'react';
import { Edit3, Save, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';

const VOICE_FIELDS = [
  { key: 'tone',            label: 'Tone'            },
  { key: 'style',           label: 'Style'           },
  { key: 'personality',     label: 'Personality'     },
  { key: 'target_audience', label: 'Target Audience' },
  { key: 'tagline',         label: 'Tagline'         },
];

export default function BrandVoiceSection({ profile = {}, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(profile);

  const handleSave = () => {
    onUpdate(local);
    setEditing(false);
  };

  const handleCancel = () => {
    setLocal(profile);
    setEditing(false);
  };

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Mic className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Brand Voice Profile</h3>
            <p className="text-xs text-slate-400">AI-analyzed tone, style & personality</p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSave}
                className="bg-gradient-to-r from-violet-600 to-purple-600">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {VOICE_FIELDS.map(({ key, label }) => (
          (editing || local[key]) && (
            <div key={key}>
              <Label className="text-slate-400 text-xs mb-1.5 block">{label}</Label>
              {editing ? (
                <Input
                  value={local[key] || ''}
                  onChange={e => setLocal(l => ({ ...l, [key]: e.target.value }))}
                  className="bg-slate-800/60 border-slate-700 text-white h-9 text-sm"
                  placeholder={label}
                />
              ) : (
                <p className="text-slate-200 text-sm">{local[key] || '—'}</p>
              )}
            </div>
          )
        ))}
      </div>

      {/* Key Messages */}
      {local.key_messages?.length > 0 && (
        <div className="mt-4">
          <Label className="text-slate-400 text-xs mb-2 block">Key Messages</Label>
          <ul className="space-y-1.5">
            {local.key_messages.map((msg, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
