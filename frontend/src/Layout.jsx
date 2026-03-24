import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', emoji: '🏠' },
  { 
    name: 'Voice Studio', 
    icon: Mic, 
    emoji: '🎙️',
    children: [
      { name: 'Create Voiceover', page: 'CreateVoiceover', emoji: '🎤' },
      { name: 'Voice Library', page: 'VoiceoverList', emoji: '📚' },
      { name: 'Conversational Voice', page: 'CreateConversational', emoji: '👥' },
      { name: 'My Conversations', page: 'ConversationalList', emoji: '💬' },
      { name: 'Clone Voice', page: 'CloneVoice', emoji: '🐑' },
      { name: 'My Clones', page: 'CloneList', emoji: '👯' },
      { name: 'Create Custom Voice', page: 'CreateCustomVoice', emoji: '✨' },
      { name: 'My Custom Voices', page: 'CustomVoiceList', emoji: '🎧' },
    ]
  },
  { 
    name: 'Audio Tools', 
    icon: Music2,
    emoji: '🎵',
    children: [
      { name: 'Audio Mixer', page: 'AudioMixer', emoji: '🎛️' },
      { name: 'Mixer Projects', page: 'MixerList', emoji: '🎧' },
    ]
  },
  { 
    name: 'Copy Creator', 
    icon: PenTool,
    emoji: '✍️',
    children: [
      { name: 'Create VSL Copy', page: 'CreateVSL', emoji: '📋' },
      { name: 'VSL Library', page: 'VSLList', emoji: '📜' },
      { name: 'Create Ad Copy', page: 'CreateAdCopy', emoji: '📝' },
      { name: 'Ad Copy Library', page: 'AdCopyList', emoji: '📄' },
    ]
  },
  { name: 'Transcribe', icon: Video, page: 'Transcribe', emoji: '🎥' },
  { name: 'Agency', icon: Users, page: 'Agency', emoji: '🏢' },
  { name: 'Billing', icon: LayoutDashboard, page: 'Billing', emoji: '💳' },
  {
    name: 'Support',
    icon: HelpCircle,
    emoji: '❓',
    children: [
      { name: 'Support Center', page: 'Support', emoji: '🆘' },
      { name: 'Getting Started', page: 'GettingStarted', emoji: '📖' },
      { name: 'Video Tutorials', page: 'VideoTutorials', emoji: '▶️' },
    ]
  },
];

// Pages that don't require authentication (no sidebar/layout)
const PUBLIC_PAGES = ['SignIn'];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [manuallyToggled, setManuallyToggled] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Agency addon users cannot access Billing
  const addonsObj = (user?.addons && typeof user.addons === 'object' && !Array.isArray(user.addons)) ? user.addons : {};
  const hasAgency = addonsObj?.AGENCY === true || addonsObj?.agency === true;

  const isActive = (page) => {
    return location.pathname.includes(page) || currentPageName === page;
  };

  // Determine which menus should be expanded - MUST be before any conditional returns
  const expandedMenus = React.useMemo(() => {
    const expanded = [];
    navItems.forEach(item => {
      if (item.children) {
        // Check if manually toggled
        if (manuallyToggled[item.name] !== undefined) {
          if (manuallyToggled[item.name]) {
            expanded.push(item.name);
          }
        } else {
          // Auto-expand if has active child
          const hasActiveChild = item.children.some(child => isActive(child.page));
          if (hasActiveChild) {
            expanded.push(item.name);
          }
        }
      }
    });
    return expanded;
  }, [manuallyToggled, location.pathname, currentPageName, isActive]);

  const toggleExpanded = (name) => {
    const isCurrentlyExpanded = expandedMenus.includes(name);
    setManuallyToggled(prev => ({
      ...prev,
      [name]: !isCurrentlyExpanded
    }));
  };

  // Check authentication on mount and when page changes
  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public pages
      if (PUBLIC_PAGES.includes(currentPageName)) {
        setIsAuthenticated(false); // Not needed for public pages
        return;
      }

      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          // Redirect to SignIn if not authenticated
          window.location.href = createPageUrl('SignIn');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        window.location.href = createPageUrl('SignIn');
      }
    };

    checkAuth();
  }, [currentPageName]);

  // If on a public page (like SignIn), render without layout
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Show loading while checking auth
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

  const NavItem = ({ item, depth = 0 }) => {
    const hasChildren = item.children?.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const active = !hasChildren && isActive(item.page);

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isExpanded ? 'bg-violet-500/10 text-violet-300' : 'text-slate-200 hover:text-white hover:bg-white/5'}`}
          >
            {item.emoji ? (
              <span className="text-lg">{item.emoji}</span>
            ) : (
              <item.icon className="w-5 h-5" />
            )}
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          <AnimatePresence>
            {isExpanded && sidebarOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-3"
              >
                {item.children.map(child => (
                  <NavItem key={child.page} item={child} depth={1} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Agency users: Billing is visible but blocked with a toast
    if (item.page === 'Billing' && hasAgency) {
      return (
        <motion.div
          whileHover={{ x: 4 }}
          onClick={() => toast.error('Billing management is not available for Agency accounts.')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-300 hover:bg-white/5 cursor-pointer"
        >
          {item.emoji ? (
            <span className="text-lg opacity-50">{item.emoji}</span>
          ) : item.icon ? (
            <item.icon className="w-5 h-5" />
          ) : null}
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
          {item.emoji ? (
            <span className="text-lg">{item.emoji}</span>
          ) : item.icon ? (
            <item.icon className="w-5 h-5" />
          ) : null}
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
  };

  const Sidebar = ({ mobile = false }) => (
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map(item => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={() => base44.auth.logout(createPageUrl('SignIn'))}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {(sidebarOpen || mobile) && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <AudioLines className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Expressive Voice</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
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
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-slate-800 hover:bg-slate-700 rounded-r-lg flex items-center justify-center transition-all duration-200"
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
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden pt-16 pb-6 px-4">
        {children}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}