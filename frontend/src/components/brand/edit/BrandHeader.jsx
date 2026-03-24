import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function BrandHeader({ project, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project?.title || '');
  const [url, setUrl] = useState(project?.website_url || '');

  const handleSave = () => {
    onUpdate({ title, website_url: url });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(project?.title || '');
    setUrl(project?.website_url || '');
    setEditing(false);
  };

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">Brand Name</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-white h-9 text-sm"
                    placeholder="Brand name..."
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1 block">Website URL</Label>
                  <Input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-white h-9 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white truncate">{project?.title || 'Untitled Brand'}</h1>
                {project?.website_url && (
                  <p className="text-slate-400 text-sm truncate flex items-center gap-1.5 mt-0.5">
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                    {project.website_url.replace(/^https?:\/\//, '')}
                  </p>
                )}
                <div className="mt-2">
                  <StatusBadge status={project?.status} size="sm" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
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
    </GlassCard>
  );
}
