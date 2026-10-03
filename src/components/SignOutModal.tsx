'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Loader2, ShieldCheck, Cloud } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string | null;
  isSigningOut: boolean;
}

export function SignOutModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  isSigningOut,
}: SignOutModalProps) {
  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSigningOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSigningOut, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSigningOut ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="signout-modal-title"
            aria-describedby="signout-modal-description"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden z-10 transition-colors"
          >
            {/* Top decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                  <LogOut className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div>
                  <h3
                    id="signout-modal-title"
                    className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans"
                  >
                    Sign Out?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Confirm your session sign-out
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSigningOut}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Info Pill */}
            {userEmail && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Active account:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {userEmail}
                </span>
              </div>
            )}

            {/* Safe cloud storage reassurance */}
            <div
              id="signout-modal-description"
              className="mt-3.5 flex items-start gap-2.5 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 text-[11px] sm:text-xs text-indigo-900 dark:text-indigo-200"
            >
              <Cloud className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your habits, logs, and streak progress remain securely backed up. You can log back in anytime to continue where you left off.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSigningOut}
                className="px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isSigningOut}
                className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
