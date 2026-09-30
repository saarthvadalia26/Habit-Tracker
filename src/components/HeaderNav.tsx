'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, User, LogOut, LogIn, ShieldCheck, UserMinus } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { signOutAction } from '@/app/actions/auth';
import { toast, Toaster } from 'sonner';

interface HeaderNavProps {
  userEmail?: string | null;
  isGuestMode: boolean;
}

export function HeaderNav({ userEmail, isGuestMode }: HeaderNavProps) {
  const { isDark } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    toast.message('Sign out of your session?', {
      action: {
        label: 'Sign Out',
        onClick: async () => {
          await signOutAction();
          toast.success('Signed out successfully');
          window.location.reload();
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return (
    <>
      <Toaster theme={isDark ? 'dark' : 'light'} position="top-right" richColors closeButton expand />

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
              <div className="flex items-center gap-1 sm:gap-2">
                {/* User email badge */}
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold font-mono shadow-xs transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                  <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[65px] xs:max-w-[90px] sm:max-w-[130px] md:max-w-[170px] text-[11px] sm:text-xs">
                    {userEmail}
                  </span>
                  <span className="hidden xs:inline shrink-0" title="100% Private & Isolated Workspace">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </span>
                </div>

                {/* Delete Account Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/60 rounded-xl transition-all cursor-pointer font-medium"
                  title="Permanently delete account and all records"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Delete Account</span>
                </motion.button>

                {/* Sign Out Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.button>
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
    </>
  );
}