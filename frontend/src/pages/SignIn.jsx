import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  Loader2, Lock, User, AlertCircle, Eye, EyeOff,
  Mic2, Zap, Globe2, Layers, ArrowRight, CheckCircle2, Play
} from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'TOC', href: 'https://aisoftllc.com/tos.html' },
  { label: 'Support', href: 'https://agarwalinnosoft.com/support/' },
  { label: 'Cookies Policy', href: 'https://aisoftllc.com/cookies-policy.html' },
  { label: 'Privacy Policy', href: 'https://aisoftllc.com/privacy.html' },
];

const FEATURES = [
  { icon: Mic2,   title: 'Studio-Quality Voices',   desc: 'Ultra-realistic AI voices indistinguishable from humans.' },
  { icon: Globe2, title: '20+ Languages',             desc: 'Reach global audiences with native-sounding narration.' },
  { icon: Zap,    title: 'Custom Voice Generation',  desc: 'Create unique voices tailored to your brand and style.' },
  { icon: Layers, title: 'Clone Any Voice',          desc: 'Replicate your own voice or any speaker with precision.' },
];

const BENEFITS = [
  'No recording equipment needed',
  'Commercial license included',
  'Unlimited script revisions',
  'Priority cloud rendering',
];

export default function SignIn() {
  useEffect(() => {
    const ids = ['chatbot-pc1', 'chatbot-pc2', 'chatbot-font', 'chatbot-style', 'chatbot-html', 'chatbot-js1', 'chatbot-js2'];
    const pc1 = Object.assign(document.createElement('link'), { id: 'chatbot-pc1', rel: 'preconnect', href: 'https://fonts.googleapis.com' });
    const pc2 = Object.assign(document.createElement('link'), { id: 'chatbot-pc2', rel: 'preconnect', href: 'https://fonts.gstatic.com' });
    pc2.crossOrigin = 'anonymous';
    const font = Object.assign(document.createElement('link'), { id: 'chatbot-font', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' });
    document.head.append(pc1, pc2, font);

    const style = document.createElement('style');
    style.id = 'chatbot-style';
    style.textContent = `*{margin:0;padding:0;box-sizing:border-box}.orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:.5;animation:orbFloat 20s ease-in-out infinite;pointer-events:none}.orb-1{width:400px;height:400px;background:linear-gradient(135deg,#a855f7 0,#6366f1 100%);top:-150px;right:-100px}.orb-2{width:350px;height:350px;background:linear-gradient(135deg,#ec4899 0,#f43f5e 100%);bottom:-100px;left:-80px;animation-delay:-7s}.orb-3{width:250px;height:250px;background:linear-gradient(135deg,#06b6d4 0,#3b82f6 100%);top:50%;left:50%;transform:translate(-50%,-50%);animation-delay:-14s}@keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(30px,-40px) scale(1.1)}50%{transform:translate(-20px,20px) scale(.95)}75%{transform:translate(40px,30px) scale(1.05)}}.header{padding:20px 24px;background:linear-gradient(135deg,#7c3aed 0,#a855f7 40%,#ec4899 100%);display:flex;align-items:center;gap:16px;position:relative;overflow:hidden}.header::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.08) 0,transparent 60%);animation:headerShimmer 10s linear infinite}@keyframes headerShimmer{from{transform:rotate(0)}to{transform:rotate(360deg)}}.avatar{width:54px;height:54px;background:rgba(255,255,255,.2);border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:26px;position:relative;z-index:1;animation:avatarFloat 4s ease-in-out infinite}@keyframes avatarFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.header-text{position:relative;z-index:1}.title{color:#fff;font-size:19px;font-weight:700;margin-bottom:3px}.status{color:rgba(255,255,255,.9);font-size:13px;display:flex;align-items:center;gap:8px;font-weight:500}.status-dot{width:10px;height:10px;background:#4ade80;border-radius:50%;display:inline-block;animation:statusPulse 2s ease-in-out infinite;box-shadow:0 0 10px rgba(74,222,128,.5)}@keyframes statusPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.9)}}.messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}.messages::-webkit-scrollbar{width:5px}.messages::-webkit-scrollbar-track{background:0 0}.messages::-webkit-scrollbar-thumb{background:#ddd6fe;border-radius:10px}.msg-row{display:flex;gap:12px;align-items:flex-end;animation:msgSlideIn .4s ease-out forwards;opacity:0;transform:translateY(15px)}.msg-row.user{flex-direction:row-reverse}@keyframes msgSlideIn{to{opacity:1;transform:translateY(0)}}.msg-avatar{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}.msg-avatar.bot{background:linear-gradient(135deg,#7c3aed,#a855f7)}.msg-avatar.user{background:linear-gradient(135deg,#3b82f6,#06b6d4)}.bubble{max-width:78%;padding:14px 18px;border-radius:20px;font-size:15px;line-height:1.55;white-space:pre-wrap}.bubble.bot{background:#fff;color:#1e293b;border-bottom-left-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.04)}.bubble.user{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-bottom-right-radius:6px}.typing-row{display:flex;gap:12px;align-items:flex-end;animation:msgSlideIn .3s ease-out forwards}.typing-bubble{padding:16px 20px;background:#fff;border-radius:20px;border-bottom-left-radius:6px;display:flex;gap:6px;align-items:center;box-shadow:0 2px 12px rgba(0,0,0,.04)}.typing-dot{width:9px;height:9px;background:linear-gradient(135deg,#a855f7,#ec4899);border-radius:50%;animation:typingBounce 1.4s ease-in-out infinite}.typing-dot:nth-child(2){animation-delay:.15s}.typing-dot:nth-child(3){animation-delay:.3s}@keyframes typingBounce{0%,100%,60%{transform:translateY(0);opacity:.4}30%{transform:translateY(-8px);opacity:1}}.typing-row.hidden{display:none}.btn-container{display:flex;flex-direction:column;gap:10px;margin-left:10px;animation:btnsSlideIn .5s ease-out forwards;opacity:0;transform:translateY(10px)}.btn-container.hidden{display:none}@keyframes btnsSlideIn{to{opacity:1;transform:translateY(0)}}.btn{padding:14px 20px;background:#fff;border:1.5px solid #ede9fe;border-radius:16px;color:#7c3aed;font-size:14.5px;font-weight:600;cursor:pointer;text-align:left;transition:all .2s ease;font-family:inherit;display:flex;align-items:center;gap:12px}.btn:hover{background:#7c3aed;border-color:#7c3aed;color:#fff;transform:translateX(6px)}.btn:active{transform:translateX(3px) scale(.98)}.btn-icon{font-size:18px;transition:transform .2s ease}.btn:hover .btn-icon{transform:scale(1.1)}.btn-text{flex:1}.input-section{padding:0 20px 20px;background:0 0;animation:inputSlideUp .4s ease-out forwards;transform:translateY(15px);opacity:0}.input-section.hidden{display:none}.input-section.visible{animation:inputSlideUp .4s ease-out forwards}@keyframes inputSlideUp{to{transform:translateY(0);opacity:1}}.back-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;margin-bottom:12px;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s ease}.back-btn:hover{background:#7c3aed;border-color:#7c3aed;color:#fff}.back-btn:active{transform:scale(.97)}.back-btn.hidden{display:none}.back-icon{font-size:14px;transition:transform .2s ease}.back-btn:hover .back-icon{transform:translateX(-2px)}.input-row{display:flex;gap:12px;align-items:center;padding:16px;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(124,58,237,.08)}.input{flex:1;padding:14px 0;background:0 0;border:none;font-size:15px;outline:0;font-family:inherit;color:#1e293b}.input::placeholder{color:#94a3b8}.send-btn{width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;border-radius:14px;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease;flex-shrink:0}.send-btn:hover:not(:disabled){transform:scale(1.05);box-shadow:0 6px 20px rgba(124,58,237,.35)}.send-btn:active:not(:disabled){transform:scale(.95)}.send-btn:disabled{opacity:.4;cursor:not-allowed}.footer{padding:14px 20px;background:rgba(255,255,255,.6);text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(124,58,237,.05)}.footer span{background:linear-gradient(135deg,#7c3aed 0,#ec4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700}@media (max-width:480px){.window{max-width:100%;height:100vh;height:100dvh;max-height:none;border-radius:0}.header{padding:16px 18px}.avatar{width:48px;height:48px;font-size:22px;border-radius:14px}.title{font-size:17px}.messages{padding:16px;gap:12px}.msg-avatar{width:32px;height:32px;font-size:14px;border-radius:10px}.bubble{padding:12px 15px;font-size:14.5px;max-width:82%;border-radius:18px}.btn-container{margin-left:44px;gap:8px}.btn{padding:12px 16px;font-size:14px;border-radius:14px}.input-section{padding:0 16px 16px}.input-row{padding:12px 14px;border-radius:16px}.input{padding:12px 0;font-size:14.5px}.send-btn{width:44px;height:44px;border-radius:12px;font-size:16px}.back-btn{padding:8px 14px;font-size:12px}.footer{padding:12px 16px;font-size:11px}.orb{display:none}}@media (prefers-reduced-motion:reduce){*,::after,::before{animation-duration:0s!important;transition-duration:0s!important}}.window{display:none;position:fixed;bottom:110px;right:30px;width:100%;max-width:420px;height:85vh;max-height:720px;background:rgba(255,255,255,.92);backdrop-filter:blur(24px);border-radius:28px;flex-direction:column;overflow:hidden;box-shadow:0 25px 80px -15px rgba(124,58,237,.25),0 10px 30px -10px rgba(0,0,0,.08);z-index:1000}.window.active{display:flex;pointer-events:auto;transform:translateY(0) scale(1)}@keyframes chatOpen{from{opacity:0;transform:translateY(40px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}.chat-toggle{position:fixed;bottom:30px;right:30px;width:64px;height:64px;border-radius:18px;border:none;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:26px;cursor:pointer;box-shadow:0 15px 40px rgba(124,58,237,.4);transition:all .3s ease;z-index:1100}.chat-toggle:hover{transform:scale(1.1)}.chat-toggle:active{transform:scale(.95)}.chat-toggle.open{transform:rotate(90deg)}.window{opacity:0;transform:translateY(40px) scale(.95);transition:opacity .4s ease,transform .4s ease;pointer-events:none}.window.active{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}`;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'chatbot-html';
    container.innerHTML = `<button class="chat-toggle" id="chatToggle">💬</button><div class="window" id="chatWindow"><div class="header"><div class="avatar">🤖</div><div class="header-text"><div class="title">Support Desk</div><div class="status"><span class="status-dot"></span> Always here to help</div></div></div><div class="messages" id="messages"><div class="hidden typing-row" id="typing"><div class="bot msg-avatar">🤖</div><div class="typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div></div><div class="hidden input-section" id="inputSection"><button class="hidden back-btn" id="backBtn" onclick="goBack()"><span class="back-icon">←</span> Back to Menu</button><form class="input-row" id="inputForm" onsubmit="handleSubmit(event)"><input autocomplete="off" class="input" id="chatInput" placeholder="Type here..."><button class="send-btn" id="sendBtn" disabled type="submit">➤</button></form></div><div class="footer">Powered by <span>Pro Web Ventures</span></div></div>`;
    document.body.appendChild(container);

    const loadScript = (id, src) => new Promise(resolve => {
      const s = document.createElement('script');
      s.id = id; s.src = src; s.onload = resolve; s.onerror = resolve;
      document.body.appendChild(s);
    });
    loadScript('chatbot-js1', 'https://help.prowebventures.com/assets/js/token_chatbot.js')
      .then(() => loadScript('chatbot-js2', 'https://help.prowebventures.com/assets/js/token_frist_chatbot.js'));

    return () => {
      ids.forEach(id => document.getElementById(id)?.remove());
      ['chatbot-pc1', 'chatbot-pc2', 'chatbot-font'].forEach(id => document.getElementById(id)?.remove());
    };
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('login44', { username, password });
      if (response.data.success) {
        navigate(createPageUrl('Dashboard'));
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#07070f] flex overflow-hidden">

      {/* ── Left: Sales Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between p-8 xl:p-10 overflow-hidden">

        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-[#07070f] to-[#07070f]" />
          <motion.div className="absolute w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[140px]"
            style={{ top: '-20%', left: '-10%' }}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[500px] h-[500px] rounded-full bg-fuchsia-500/8 blur-[100px]"
            style={{ bottom: '-10%', right: '0%' }}
            animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Top: logo + badge */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <img src="https://app.aitalker.io/uploads/AIT-FE-02-Logo-01.png" alt="AI Talker" className="h-8 w-auto object-contain mb-4" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Trusted by 10,000+ Creators
          </span>
        </motion.div>

        {/* Center: headline + features */}
        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-[1.2] tracking-tight mb-3">
              Design Your Own{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                AI Voice
              </span>{' '}
              in Seconds
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-lg">
              The most advanced AI voice platform for creators, marketers, and businesses. No mic. No studio. Just results.
            </p>
          </motion.div>

          {/* Feature grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="grid grid-cols-2 gap-2.5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/20 hover:bg-white/[0.05] transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold mb-0.5">{f.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits checklist */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {b}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <a href="https://aitalker.io/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-[0_8px_32px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.55)] transition-all duration-200 group">
              <Play className="w-4 h-4 fill-white" />
              See How It Works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </motion.div>
        </div>

        {/* Bottom: social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          className="relative z-10 flex items-center gap-5 pt-4 border-t border-white/[0.06]">
          <div className="flex -space-x-2">
            {['🧑‍💼','👩‍🎨','🧑‍🏫','👨‍💻','👩‍🎤'].map((emoji, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border-2 border-[#07070f] flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
              ))}
            </div>
            <p className="text-slate-500 text-xs">Rated 4.9 / 5 by over 2,400 users</p>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Login Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 relative overflow-y-auto">

        {/* Mobile background */}
        <div className="pointer-events-none absolute inset-0 lg:hidden overflow-hidden">
          <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" style={{ top: '-10%', left: '-10%' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-fuchsia-500/8 blur-[80px]" style={{ bottom: '-5%', right: '-5%' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="https://app.aitalker.io/uploads/AIT-FE-02-Logo-01.png" alt="AI Talker" className="h-10 w-auto object-contain mb-4" />
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-6">

            {/* Heading */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm">Sign in to your AI Talker dashboard</p>
            </div>

            {/* Centralized login notice */}
            <div className="mb-4 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-violet-300/80 text-xs leading-relaxed text-center">
                Support &amp; Members Dashboard share the same login.<br />
                Centralized authentication system.
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-sm text-slate-400 font-medium">Username</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200" />
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username" required disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-slate-600
                      focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/15
                      hover:border-white/[0.13] transition-all duration-200 disabled:opacity-50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm text-slate-400 font-medium">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200" />
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                    required disabled={isLoading}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-slate-600
                      focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/15
                      hover:border-white/[0.13] transition-all duration-200 disabled:opacity-50" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-150">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="https://users.prowebventures.com/login?sendpass" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors duration-150">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" disabled={isLoading}
                className="relative w-full h-11 rounded-xl font-semibold text-white text-sm overflow-hidden
                  bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600
                  hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500
                  shadow-[0_8px_32px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                  transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]">
                {isLoading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</span>
                  : <span className="flex items-center justify-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                }
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {FOOTER_LINKS.map((link, i) => (
                  <span key={link.href} className="contents">
                    <a href={link.href} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-150 hover:underline underline-offset-2">
                      {link.label}
                    </a>
                    {i < FOOTER_LINKS.length - 1 && <span className="text-slate-700 text-xs select-none">·</span>}
                  </span>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden mt-6 text-center">
            <a href="https://aitalker.io/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" /> See How It Works
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
