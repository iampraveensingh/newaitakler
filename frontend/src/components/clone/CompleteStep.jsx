import React from 'react';
import { CheckCircle, Mic, Users, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';


export default function CompleteStep({ voiceName, onCreateNew }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center space-y-8"
    >
      {/* Success Icon */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-2 -right-2 text-4xl"
        >
          🎉
        </motion.div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Voice Successfully Queued
        </h2>
        <p className="text-slate-400 max-w-md">
          {voiceName ? `"${voiceName}" has been` : 'Your voice has been'} successfully queued.
          It will appear in your Account in under 3-5 Minutes.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <Sparkles className="w-6 h-6 text-violet-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Quality</p>
          <p className="text-white font-semibold">Premium</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <Mic className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-white font-semibold">Active</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Access</p>
          <p className="text-white font-semibold">Private</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={onCreateNew} className="flex-1 h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-lg">
          <Plus className="w-5 h-5 mr-2" /> Create New Clone
        </Button>
        <Link to={createPageUrl('CloneList')} className="flex-1">
          <Button variant="outline" className="w-full h-14 text-lg">
            <Users className="w-5 h-5 mr-2" /> View Clones
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
