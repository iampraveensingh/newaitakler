import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Mic, Copy, Music2, FileText, Video, Users, Gift,
  Sparkles, HelpCircle, LogOut, Menu, X, ChevronDown, Volume2,
  AudioLines, PenTool, FileAudio, Headphones, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

// ─── Nav data ────────────────────────────────────────────────────────────────

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', emoji: '🏠' },
  {
    name: 'Voice Studio',
    icon: Mic,
    emoji: '🎙️',
    children: [
      { name: 'Create Voiceover',    page: 'CreateVoiceover',    emoji: '🎤' },
      { name: 'Voice Library',       page: 'VoiceoverList',      emoji: '📚' },
      { name: 'Conversational Voice',page: 'CreateConversational',emoji: '👥' },
      { name: 'My Conversations',    page: 'ConversationalList', emoji: '💬' },
      { name: 'Clone Voice',         page: 'CloneVoice',         emoji: '🐑' },
      { name: 'My Clones',           page: 'CloneList',          emoji: '👯' },
      { name: 'Create Custom Voice', page: 'CreateCustomVoice',  emoji: '✨' },
      { name: 'My Custom Voices',    page: 'CustomVoiceList',    emoji: '🎧' },
    ],
  },
  {
    name: 'Audio Tools',
    icon: Music2,
    emoji: '🎵',
    children: [
      { name: 'Audio Mixer',    page: 'AudioMixer', emoji: '🎛️' },
      { name: 'Mixer Projects', page: 'MixerList',  emoji: '🎧' },
    ],
  },
  {
    name: 'Copy Creator',
    icon: PenTool,
    emoji: '✍️',
    children: [
      { name: 'Create VSL Copy',  page: 'CreateVSL',  emoji: '📋' },
      { name: 'VSL Library',      page: 'VSLList',    emoji: '📜' },
      { name: 'Create Ad Copy',   page: 'CreateAdCopy', emoji: '📝' },
      { name: 'Ad Copy Library',  page: 'AdCopyList', emoji: '📄' },
    ],
  },
  {
    name: 'Brand Studio',
    icon: Sparkles,
    emoji: '🎨',
    children: [
      { name: 'New Brand Project', page: 'BrandStudio',     emoji: '✨' },
      { name: 'Brand Projects',    page: 'BrandStudioList', emoji: '🗂️' },
    ],
  },
  { name: 'Transcribe', icon: Video,          page: 'Transcribe', emoji: '🎥' },
  { name: 'Agency',     icon: Users,          page: 'Agency',     emoji: '🏢' },
  { name: 'Billing',    icon: LayoutDashboard, page: 'Billing',   emoji: '💳' },
  {
    name: 'Support',
    icon: HelpCircle,
    emoji: '❓',
    children: [
      { name: 'Support Center',  page: 'Support',        emoji: '🆘' },
      { name: 'Getting Started', page: 'GettingStarted', emoji: '📖' },
      { name: 'Video Tutorials', page: 'VideoTutorials', emoji: '▶️' },
    ],
  },
];

const PUBLIC_PAGES = ['SignIn'];

// ─── Shared context ───────────────────────────────────────────────────────────
// Defined at module level so NavItem / Sidebar have a stable reference.

const NavCtx = createContext(null);

// ─── NavItem ──────────────────────────────────────────────────────────────────
// Defined OUTSIDE Layout so React never remounts it on state changes.

function NavItem({ item }) {
  const { expandedMenus, isActive, toggleExpanded, sidebarOpen, hasAgency } = useContext(NavCtx);
  const hasChildren = item.children?.length > 0;
  const isExpanded  = expandedMenus.includes(item.name);
  const active      = !hasChildren && isActive(item.page);

  if (hasChildren) {
    return (
      <div>
        <button
          // Prevent browser focus-scroll on click
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleExpanded(item.name)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${isExpanded ? 'bg-violet-500/10 text-violet-300' : 'text-slate-200 hover:text-white hover:bg-white/5'}`}
        >
          {item.emoji
            ? <span className="text-lg">{item.emoji}</span>
            : <item.icon className="w-5 h-5" />
          }
          {sidebarOpen && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>

        {/* Outer overflow-hidden clips the animation so it never triggers page reflow */}
        <div className="overflow-hidden">
          <AnimatePresence initial={false}>
            {isExpanded && sidebarOpen && (
              <motion.div
                key="submenu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
                className="ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-3"
              >
                {item.children.map(child => (
                  <NavItem key={child.page} item={child} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Agency users: Billing blocked
  if (item.page === 'Billing' && hasAgency) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toast.error('Billing management is not available for Agency accounts.')}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-300 hover:bg-white/5 cursor-pointer"
      >
        {item.emoji
          ? <span className="text-lg opacity-50">{item.emoji}</span>
          : item.icon ? <item.icon className="w-5 h-5" /> : null
        }
        {sidebarOpen && <span className="flex-1">{item.name}</span>}
      </motion.div>
    );
  }

  return (
    <Link to={createPageUrl(item.page)}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          ${active
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
            : 'text-slate-200 hover:text-white hover:bg-white/5'}`}
      >
        {item.emoji
          ? <span className="text-lg">{item.emoji}</span>
          : item.icon ? <item.icon className="w-5 h-5" /> : null
        }
        {sidebarOpen && (
          <>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </motion.div>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// Also outside Layout for the same stability reason.

function Sidebar({ mobile = false }) {
  const { sidebarOpen } = useContext(NavCtx);

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 backdrop-blur-xl ${mobile ? 'w-72' : sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300`}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <AudioLines className="w-6 h-6 text-white" />
          </div>
          {(sidebarOpen || mobile) && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Expressive Voice
              </h1>
              <p className="text-xs text-slate-400">Creator Studio</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation — overflow-y-auto keeps scroll inside the sidebar */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map(item => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/50">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => base44.auth.logout(createPageUrl('SignIn'))}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {(sidebarOpen || mobile) && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [manuallyToggled, setManuallyToggled] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const location = useLocation();
  const { user }  = useAuth();

  const addonsObj = (user?.addons && typeof user.addons === 'object' && !Array.isArray(user.addons)) ? user.addons : {};
  const hasAgency = addonsObj?.AGENCY === true || addonsObj?.agency === true;

  const isActive = useCallback((page) => {
    return currentPageName === page || location.pathname === createPageUrl(page);
  }, [currentPageName, location.pathname]);

  const expandedMenus = useMemo(() => {
    const expanded = [];
    navItems.forEach(item => {
      if (!item.children) return;
      if (manuallyToggled[item.name] !== undefined) {
        if (manuallyToggled[item.name]) expanded.push(item.name);
      } else {
        if (item.children.some(child => isActive(child.page))) expanded.push(item.name);
      }
    });
    return expanded;
  }, [manuallyToggled, isActive]);

  const toggleExpanded = useCallback((name) => {
    setManuallyToggled(prev => {
      const currentlyExpanded = (prev[name] !== undefined)
        ? prev[name]
        : navItems.find(i => i.name === name)?.children?.some(c => isActive(c.page)) ?? false;
      return { ...prev, [name]: !currentlyExpanded };
    });
  }, [isActive]);

  const navCtxValue = useMemo(() => ({
    expandedMenus,
    isActive,
    toggleExpanded,
    sidebarOpen,
    hasAgency,
  }), [expandedMenus, isActive, toggleExpanded, sidebarOpen, hasAgency]);

  useEffect(() => {
    if (PUBLIC_PAGES.includes(currentPageName)) {
      setIsAuthenticated(false);
      return;
    }
    (async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        if (!ok) window.location.href = createPageUrl('SignIn');
        else setIsAuthenticated(true);
      } catch {
        window.location.href = createPageUrl('SignIn');
      }
    })();
  }, [currentPageName]);

  if (PUBLIC_PAGES.includes(currentPageName)) return <>{children}</>;

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NavCtx.Provider value={navCtxValue}>
      <div className="min-h-screen bg-slate-950 text-white">

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <AudioLines className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Expressive Voice
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed top-0 left-0 bottom-0 z-50"
              >
                <Sidebar mobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          {/* Sidebar collapse toggle */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSidebarOpen(o => !o)}
            className="fixed top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-slate-800 hover:bg-slate-700 rounded-r-lg flex items-center justify-center transition-all duration-200"
            style={{ left: sidebarOpen ? '286px' : '74px' }}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sidebarOpen ? '-rotate-90' : 'rotate-90'}`} />
          </button>

          {/* Desktop Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 z-40 border-r border-slate-800/50">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden pt-16 pb-6 px-4">{children}</div>

        <style>{`
          .scrollbar-thin::-webkit-scrollbar { width: 4px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        `}</style>
      </div>
    </NavCtx.Provider>
  );
}
