'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Loader2 } from 'lucide-react';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSigningOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSigningOut, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="relative w-full max-w-[360px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#15130f] dark:text-[#fbf8f1] font-archivo"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <LogOut className="w-4 h-4" />
            </div>
            <button
              onClick={onClose}
              disabled={isSigningOut}
              className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="font-clash font-semibold text-xl tracking-tight">
              Sign out?
            </h3>
            <p className="text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 mt-1 leading-relaxed">
              {userEmail
                ? `You will be signed out of ${userEmail}. Your data is safely stored in the cloud.`
                : 'You are about to sign out of your session.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSigningOut}
              className="flex-1 py-2.5 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-semibold hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSigningOut}
              className="flex-1 py-2.5 rounded-full bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <span>Sign Out</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
