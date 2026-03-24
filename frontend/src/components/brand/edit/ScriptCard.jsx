import { useState } from 'react';
import { FileText, Edit3, Save, X, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GlassCard from '@/components/ui/GlassCard';

export default function ScriptCard({ script, index, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(script.title || '');
  const [localScript, setLocalScript] = useState(script.script || '');

  const handleSave = () => {
    onUpdate(index, { ...script, title: localTitle, script: localScript });
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalTitle(script.title || '');
    setLocalScript(script.script || '');
    setEditing(false);
  };

  const handleDownload = () => {
    const blob = new Blob([script.script || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || 'script'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-pink-400" />
          </div>
          {editing ? (
            <Input
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              className="bg-slate-800/60 border-slate-700 text-white h-8 text-sm"
              placeholder="Script title..."
            />
          ) : (
            <h4 className="font-medium text-white text-sm truncate">{script.title || `Script ${index + 1}`}</h4>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {editing ? (
            <>
              <Button size="icon" variant="ghost" onClick={handleCancel}
                className="w-7 h-7 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleSave}
                className="w-7 h-7 text-violet-400 hover:text-violet-300">
                <Save className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" onClick={handleDownload}
                className="w-7 h-7 text-slate-400 hover:text-white">
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(true)}
                className="w-7 h-7 text-slate-400 hover:text-white">
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(index)}
                className="w-7 h-7 text-red-400 hover:text-red-300">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <Textarea
          value={localScript}
          onChange={e => setLocalScript(e.target.value)}
          rows={6}
          className="bg-slate-800/60 border-slate-700 text-white text-sm resize-none"
        />
      ) : (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap">
          {script.script || 'No content.'}
        </p>
      )}
    </GlassCard>
  );
}
