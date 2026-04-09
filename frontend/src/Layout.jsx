import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Mic, Music2, Video, Users,
  Sparkles, HelpCircle, LogOut, Menu, X, ChevronDown,
  PenTool, Loader2, BookOpen, Briefcase,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useNotificationSocket } from '@/lib/useNotificationSocket';

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
    name: 'Brand Studio',
    icon: Sparkles,
    emoji: '🎨',
    children: [
      { name: 'New Brand Project', page: 'BrandStudio',     emoji: '✨' },
      { name: 'Brand Projects',    page: 'BrandStudioList', emoji: '🗂️' },
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
    name: 'Audiobook',
    icon: BookOpen,
    emoji: '📖',
    children: [
      { name: 'Create Audiobook', page: 'AudiobookCreator', emoji: '📝' },
      { name: 'My Audiobooks',    page: 'AudiobookList',    emoji: '📚' },
    ],
  },
  {
    name: 'Freelance Hub',
    icon: Briefcase,
    emoji: '💼',
    children: [
      { name: 'Job Finder',   page: 'JobFinder',   emoji: '🔍' },
      { name: 'Gig Creator',  page: 'GigCreator',  emoji: '✨' },
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

const EXTERNAL_ADDONS = [
  { key: 'ailogosuit',      name: 'AI Logo Suite',       emoji: '🎨', url: 'https://ailogosuite.app/' },
  { key: 'viralinfluencer', name: 'Viral Influencer AI', emoji: '📱', url: 'https://app.viralinfluencerai.com/' },
  { key: 'cleveraistudio',  name: 'Clever AI Studio',    emoji: '🎬', url: 'https://app.cleveraistudio.com/login' },
];

function ExternalAddonItem({ addon, enabled }) {
  const { sidebarOpen } = useContext(NavCtx);

  const handleClick = () => {
    if (enabled) {
      window.open(addon.url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error(`Subscribe to ${addon.name} to access this feature.`);
    }
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
        ${enabled ? 'text-slate-200 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-400 hover:bg-white/5'}`}
    >
      <span className={`text-lg ${!enabled ? 'opacity-50' : ''}`}>{addon.emoji}</span>
      {sidebarOpen && <span className="flex-1">{addon.name}</span>}
    </motion.div>
  );
}

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
  const { sidebarOpen, addonsObj, plan } = useContext(NavCtx);

  const isAddonEnabled = (key) => {
    // BUNDLE and ALLACCESS unlock all external apps
    if (plan === 'BUNDLE' || plan === 'ALLACCESS') return true;
    return addonsObj[key] === true || addonsObj[key?.toUpperCase()] === true;
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 backdrop-blur-xl ${mobile ? 'w-72' : sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300`}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800/50 flex items-center justify-start">
        <img
          src="https://app.aitalker.io/uploads/AIT-FE-02-Logo-01.png"
          alt="AI Talker"
          className={`object-contain transition-all duration-300 ${sidebarOpen || mobile ? 'h-10 w-auto' : 'h-8 w-8'}`}
        />
      </div>

      {/* Navigation — overflow-y-auto keeps scroll inside the sidebar */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map(item => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* External addon links — always visible */}
        <div className="pt-2 pb-1 px-3">
          <div className="h-px bg-slate-700/50" />
          {sidebarOpen && (
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-2 mb-1">Your Add-ons</p>
          )}
        </div>
        {EXTERNAL_ADDONS.map(addon => (
          <ExternalAddonItem key={addon.key} addon={addon} enabled={isAddonEnabled(addon.key)} />
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

  // Single WebSocket connection for the entire app — must not be inside NotificationCenter
  // because that component is mounted twice (mobile + desktop) which would open two sockets.
  useNotificationSocket();

  // Use TanStack Query so plan/addons are available as soon as cache is populated
  // (shared ['currentUser'] key means any page's query fills this instantly)
  // Disabled on public pages (SignIn) to avoid 401 → redirect loop
  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    enabled: !isPublicPage && !!localStorage.getItem('auth_token'),
  });

  // Prefer TanStack Query result (fresher / cached); fall back to AuthContext user
  const resolvedUser = currentUser || user;
  const addonsObj    = (resolvedUser?.addons && typeof resolvedUser.addons === 'object' && !Array.isArray(resolvedUser.addons)) ? resolvedUser.addons : {};
  const basePlanRaw  = (resolvedUser?.base_plan || '').toUpperCase();
  // ALLACCESS addon elevates effective plan to ALLACCESS
  const plan         = (addonsObj.ALLACCESS === true || addonsObj.allaccess === true)
    ? 'ALLACCESS'
    : basePlanRaw;
  // Only block Billing for agency SUB-users (agency_owner_id set = managed account)
  // Admins who have the AGENCY addon or ALLACCESS plan should still access Billing normally
  const hasAgency = !!resolvedUser?.agency_owner_id;

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
    addonsObj,
    plan,
  }), [expandedMenus, isActive, toggleExpanded, sidebarOpen, hasAgency, addonsObj, plan]);

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
            <div className="flex items-center">
              <img
                src="https://app.aitalker.io/uploads/AIT-FE-02-Logo-01.png"
                alt="AI Talker"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(o => !o)}>
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
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
            {/* Desktop top bar */}
            <div className="sticky top-0 z-30 flex justify-end items-center px-8 py-3 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/40">
              <NotificationCenter />
            </div>
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
