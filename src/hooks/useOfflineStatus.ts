'use client';

import { useState, useEffect, useCallback } from 'react';

export type SyncStatus = 'idle' | 'syncing' | 'error';

export interface OfflineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  syncStatus: SyncStatus;
  pendingOpsCount: number;
  lastSyncAt: number | null;
  syncError: string | null;
}

/**
 * useOfflineStatus - React hook for tracking offline state and sync status.
 *
 * - Automatically listens to window 'online'/'offline' events
 * - Tracks sync status via custom events from the sync engine
 * - Provides pending ops count for UI indicators
 */
export function useOfflineStatus(options: {
  onSyncComplete?: (syncedCount: number) => void;
  onError?: (error: Error) => void;
} = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingOpsCount, setPendingOpsCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Update pending ops count periodically
  const updatePendingCount = useCallback(async () => {
    try {
      const { getPendingOpsCount } = await import('@/lib/idb');
      const count = await getPendingOpsCount();
      setPendingOpsCount(count);
    } catch {
      // Silently ignore IDB errors
    }
  }, []);

  // Listen to online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline((prev) => {
        if (prev) {
          // Trigger sync when coming back online
          setSyncStatus('syncing');
        }
        return prev;
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setSyncStatus('idle'); // Reset to idle when offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setWasOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to sync events from the sync engine
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncStart = () => {
      setSyncStatus('syncing');
      setSyncError(null);
    };

    const handleSyncComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { syncedCount } = customEvent.detail || {};

      setSyncStatus('idle');
      setLastSyncAt(Date.now());
      setWasOffline(false);
      setSyncError(null);

      // Update pending count after sync
      updatePendingCount();

      if (syncedCount > 0) {
        options.onSyncComplete?.(syncedCount);
      }
    };

    const handleSyncError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { error } = customEvent.detail || {};

      setSyncStatus('error');
      setSyncError(error);

      options.onError?.(new Error(error));
    };

    window.addEventListener('sync:started', handleSyncStart);
    window.addEventListener('sync:complete', handleSyncComplete);
    window.addEventListener('sync:error', handleSyncError);

    return () => {
      window.removeEventListener('sync:started', handleSyncStart);
      window.removeEventListener('sync:complete', handleSyncComplete);
      window.removeEventListener('sync:error', handleSyncError);
    };
  }, [options, updatePendingCount]);

  // Heartbeat pending count updates
  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 2000); // Every 2 seconds

    // Also update when window gains focus
    const handleFocus = () => updatePendingCount();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updatePendingCount]);

  return {
    // State
    isOnline,
    wasOffline,
    syncStatus,
    pendingOpsCount,
    lastSyncAt,
    syncError,

    // Derived helpers
    showOfflineBanner: !isOnline,
    showSyncingIndicator: syncStatus === 'syncing' && pendingOpsCount > 0,
    showPendingIndicator: isOnline && pendingOpsCount > 0 && syncStatus === 'idle',
    hasSyncError: syncStatus === 'error',
  } as OfflineStatusState;
}