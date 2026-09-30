'use client';

import { useState, useEffect } from 'react';
import { Edit3, Check } from 'lucide-react';

interface NotesSectionProps {
  storageKey?: string;
  userEmail?: string | null;
  readOnly?: boolean;
  onRequireAuth?: () => void;
}

export function NotesSection({
  storageKey = 'habit_tracker_notes',
  userEmail,
  readOnly = false,
  onRequireAuth,
}: NotesSectionProps) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  // User-scoped storage key prevents cross-account notes leakage on shared devices
  const scopedKey = userEmail ? `${storageKey}_${userEmail}` : `${storageKey}_guest`;

  useEffect(() => {
    const savedText = localStorage.getItem(scopedKey);
    if (savedText !== null) {
      setNotes(savedText);
    } else {
      setNotes(
        '• Prioritize morning hydration & meditation.\n• Hit at least 4 workouts per week.\n• Keep phone away 45 mins before bedtime.'
      );
    }
  }, [scopedKey]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(scopedKey, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col h-full transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider font-mono">
            Notes & Intentions
          </h3>
        </div>
        {readOnly ? (
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
            Preview
          </span>
        ) : saved ? (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3" /> Saved
          </span>
        ) : null}
      </div>

      <div className="relative flex-1 mt-3">
        <textarea
          value={notes}
          onChange={handleChange}
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