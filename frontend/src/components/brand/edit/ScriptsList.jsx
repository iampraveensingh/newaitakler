import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import ScriptCard from './ScriptCard';
import AddScriptDialog from './AddScriptDialog';

export default function ScriptsList({ scripts = [], onUpdate }) {
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (newScript) => {
    onUpdate([...scripts, newScript]);
  };

  const handleUpdateScript = (index, updated) => {
    const next = scripts.map((s, i) => i === index ? updated : s);
    onUpdate(next);
  };

  const handleDeleteScript = (index) => {
    onUpdate(scripts.filter((_, i) => i !== index));
  };

  return (
    <>
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Script Variations</h3>
              <p className="text-xs text-slate-400">
                {scripts.length > 0 ? `${scripts.length} script${scripts.length > 1 ? 's' : ''}` : 'No scripts yet'}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Script
          </Button>
        </div>

        {scripts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No script variations yet.</p>
            <p className="text-slate-600 text-xs mt-1">Click "Add Script" to create additional versions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script, i) => (
              <ScriptCard
                key={i}
                script={script}
                index={i}
                onUpdate={handleUpdateScript}
                onDelete={handleDeleteScript}
              />
            ))}
          </div>
        )}
      </GlassCard>

      <AddScriptDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />
    </>
  );
}
