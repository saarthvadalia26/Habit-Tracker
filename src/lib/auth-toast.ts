export const AUTH_TOAST_KEY = 'ht_pending_auth_toast';

export interface PendingAuthToast {
  type: 'success' | 'error' | 'info';
  message: string;
  description?: string;
}

/**
 * Stores a pending toast notification in sessionStorage so it persists
 * across full browser page reloads (e.g. after login, signup, or logout).
 */
export function setPendingAuthToast(toast: PendingAuthToast): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(AUTH_TOAST_KEY, JSON.stringify(toast));
  } catch {
    // Graceful fallback if storage quota exceeded or disabled
  }
}

/**
 * Reads and clears the pending toast notification from sessionStorage.
 */
export function consumePendingAuthToast(): PendingAuthToast | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(AUTH_TOAST_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(AUTH_TOAST_KEY);
    return JSON.parse(raw) as PendingAuthToast;
  } catch {
    return null;
  }
}
