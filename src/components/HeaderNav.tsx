'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbit, User, LogOut, LogIn, ShieldCheck, UserMinus, Megaphone, Loader2, ChevronDown, UserCog } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { SignOutModal } from '@/components/SignOutModal';
import { UpcomingUpdateModal } from '@/components/UpcomingUpdateModal';
import { PersonalizeProfileModal } from '@/components/PersonalizeProfileModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { signOutAction } from '@/app/actions/auth';
import { toast, Toaster } from 'sonner';
import { consumePendingAuthToast, setPendingAuthToast } from '@/lib/auth-toast';

interface HeaderNavProps {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userFirstName?: string;
  userLastName?: string;
  userCustomName?: string;
  profilePromptDismissed?: boolean;
  isGuestMode: boolean;
}

export function HeaderNav({
  userId,
  userEmail,
  userName,
  userFirstName,
  userLastName,
  userCustomName,
  profilePromptDismissed,
  isGuestMode,
}: HeaderNavProps) {
  const { isDark } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isPersonalizeModalOpen, setIsPersonalizeModalOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // One-time prompt for existing users who do not have their personal name configured yet
  useEffect(() => {
    if (isGuestMode || !userId) return;

    // Has user already provided their personal first name?
    // We check userFirstName specifically so that users who only set a board title earlier
    // are still prompted to complete their profile with their real name.
    const hasFirstName = Boolean(userFirstName && userFirstName.trim());

    // Has the user dismissed this prompt previously?
    let hasDismissed = Boolean(profilePromptDismissed);
    try {
      if (localStorage.getItem(`habit_tracker_name_prompt_dismissed_${userId}`) === 'true') {
        hasDismissed = true;
      }
    } catch {}

    if (!hasFirstName && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsPersonalizeModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isGuestMode, userId, userFirstName, profilePromptDismissed]);

  // Close account menu when tapping outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  // Consume any pending auth toasts queued before a full page reload (e.g. login, signup, logout)
  useEffect(() => {
    const pending = consumePendingAuthToast();
    if (pending) {
      const timer = setTimeout(() => {
        if (pending.type === 'error') {
          toast.error(pending.message, { description: pending.description });
        } else if (pending.type === 'info') {
          toast.info(pending.message, { description: pending.description });
        } else {
          toast.success(pending.message, { description: pending.description });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Automatically show the v2.0 roadmap teaser on first startup
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('ht_seen_v2_roadmap_v1');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsRoadmapOpen(true);
        }, 150);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback: show modal if localStorage is inaccessible
      setIsRoadmapOpen(true);
    }
  }, []);

  const handleConfirmSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      if (userEmail) {
        localStorage.removeItem(`habit_tracker_custom_name_${userEmail}`);
      }
      localStorage.removeItem('habit_tracker_custom_name');
      
      setPendingAuthToast({
        type: 'success',
        message: 'Signed out successfully',
        description: 'See you next time!',
      });

      await signOutAction();
      window.location.reload();
    } catch {
      setIsSigningOut(false);
      toast.error('Unable to sign out right now. Please try again.');
    }
  };

  return (
    <>
      <Toaster
        theme={isDark ? 'dark' : 'light'}
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          classNames: {
            toast: 'font-sans rounded-2xl shadow-2xl backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 text-xs sm:text-sm',
            actionButton: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors',
            cancelButton: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors',
            closeButton: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
          },
        }}
      />

      <header className="sticky top-2 sm:top-4 z-40 px-3 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-lg dark:shadow-2xl flex items-center justify-between transition-colors duration-300 gap-2">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
              <Orbit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-slate-900 dark:text-white font-mono truncate transition-colors">
                Habit Tracker
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:block truncate transition-colors">
                Personal daily rituals &bull; Build consistency & track your progress
              </p>
            </div>
          </div>

          {/* Account Controls & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-xs">
            {/* v2.0 Roadmap / Drops Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsRoadmapOpen(true)}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 text-slate-800 dark:text-slate-200 border border-cyan-500/30 dark:border-cyan-500/40 rounded-xl transition-all cursor-pointer font-semibold shadow-xs text-[11px] sm:text-xs"
              title="v2.0 Roadmap: Drop 1 launching 10th October 2026"
            >
              <span className="relative flex items-center justify-center h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="hidden sm:inline font-mono leading-none">v2.0 Drops</span>
              <span className="sm:hidden font-mono leading-none">v2.0</span>
            </motion.button>

            {/* The Light/Dark Animated Switch */}
            <ThemeToggle />

            {isGuestMode ? (
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setAuthMode('signin');
                    setIsAuthOpen(true);
                  }}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl sm:rounded-2xl font-bold flex items-center gap-1.5 shadow-md sm:shadow-lg shadow-indigo-600/30 cursor-pointer transition-all text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In / Register</span>
                  <span className="sm:hidden">Sign In</span>
                </motion.button>
              </div>
            ) : (
              <div className="relative" ref={accountMenuRef}>
                {/* Account Profile Trigger */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold font-mono shadow-xs transition-all cursor-pointer text-[11px] sm:text-xs"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  title="Account options & settings"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[55px] xs:max-w-[85px] sm:max-w-[130px] md:max-w-[160px]">
                    {userName || userEmail}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isAccountMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                {/* Floating Account Menu */}
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                    >
                      {/* User Account Info */}
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                          Signed in as
                        </p>
                        {userName ? (
                          <>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                              {userName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate" title={userEmail || ''}>
                              {userEmail}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5" title={userEmail || ''}>
                            {userEmail}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>100% Private Workspace</span>
                        </div>
                      </div>

                      {/* Edit Profile / Name Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsPersonalizeModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <UserCog className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Edit Name / Profile...</span>
                      </button>

                      {/* Sign Out Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsSignOutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>Sign Out</span>
                      </button>

                      {/* Delete Account Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <UserMinus className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Delete Account...</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />

      {/* Account Deletion Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userEmail={userEmail}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        userEmail={userEmail}
        isSigningOut={isSigningOut}
      />

      {/* Upcoming v2.0 Roadmap Teaser Modal */}
      <UpcomingUpdateModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />

      {/* Personalize Profile Name Modal */}
      <PersonalizeProfileModal
        isOpen={isPersonalizeModalOpen}
        onClose={() => setIsPersonalizeModalOpen(false)}
        userId={userId}
        initialFirstName={userFirstName}
        initialLastName={userLastName}
        initialNickname={userCustomName}
      />
    </>
  );
}