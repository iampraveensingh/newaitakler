import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Zap, BarChart3, Clock, Percent, Minus, ArrowDown, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INVESTMENT = 297;

function AnimatedNumber({ value, prefix = '$', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const startTime = performance.now();
    const duration = 700;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        prev.current = end;
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  const rounded = Math.round(Math.abs(display));
  const formatted = rounded.toLocaleString();

  return (
    <span>{prefix}{formatted}{suffix}</span>
  );
}

function ResultCard({ label, value, icon: Icon, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border p-6 ${accent}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-4 h-4 opacity-60" />
        <span className="text-xs font-semibold uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        <AnimatedNumber value={value} />
      </div>
    </motion.div>
  );
}

export default function RevenueCalculator() {
  const [gigCost, setGigCost] = useState(50);
  const [wordCount, setWordCount] = useState(500);
  const [gigsPerDay, setGigsPerDay] = useState(3);

  const revenuePerDay = gigCost * gigsPerDay;
  const revenuePerMonth = revenuePerDay * 30;
  const revenuePerYear = revenuePerMonth * 12;
  const profitPerDay = revenuePerDay - (INVESTMENT / 365);
  const profitPerMonth = revenuePerMonth - (INVESTMENT / 12);
  const profitPerYear = revenuePerYear - INVESTMENT;
  const roi = INVESTMENT > 0 ? ((profitPerYear / INVESTMENT) * 100) : 0;
  const paybackDays = revenuePerDay > 0 ? Math.ceil(INVESTMENT / revenuePerDay) : Infinity;

  const inputs = [
    { label: 'Cost Per Gig', value: gigCost, onChange: setGigCost, placeholder: '50', icon: DollarSign },
    { label: 'Words Per Gig', value: wordCount, onChange: setWordCount, placeholder: '500', icon: BarChart3 },
    { label: 'Gigs Per Day', value: gigsPerDay, onChange: setGigsPerDay, placeholder: '3', icon: TrendingUp },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Revenue Calculator</h1>
          <p className="text-slate-400">See how much you can earn using VoiceAI for your freelance gigs</p>
        </motion.div>

        {/* Investment Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium leading-none mb-0.5">Annual Investment</p>
              <p className="text-xl font-bold text-white">${INVESTMENT}<span className="text-sm font-normal text-slate-400">/year</span></p>
            </div>
          </div>
        </motion.div>

        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6"
        >
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Your Gig Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {inputs.map((input) => (
              <div key={input.label}>
                <Label className="text-slate-400 mb-2 block text-xs font-medium uppercase tracking-wide">
                  {input.label}
                </Label>
                <div className="relative">
                  <input.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="number"
                    value={input.value}
                    onChange={(e) => input.onChange(Number(e.target.value) || 0)}
                    placeholder={input.placeholder}
                    className="pl-10 bg-slate-900/60 border-slate-700 text-white h-12 text-lg font-semibold rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResultCard label="Revenue / Day" value={revenuePerDay} icon={DollarSign} accent="border-blue-500/20 bg-blue-500/5 text-blue-400" delay={0.25} />
          <ResultCard label="Revenue / Month" value={revenuePerMonth} icon={TrendingUp} accent="border-violet-500/20 bg-violet-500/5 text-violet-400" delay={0.3} />
          <ResultCard label="Revenue / Year" value={revenuePerYear} icon={BarChart3} accent="border-indigo-500/20 bg-indigo-500/5 text-indigo-400" delay={0.35} />
        </div>

        {/* Investment Breakdown Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20">
            <Minus className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Minus ${INVESTMENT}/year investment</span>
            <ArrowDown className="w-4 h-4 text-red-400" />
          </div>
        </motion.div>

        {/* Pure Profit Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 blur-2xl opacity-60 pointer-events-none" />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/8 to-emerald-500/10 blur-md pointer-events-none" />

          <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 p-8 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-48 h-24 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pure Profit</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-slate-500 text-sm">After subtracting your ${INVESTMENT}/year investment</p>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-[11px] text-emerald-300/60 uppercase tracking-widest font-semibold mb-3">Per Day</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  <AnimatedNumber value={Math.round(profitPerDay)} />
                </p>
              </div>
              <div className="text-center p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-[11px] text-emerald-300/60 uppercase tracking-widest font-semibold mb-3">Per Month</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  <AnimatedNumber value={Math.round(profitPerMonth)} />
                </p>
              </div>
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/25 relative">
                <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 blur-sm pointer-events-none" />
                <div className="relative">
                  <p className="text-[11px] text-emerald-300/80 uppercase tracking-widest font-bold mb-3">Per Year</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 tracking-tight">
                    <AnimatedNumber value={Math.round(profitPerYear)} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="grid grid-cols-2 gap-5"
        >
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Return on Investment</p>
            </div>
            <p className="text-3xl font-bold text-white">
              <AnimatedNumber value={Math.round(roi)} prefix="" suffix="%" />
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Payback Period</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {paybackDays === Infinity ? '∞' : <><AnimatedNumber value={paybackDays} prefix="" /> <span className="text-lg text-slate-400">days</span></>}
            </p>
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-xs">
          * Based on {gigsPerDay} gig{gigsPerDay !== 1 ? 's' : ''} per day at ${gigCost} each, over a 30-day month with a ${INVESTMENT}/year subscription
        </p>
      </div>
    </div>
  );
}
