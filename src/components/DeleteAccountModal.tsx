'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { deleteAccountAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import { setPendingAuthToast } from '@/lib/auth-toast';

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
      const res = await deleteAccountAction(confirmText.trim().toUpperCase());
      if (!res.success || res.error) {
        setError(res.error || 'Failed to delete account');
        toast.error('Deletion Failed', { description: res.error || 'Please try again.' });
        setIsDeleting(false);
        return;
      }

      if (userEmail) {
        localStorage.removeItem(`habit_tracker_custom_name_${userEmail}`);
      }
      localStorage.removeItem('habit_tracker_custom_name');
      localStorage.removeItem('smart_tracker_habits');
      try {
        const keysToRemove: string[] = [];
        for (let idx = 0; idx < localStorage.length; idx++) {
          const k = localStorage.key(idx);
          if (k && (k.startsWith('habit_') || k.startsWith('smart_tracker_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}

      setPendingAuthToast({
        type: 'success',
        message: 'Account Deleted',
        description: 'Your account and tracking data have been purged.',
      });
      onClose();
      window.location.reload();
    } catch {
      setError('An error occurred during account deletion');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="relative w-full max-w-[380px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-rose-500/20 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#15130f] dark:text-[#fbf8f1] font-archivo max-h-[min(90vh,600px)] overflow-y-auto"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="font-clash font-semibold text-xl tracking-tight text-rose-600 dark:text-rose-400">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 mt-1 leading-relaxed">
              This action is permanent and irreversible. All habits, streaks, and reflection notes associated with{' '}
              <span className="font-semibold text-[#15130f] dark:text-[#fbf8f1]">{userEmail || 'your account'}</span> will be erased immediately.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
              Type <span className="text-rose-600 font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs sm:text-sm font-semibold tracking-wider uppercase focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-semibold hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Forever</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
