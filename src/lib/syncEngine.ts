'use client';

import React from 'react';
import { logNumericHabitAction, toggleHabitLogAction } from '@/app/actions/habits';
import { addPendingOp, getPendingOps, incrementOpRetry, markOpSynced, pruneStaleOps } from '@/lib/idb';
import { toast } from 'sonner';

// Types are now only used internally, so move them closer to where they live
export type SyncStatus = 'idle' | 'syncing' | 'error';

export interface SyncResult {
  success: boolean;
  error?: string;
}

// Custom events for external listeners
const SYNC_STARTED = 'sync:started';
const SYNC_COMPLETE = 'sync:complete';
const SYNC_ERROR = 'sync:error';

export function emitSyncEvent(type: string, payload?: any) {
  typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent(type, { detail: payload }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Core sync orchestrator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Drains the outbox queue (pending_ops) and attempts to sync each operation to the server.
 * Returns the number of operations synced.
 */
export async function drainQueue(): Promise<number> {
  try {
    // Clean up stale ops first (older than 72 hours)
    const stalePruned = await pruneStaleOps();
    if (stalePruned) {
      toast.info(`Cleaned up ${stalePruned} stale offline operations`);
    }

    // Get all pending ops in FIFO order
    const ops = await getPendingOps();
    if (!ops.length) return 0;

    let syncedCount = 0;
    let hasError = false;

    emitSyncEvent(SYNC_STARTED, { totalOps: ops.length });

    for (let i = 0; i < ops.length && !hasError; i++) {
      const op = ops[i];

      try {
        // Select server action based on op type
        if (op.type === 'toggle') {
          const targetValue = typeof op.payload.isCompleted === 'boolean' ? op.payload.isCompleted : false;
          await toggleHabitLogAction(op.habitId, op.date, targetValue);
        } else if (op.type === 'numeric_log') {
          const targetValue = op.payload.numericValue ?? 0;
          await logNumericHabitAction(op.habitId, op.date, targetValue, op.payload.targetValue);
        } else {
          // Unknown op type - skip but warn
          console.warn('[OfflineSync] Unknown op type:', op.type);
          hasError = true;
          break;
        }

        // Mark as successfully synced
        await markOpSynced(op.id!);
        syncedCount++;

        // Show progress for longer queues
        if (ops.length > 3 && i > 0 && i % 2 === 0) {
          toast.info(`Synced ${i + 1}/${ops.length} offline operations...`, { duration: 1500 });
        }
      } catch (error) {
        console.error('[OfflineSync] Failed to sync op', op.id, error);

        // Emit error event for UI to capture
        emitSyncEvent(SYNC_ERROR, {
          op,
          error: error instanceof Error ? error.message : 'Unknown sync error',
        });

        // Increment retry count and keep in queue for next attempt
        await incrementOpRetry(op.id!, 3);

        // Show user-friendly toast with retry count
        const remaining = (op.retryCount || 0) + 1;
        toast.error(`Failed to sync log. Retrying... (${remaining}/3)`, {
          description: 'Will retry on next connection',
          duration: 4000,
        });

        // Stop on first failure - we'll retry later
        hasError = true;
        break;
      }
    }

    // Final notification
    if (syncedCount > 0) {
      toast.success(`Successfully synced ${syncedCount} offline operations`, {
        description: hasError ? 'Some operations were left behind' : undefined,
        duration: 3000,
      });
    }

    emitSyncEvent(SYNC_COMPLETE, {
      totalOps: ops.length,
      syncedCount,
      hasError,
    });

    return syncedCount;
  } catch (error) {
    console.error('[OfflineSync] Critical failure in drainQueue', error);
    emitSyncEvent(SYNC_ERROR, {
      error: error instanceof Error ? error.message : 'Critical sync failure',
    });
    throw error;
  }
}

/**
 * Starts monitoring network connectivity and drains queue when back online.
 * Returns a cleanup function that can be called to stop monitoring.
 */
export function startSyncOnReconnect(
  options: {
    onSyncComplete?: (syncedCount: number) => void;
    onError?: (error: Error) => void;
  } = {}
): () => void {
  if (typeof window === 'undefined') return () => {};

  let previousOnline = navigator.onLine;
  let syncInProgress = false;

  const handleOnline = async () => {
    if (previousOnline || syncInProgress) return;

    previousOnline = true;
    syncInProgress = true;

    try {
      const syncedCount = await drainQueue();
      options.onSyncComplete?.(syncedCount);
    } catch (error) {
      console.error('[OfflineSync] Sync failed on reconnect', error);
      options.onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      syncInProgress = false;
    }
  };

  const handleOffline = () => {
    previousOnline = false;
    toast.info('You are now offline. Changes will sync when you reconnect.', {
      duration: 6000,
      icon: '📴',
    });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial state check
  if (!previousOnline) {
    handleOffline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/** Hook wrapper for React components */
export function useSyncEngine(options: {
  onSyncComplete?: (syncedCount: number) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
} = {}) {
  const [status, setStatus] = React.useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  // Update pending count periodically
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateCount = async () => {
      const count = await import('@/lib/idb').then((m) => m.getPendingOpsCount());
      setPendingCount(count);
    };

    updateCount();
    const interval = setInterval(updateCount, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Event listeners for sync events
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncStart = () => setStatus('syncing');
    const handleSyncComplete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setStatus('idle');
      if (detail.syncedCount > 0) {
        options.onSyncComplete?.(detail.syncedCount);
      }
    };
    const handleSyncError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setStatus('error');
      setError(detail.error);
      options.onError?.(new Error(detail.error));
    };

    window.addEventListener(SYNC_STARTED, handleSyncStart);
    window.addEventListener(SYNC_COMPLETE, handleSyncComplete);
    window.addEventListener(SYNC_ERROR, handleSyncError);

    return () => {
      window.removeEventListener(SYNC_STARTED, handleSyncStart);
      window.removeEventListener(SYNC_COMPLETE, handleSyncComplete);
      window.removeEventListener(SYNC_ERROR, handleSyncError);
    };
  }, [options]);

  // Auto-start monitoring
  React.useEffect(() => {
    if (!options.autoStart) return;

    cleanupRef.current = startSyncOnReconnect({
      onSyncComplete: options.onSyncComplete,
      onError: options.onError,
    });

    return () => {
      cleanupRef.current?.();
    };
  }, [options.autoStart, options.onSyncComplete, options.onError]);

  // Public API
  const triggerSync = async () => {
    if (status === 'syncing') {
      throw new Error('Sync already in progress');
    }

    setStatus('syncing');
    setError(null);

    try {
      const syncedCount = await drainQueue();
      options.onSyncComplete?.(syncedCount);
      return { success: true, syncedCount };
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      setStatus('idle');
    }
  };

  return {
    status,
    pendingCount,
    error,
    triggerSync,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  };
}