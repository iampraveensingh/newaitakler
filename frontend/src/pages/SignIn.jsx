import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'TOC', href: 'https://aisoftllc.com/tos.html' },
  { label: 'Support', href: 'https://agarwalinnosoft.com/support/' },
  { label: 'Cookies Policy', href: 'https://aisoftllc.com/cookies-policy.html' },
  { label: 'Privacy Policy', href: 'https://aisoftllc.com/privacy.html' },
];

export default function SignIn() {
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
    <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]"
          style={{ top: '-10%', left: '10%' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]"
          style={{ bottom: '-5%', right: '5%' }}
          animate={{ scale: [1.1, 1, 1.1], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-pink-500/8 blur-[80px]"
          style={{ top: '50%', right: '20%' }}
          animate={{ scale: [1, 1.2, 1], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-[440px]"
      >
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-5 sm:p-7">

          {/* Logo + Branding */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col items-center mb-5"
          >
            {/* Logo */}
            <div className="mb-5">
              <img
                src="https://staging.prowebventures.com/uploads/AIT-FE-02-Logo-01.png"
                alt="AI Talker"
                className="h-10 sm:h-12 w-auto object-contain mx-auto"
              />
            </div>

            {/* Centralized login notice */}
            <div className="mt-3 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
              <p className="text-violet-300/80 text-xs leading-relaxed">
                Support Login and Members Dashboard Login's are Same.<br />
                We use Centralized Login System.
              </p>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {/* Username */}
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm text-slate-400 font-medium">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-slate-600
                    focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/15
                    hover:border-white/[0.12] transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm text-slate-400 font-medium">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-slate-600
                    focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/15
                    hover:border-white/[0.12] transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-150"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a
                href="https://users.prowebventures.com/login?sendpass"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors duration-150"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-10 rounded-xl font-semibold text-white text-sm overflow-hidden
                bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600
                hover:from-violet-500 hover:via-purple-500 hover:to-blue-500
                shadow-[0_8px_32px_rgba(124,58,237,0.35)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                </span>
              )}
            </button>
          </motion.form>

          {/* Footer links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 pt-4 border-t border-white/[0.06]"
          >
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {FOOTER_LINKS.map((link, i) => (
                <span key={link.href} className="contents">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150 hover:underline underline-offset-2"
                  >
                    {link.label}
                  </a>
                  {i < FOOTER_LINKS.length - 1 && (
                    <span className="text-slate-700 text-xs select-none">·</span>
                  )}
                </span>
              ))}
            </nav>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
