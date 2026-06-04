import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import { Mic, CheckCircle, Sparkles, Waves } from 'lucide-react';
import VoiceDetailsStep from '@/components/clone/VoiceDetailsStep';
import AudioSampleStep from '@/components/clone/AudioSampleStep';
import TrainingStep from '@/components/clone/TrainingStep';
import CompleteStep from '@/components/clone/CompleteStep';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function CloneVoice() {
  const queryClient = useQueryClient();
  const { checkLimit } = useUsageLimits();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    script: '',
    language: 'en',
    clone_mode: 'standard',
    is_public: false,
    sample_url: '',
    source_type: '',
    status: 'pending',
  });

  const cloneVoiceMutation = useMutation({
    mutationFn: (data) => base44.entities.VoiceClone.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['voiceClones'] });
      try {
        await base44.trackUsage('clones', 1);
      } catch (e) {
        console.warn('Usage tracking failed:', e);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['monthlyUsage'] });
      }
      setCurrentStep(3);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const cloneLimit = checkLimit('clones');

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Voice name is required.');
        return;
      }
      if (formData.name.trim().length < 2) {
        toast.error('Voice name must be at least 2 characters.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.sample_url) {
        toast.error('Please upload an audio sample before continuing.');
        return;
      }
      if (!cloneLimit.allowed) return;
      cloneVoiceMutation.mutate(formData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleTrainingComplete = () => {
    setCurrentStep(4);
  };

  const handleCreateNew = () => {
    setFormData({ name: '', description: '', script: '', language: 'en', clone_mode: 'standard', is_public: false, sample_url: '', source_type: '', status: 'pending' });
    setCurrentStep(1);
  };

  const steps = [
    { num: 1, title: 'Details', icon: '📝' },
    { num: 2, title: 'Audio', icon: '🎙️' },
    { num: 3, title: 'Training', icon: '🧠' },
    { num: 4, title: 'Complete', icon: '✨' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <PageHeader
          title="Clone Your Voice"
          description="Create a digital replica of any voice with AI"
          icon={Mic}
          backTo="CloneList"
          gradient="from-teal-500 to-violet-500"
        />

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-violet-500/10 to-purple-500/10 border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
              <Waves className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                AI Voice Cloning <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-sm text-slate-400">Create hyper-realistic voice clones in minutes</p>
            </div>
          </div>
        </motion.div>

        <GlassCard className="p-8 bg-slate-900/80 backdrop-blur-xl border-slate-700/50" hover={false}>
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((step, i) => (
              <React.Fragment key={step.num}>
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-lg",
                    currentStep > step.num 
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/25" 
                      : currentStep === step.num 
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/25 scale-110" 
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                  )}>
                    {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : step.icon}
                  </div>
                  <p className={cn(
                    "text-xs mt-3 font-semibold tracking-wide",
                    currentStep >= step.num ? "text-white" : "text-slate-500"
                  )}>
                    {step.title}
                  </p>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="relative w-16 sm:w-24 h-1.5 mx-3 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > step.num ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <VoiceDetailsStep 
                formData={formData} 
                setFormData={setFormData} 
                onNext={handleNext} 
              />
            )}
            {currentStep === 2 && (
              <AudioSampleStep
                formData={formData}
                setFormData={setFormData}
                onNext={handleNext}
                onBack={handleBack}
                limitExceeded={!cloneLimit.allowed}
                limitInfo={cloneLimit}
              />
            )}
            {currentStep === 3 && (
              <TrainingStep onComplete={handleTrainingComplete} />
            )}
            {currentStep === 4 && (
              <CompleteStep voiceName={formData.name} onCreateNew={handleCreateNew} />
            )}
          </motion.div>
        </GlassCard>
      </div>
    </div>
  );
}