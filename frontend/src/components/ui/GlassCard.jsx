import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassCard({ 
  children, 
  className, 
  hover = true,
  gradient = false,
  onClick,
  ...props 
}) {
  const Component = hover ? motion.div : 'div';
  
  return (
    <Component
      onClick={onClick}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-2xl border border-slate-800/50 backdrop-blur-xl overflow-hidden',
        gradient 
          ? 'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90' 
          : 'bg-slate-900/60',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}