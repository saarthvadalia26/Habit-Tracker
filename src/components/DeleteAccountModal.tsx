'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react';
import { deleteAccountAction } from '@/app/actions/auth';
import { toast } from 'sonner';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setError(null);
    setIsDeleting(true);

    try {
      const res = await deleteAccountAction();
      if (!res.success || res.error) {
        setError(res.error || 'Failed to delete account');
        toast.error('Deletion Failed', { description: res.error || 'Please try again.' });
        setIsDeleting(false);
        return;
      }

      // Clear local storage data on client
      localStorage.removeItem('habit_tracker_custom_name');
      localStorage.removeItem('habit_tracker_theme');
      toast.success('Account Deleted', {
        description: 'Your account, habits, and all database records were permanently deleted.',
      });
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
      toast.error('Deletion Failed', { description: msg });
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 shadow-2xl overflow-hidden z-10 transition-colors"
          >
            {/* Top decorative hazard accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div>
                  <h3
                    id="delete-modal-title"
                    className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-mono"
                  >
                    Delete Account & Data
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Permanent action &bull; Cannot be undone
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content & Warning */}
            <div id="delete-modal-description" className="mt-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Irreversible Data Deletion</span>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300/90">
                  This will completely wipe account <strong className="font-mono text-slate-900 dark:text-white">{userEmail || 'current user'}</strong>, including:
                </p>
                <ul className="list-disc pl-4 text-[11px] text-rose-700 dark:text-rose-400 space-y-0.5">
                  <li>All configured habits & custom themes</li>
                  <li>All historical logs & consistency streak records</li>
                  <li>Account login credentials & authentication metadata</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-xl">
                  {error}
                </div>
              )}

              {/* Confirmation Input */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Type <span className="text-rose-600 dark:text-rose-400 font-black">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  disabled={isDeleting}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all disabled:opacity-50"
                  autoFocus
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!canDelete || isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Wiping Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Wipe Account</span>
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