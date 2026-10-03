'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { updateProfileAction, dismissProfilePromptAction } from '@/app/actions/auth';
import { toast } from 'sonner';

interface PersonalizeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  initialFirstName?: string;
  initialLastName?: string;
  initialNickname?: string;
  onProfileUpdated?: (updated: {
    firstName: string;
    lastName: string;
    customName: string;
  }) => void;
}

export function PersonalizeProfileModal({
  isOpen,
  onClose,
  userId,
  initialFirstName = '',
  initialLastName = '',
  initialNickname = '',
  onProfileUpdated,
}: PersonalizeProfileModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [nickname, setNickname] = useState(initialNickname);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial values if modal is reopened with existing data
  useEffect(() => {
    if (isOpen) {
      setFirstName(initialFirstName || '');
      setLastName(initialLastName || '');
      setNickname(initialNickname || '');
      setError(null);
    }
  }, [isOpen, initialFirstName, initialLastName, initialNickname]);

  // Live preview for dashboard header title (capped to 15 chars so it never overflows)
  const previewTitle = (() => {
    const chosen = (nickname.trim() || firstName.trim()).slice(0, 15);
    if (!chosen) return 'HABIT TRACKER';
    const upper = chosen.toUpperCase();
    if (upper.endsWith("'S") || upper.endsWith('’S')) {
      return `${upper} TRACKER`;
    }
    if (upper.endsWith('S')) {
      return `${upper}' TRACKER`;
    }
    return `${upper}'S TRACKER`;
  })();

  const handleDismiss = () => {
    if (userId) {
      try {
        localStorage.setItem(`habit_tracker_name_prompt_dismissed_${userId}`, 'true');
      } catch {}
      // Fire-and-forget server sync so it persists across devices
      dismissProfilePromptAction().catch(() => {});
    }
    toast.info('You can personalize your name anytime', {
      description: 'Find "Edit Profile / Name" inside your account menu at the top.',
      duration: 4000,
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFirst = firstName.trim().slice(0, 15);
    const cleanLast = lastName.trim().slice(0, 20);
    const cleanNick = nickname.trim().slice(0, 15);

    if (!cleanFirst && !cleanNick) {
      setError('Please provide at least a first name or nickname.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfileAction({
        firstName: cleanFirst,
        lastName: cleanLast,
        nickname: cleanNick,
      });

      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        setIsSubmitting(false);
        return;
      }

      if (userId) {
        try {
          localStorage.setItem(`habit_tracker_name_prompt_dismissed_${userId}`, 'true');
        } catch {}
      }

      const displayName = cleanFirst || cleanNick;
      toast.success(`Welcome, ${displayName}!`, {
        description: 'Your habit tracker title has been personalized.',
      });

      if (onProfileUpdated && res.customName) {
        onProfileUpdated({
          firstName: cleanFirst,
          lastName: cleanLast,
          customName: res.customName,
        });
      }

      onClose();
      // Reload window briefly to ensure all server and client components synchronize seamlessly
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="personalize-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden z-10"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold tracking-wider text-indigo-700 dark:text-indigo-300 uppercase mb-2">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Personalize Your Board</span>
              </div>
              <h2
                id="personalize-title"
                className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                What should we call you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Add your name or nickname to personalize your habit board title and account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {/* First Name & Last Name (Side by Side) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                    First Name
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoFocus
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                    Last Name <span className="text-slate-400 lowercase font-normal">(opt)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Nickname / Custom Tracker Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Tracker Title / Nickname <span className="text-slate-400 lowercase font-normal">(opt)</span>
                  </label>
                  <span className="text-[9px] text-slate-400 font-mono">Max 15 chars</span>
                </div>
                <input
                  type="text"
                  maxLength={15}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={firstName.trim() ? `Defaults to "${firstName.trim()}"` : 'Nickname or custom title'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />

                {/* Live Tracker Title Preview Badge */}
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
                    Board Title:
                  </span>
                  <span className="font-mono font-black text-indigo-900 dark:text-indigo-100 text-xs tracking-tight">
                    {previewTitle}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <span>Save & Personalize</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
