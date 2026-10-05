'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ArrowRight, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      setFirstName(initialFirstName || '');
      setLastName(initialLastName || '');
      setNickname(initialNickname || '');
      setError(null);
    }
  }, [isOpen, initialFirstName, initialLastName, initialNickname]);

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
      dismissProfilePromptAction().catch(() => {});
    }
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
        setIsSubmitting(false);
        return;
      }

      const finalCustomName = cleanNick || cleanFirst;
      if (userId) {
        try {
          localStorage.setItem(`habit_tracker_custom_name_${userId}`, finalCustomName);
        } catch {}
      }

      toast.success('Profile Saved', {
        description: `Welcome to your personal workspace!`,
      });

      onProfileUpdated?.({
        firstName: cleanFirst,
        lastName: cleanLast,
        customName: finalCustomName,
      });

      onClose();
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="relative w-full max-w-[390px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#15130f] dark:text-[#fbf8f1] font-archivo max-h-[min(90vh,640px)] overflow-y-auto"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#ff5a1f]">
                Personalize Workspace
              </span>
              <h3 className="font-clash font-semibold text-xl sm:text-[22px] tracking-tight">
                What should we call you?
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                Custom Board Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. FOCUS, PRIME"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
              />
              <p className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                Preview: <span className="font-semibold text-[#ff5a1f]">{previewTitle}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="py-2 px-3.5 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-semibold hover:bg-[#15130f]/5 transition-colors cursor-pointer"
              >
                Skip for now
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <span>Saving...</span> : <span>Save Profile</span>}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
