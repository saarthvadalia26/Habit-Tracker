'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, User, LogOut, LogIn, ShieldCheck, UserMinus, RotateCcw } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { signOutAction, deleteAccountAction } from '@/app/actions/auth';
import { toast, Toaster } from 'sonner';

interface HeaderNavProps {
  userEmail?: string | null;
  isGuestMode: boolean;
}

export function HeaderNav({ userEmail, isGuestMode }: HeaderNavProps) {
  const { isDark } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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

  const handleDeleteAccount = () => {
    toast.error('Permanently delete your account?', {
      description: 'This will completely wipe your account and all habit records from the database. This action cannot be undone.',
      action: {
        label: 'Delete All Data',
        onClick: async () => {
          try {
            const res = await deleteAccountAction();
            if (res.error) {
              toast.error(res.error);
            } else {
              localStorage.removeItem('smart_tracker_habits');
              toast.success('Account and all database records deleted.');
              window.location.reload();
            }
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete account');
          }
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

      <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl px-5 sm:px-6 py-4 shadow-lg dark:shadow-2xl flex items-center justify-between transition-colors duration-300">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white font-mono transition-colors">
                  Habit Tracker
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-mono transition-colors">
                  Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block transition-colors">
                Personal daily rituals • Build consistency & track your progress
              </p>
            </div>
          </div>

          {/* Account Controls & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* The Light/Dark Animated Switch */}
            <ThemeToggle />

            {isGuestMode ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setAuthMode('signin');
                    setIsAuthOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* User email badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold font-mono shadow-xs transition-colors">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate max-w-[110px] sm:max-w-[150px] text-xs">{userEmail}</span>
                  <span title="100% Private & Isolated Workspace">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                </div>

                {/* Delete Account Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/60 rounded-xl transition-all cursor-pointer font-medium"
                  title="Permanently delete account and all records"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Account</span>
                </motion.button>

                {/* Sign Out Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
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
    </>
  );
}
