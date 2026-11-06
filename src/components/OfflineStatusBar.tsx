'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CloudOff, CheckCircle2 } from 'lucide-react';

interface OfflineStatusBarProps {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingOpsCount: number;
  className?: string;
}

/**
 * OfflineStatusBar — Fixed top banner that appears when:
 *   1. User goes offline ("You're offline — changes will sync when you reconnect")
 *   2. Sync is in progress ("Syncing N changes...")
 *   3. Sync completed successfully ("Changes synced")
 *   4. Sync error occurs ("Sync failed")
 */
export function OfflineStatusBar({
  isOnline,
  syncStatus,
  pendingOpsCount,
  className = '',
}: OfflineStatusBarProps) {
  // Don't show when we have nothing to communicate
  const shouldShow = !isOnline || (isOnline && pendingOpsCount > 0) || syncStatus === 'syncing';

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none ${className}`}
        >
          <div
            role={isOnline ? 'status' : 'alert'}
            aria-live="polite"
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-b-3xl shadow-lg border-b border-l border-r backdrop-blur-md text-xs font-medium transition-colors ${
              !isOnline
                ? 'bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800'
                : syncStatus === 'syncing'
                ? 'bg-blue-50 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800'
                : pendingOpsCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800'
                : 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {!isOnline && (
              <>
                <WifiOff className="w-4 h-4 flex-shrink-0" />
                <span className="font-archivo">
                  You're offline — changes will sync when you reconnect
                  {pendingOpsCount > 0 && (
                    <span className="ml-1 font-semibold">
                      ({pendingOpsCount} pending)
                    </span>
                  )}
                </span>
              </>
            )}

            {isOnline && syncStatus === 'syncing' && (
              <>
                <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
                <span className="font-archivo">
                  Syncing {pendingOpsCount} change{pendingOpsCount !== 1 ? 's' : ''}…
                </span>
              </>
            )}

            {isOnline && syncStatus === 'idle' && pendingOpsCount > 0 && (
              <>
                <CloudOff className="w-4 h-4 flex-shrink-0" />
                <span className="font-archivo">
                  {pendingOpsCount} change{pendingOpsCount !== 1 ? 's' : ''} waiting to sync
                </span>
              </>
            )}

            {isOnline && syncStatus === 'idle' && pendingOpsCount === 0 && (
              <>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-archivo">All changes synced</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}