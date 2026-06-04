import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScriptCard from '@/components/brand/edit/ScriptCard';
import AddScriptDialog from '@/components/brand/edit/AddScriptDialog';

export default function ScriptsList({ project, onSave, isSaving, onRenderScript, renderingIndex }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const additionalScripts = project.additional_scripts || [];

  const mainScript = project.vsl_script ? {
    title: 'Main VSL Script',
    script: project.vsl_script,
    audio_url: project.audio_url || null,
    status: project.audio_url ? 'completed' : (project.status === 'completed' ? 'completed' : 'draft'),
    isMain: true,
  } : null;

  const totalScripts = (mainScript ? 1 : 0) + additionalScripts.length;

  const handleMainScriptUpdate = (updatedScript) => {
    onSave({ vsl_script: updatedScript });
  };

  const handleAdditionalScriptUpdate = (index, updatedScript) => {
    const updated = [...additionalScripts];
    updated[index] = { ...updated[index], script: updatedScript };
    onSave({ additional_scripts: updated });
  };

  const handleAdditionalScriptDelete = (index) => {
    const updated = additionalScripts.filter((_, i) => i !== index);
    onSave({ additional_scripts: updated });
  };

  const handleAddScript = (title, script) => {
    const updated = [...additionalScripts, { title, script, audio_url: null, status: 'draft' }];
    onSave({ additional_scripts: updated });
    setShowAddDialog(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Scripts</h3>
            <p className="text-xs text-slate-500">{totalScripts} script{totalScripts !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 gap-1"
        >
          <Plus className="w-4 h-4" /> Add Script
        </Button>
      </div>

      {totalScripts === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30">
          <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No scripts yet. Add your first script to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {mainScript && (
              <motion.div key="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ScriptCard
                  title={mainScript.title}
                  script={mainScript.script}
                  audioUrl={mainScript.audio_url}
                  srtUrl={project.srt || null}
                  status={mainScript.status}
                  isMain
                  onUpdate={handleMainScriptUpdate}
                  onRender={() => onRenderScript && onRenderScript('main')}
                  isSaving={isSaving}
                  isRendering={renderingIndex === 'main'}
                />
              </motion.div>
            )}
            {additionalScripts.map((s, i) => (
              <motion.div
                key={`additional-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.04 }}
              >
                <ScriptCard
                  title={s.title}
                  script={s.script}
                  audioUrl={s.audio_url}
                  srtUrl={s.srt || null}
                  status={s.status || 'draft'}
                  onUpdate={(text) => handleAdditionalScriptUpdate(i, text)}
                  onDelete={() => handleAdditionalScriptDelete(i)}
                  onRender={() => onRenderScript && onRenderScript(i)}
                  isSaving={isSaving}
                  isRendering={renderingIndex === i}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddScriptDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddScript}
        projectUrl={project.website_url}
        brandVoicePrompt={project.voice_prompt || project.brand_voice_profile?.voice_prompt}
      />
    </div>
  );
}
