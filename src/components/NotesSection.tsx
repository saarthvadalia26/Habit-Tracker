'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Edit3, Cloud, CloudCheck, CloudOff, Loader2 } from 'lucide-react';
import { saveMonthlyNoteAction } from '@/app/actions/auth';

interface NotesSectionProps {
  year?: number;
  month?: number;
  storageKey?: string;
  userEmail?: string | null;
  readOnly?: boolean;
  serverNotes?: string | null;
  onRequireAuth?: () => void;
}

const DEFAULT_NOTES_TEMPLATE =
  '• Prioritize morning hydration & meditation.\n• Hit at least 4 workouts per week.\n• Keep phone away 45 mins before bedtime.';

export function NotesSection({
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  storageKey = 'habit_tracker_notes',
  userEmail,
  readOnly = false,
  serverNotes,
  onRequireAuth,
}: NotesSectionProps) {
  const [notes, setNotes] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'error'>('idle');

  // Track the last text content confirmed synced to prevent redundant cloud writes
  const lastSyncedRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // User-scoped storage key prevents cross-account notes leakage on shared devices
  const scopedKey = userEmail ? `${storageKey}_${userEmail}` : `${storageKey}_guest`;

  // Core cloud sync function
  const syncToCloud = useCallback(
    async (text: string, targetYear: number, targetMonth: number) => {
      if (readOnly || !userEmail) return;
      if (text === lastSyncedRef.current) {
        setSyncStatus('idle');
        return;
      }

      setSyncStatus('saving');
      try {
        const res = await saveMonthlyNoteAction(targetYear, targetMonth, text);
        if (res.success) {
          lastSyncedRef.current = text;
          setSyncStatus('synced');
          setTimeout(() => {
            setSyncStatus((current) => (current === 'synced' ? 'idle' : current));
          }, 2500);
        } else {
          setSyncStatus('error');
        }
      } catch {
        setSyncStatus('error');
      }
    },
    [readOnly, userEmail]
  );

  // Load notes on mount and whenever the selected month or storage key changes
  useEffect(() => {
    // 1. If server notes exist from cloud, use them and cache locally
    if (serverNotes !== undefined && serverNotes !== null && serverNotes !== '') {
      setNotes(serverNotes);
      lastSyncedRef.current = serverNotes;
      try {
        localStorage.setItem(scopedKey, serverNotes);
      } catch {}
      setSyncStatus('idle');
      return;
    }

    // 2. Check local storage for pre-existing offline/local notes
    let savedLocal: string | null = null;
    try {
      savedLocal = localStorage.getItem(scopedKey);
    } catch {}

    if (savedLocal !== null && savedLocal.trim() !== '') {
      setNotes(savedLocal);
      // Auto-migrate local notes up to the cloud so they instantly sync across devices
      if (!readOnly && userEmail) {
        syncToCloud(savedLocal, year, month);
      }
      return;
    }

    // 3. Fallback to default starter template for fresh/empty months
    if (readOnly) {
      setNotes(DEFAULT_NOTES_TEMPLATE);
    } else {
      setNotes('');
      lastSyncedRef.current = '';
    }
  }, [scopedKey, serverNotes, readOnly, userEmail, year, month, syncToCloud]);

  // Clean up any pending debounced timers when component unmounts or switches
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    const val = e.target.value;
    setNotes(val);

    // 1. Instant local persistence
    try {
      localStorage.setItem(scopedKey, val);
    } catch {}

    // 2. Debounced cross-device cloud sync (750ms after user pauses typing)
    if (!readOnly && userEmail) {
      setSyncStatus('saving');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        syncToCloud(val, year, month);
      }, 750);
    }
  };

  // Immediately flush unsaved debounced changes when user clicks away / unfocuses
  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!readOnly && userEmail && notes !== lastSyncedRef.current) {
      syncToCloud(notes, year, month);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col h-full transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider font-mono">
            Notes &amp; Intentions
          </h3>
        </div>

        {/* Sync & Authorization Status Indicator */}
        {readOnly ? (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
            Local Preview
          </span>
        ) : syncStatus === 'saving' ? (
          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 px-2.5 py-0.5 rounded-full font-mono animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
            <span>Syncing...</span>
          </span>
        ) : syncStatus === 'synced' ? (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-full font-mono">
            <CloudCheck className="w-3 h-3 text-emerald-500" />
            <span>Synced to Cloud</span>
          </span>
        ) : syncStatus === 'error' ? (
          <span
            className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 px-2.5 py-0.5 rounded-full font-mono"
            title="Saved on this device. Will retry cloud sync next."
          >
            <CloudOff className="w-3 h-3 text-amber-500" />
            <span>Saved locally</span>
          </span>
        ) : (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
            <Cloud className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            <span>Synced</span>
          </span>
        )}
      </div>

      <div className="relative flex-1 mt-3">
        <textarea
          value={notes}
          onChange={handleChange}
          onBlur={handleBlur}
          readOnly={readOnly}
          onClick={() => {
            if (readOnly && onRequireAuth) onRequireAuth();
          }}
          placeholder="Jot down monthly goals, reflections, and mindset reminders for this month..."
          className={`w-full h-full min-h-[160px] p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
            readOnly
              ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 opacity-90'
              : 'focus:ring-2 focus:ring-purple-500/40'
          }`}
        />
      </div>
    </div>
  );
}