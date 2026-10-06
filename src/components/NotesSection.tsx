'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Cloud,
  Check,
  CloudOff,
  Loader2,
  Trash2,
  FileText,
  List,
  ListOrdered,
  CheckSquare,
  Heading,
  Bold,
  Lock,
  Eye,
  Edit3,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { saveMonthlyNoteAction, getMonthlyNoteAction } from '@/app/actions/auth';

interface NotesSectionProps {
  year?: number;
  month?: number;
  monthName?: string;
  storageKey?: string;
  userEmail?: string | null;
  readOnly?: boolean;
  serverNotes?: string | null;
  onSaveNote?: (year: number, month: number, content: string) => void;
  onRequireAuth?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const DEFAULT_NOTES_TEMPLATE =
  '### 🎯 Monthly Focus\n- [ ] Prioritize consistent morning routine and deep work blocks.\n- [ ] Maintain workout streak of at least 4 sessions per week.\n- [ ] Digital detox: no screens 45 minutes before sleep.\n\n### 💡 Reflection Notes\n• Consistency compounds over time. Systems over goals.\n• Review progress at the end of each week.';

const PROMPT_CHIPS = [
  { label: '🎯 Monthly Wins', text: '\n\n### 🎯 Monthly Wins\n- [ ] ' },
  { label: '💡 Key Lessons', text: '\n\n### 💡 Key Lessons\n• ' },
  { label: '⚡ Habit Breakthroughs', text: '\n\n### ⚡ Habit Breakthroughs\n• ' },
  { label: '🧘 Mindset & Focus', text: '\n\n### 🧘 Mindset & Focus\n• ' },
  { label: '🚀 Next Month Goals', text: '\n\n### 🚀 Next Month Goals\n- [ ] ' },
];

export function NotesSection({
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  monthName,
  storageKey = 'habit_tracker_notes',
  userEmail,
  readOnly = false,
  serverNotes,
  onSaveNote,
  onRequireAuth,
  onPrevMonth,
  onNextMonth,
}: NotesSectionProps) {
  const [notes, setNotes] = useState('');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<'interactive' | 'edit'>('interactive');
  const [newQuickTask, setNewQuickTask] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track last synced text to prevent redundant network requests
  const lastSyncedRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Month-scoped storage key to keep each month's notes distinct
  const scopedKey = userEmail
    ? `${storageKey}_${userEmail}_${year}_${month}`
    : `${storageKey}_guest_${year}_${month}`;

  // Guest modification guard: alert and prompt auth modal
  const handleGuardAction = (): boolean => {
    if (readOnly || !userEmail) {
      toast.info('Sign in required', {
        description: 'Guest users cannot modify the journal. Please sign in or create a free account to write and sync reflections.',
      });
      if (onRequireAuth) onRequireAuth();
      return true;
    }
    return false;
  };

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
          if (onSaveNote) onSaveNote(targetYear, targetMonth, text);
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
    [readOnly, userEmail, onSaveNote]
  );

  // Load notes on mount and whenever selected month/year/scopedKey/serverNotes changes
  useEffect(() => {
    let isCancelled = false;

    // 1. If server notes exist from cloud (passed from parent), use them and cache locally
    if (typeof serverNotes === 'string') {
      setNotes(serverNotes);
      lastSyncedRef.current = serverNotes;
      try {
        localStorage.setItem(scopedKey, serverNotes);
      } catch {}
      setSyncStatus('idle');
      return;
    }

    // 2. If authenticated and serverNotes is not passed, fetch directly from cloud (cross-device sync)
    if (!readOnly && userEmail) {
      setIsLoadingCloud(true);
      getMonthlyNoteAction(year, month)
        .then((res) => {
          if (isCancelled) return;
          if (typeof res?.note === 'string') {
            setNotes(res.note);
            lastSyncedRef.current = res.note;
            try {
              localStorage.setItem(scopedKey, res.note);
            } catch {}
            if (onSaveNote) onSaveNote(year, month, res.note);
            setSyncStatus('idle');
          } else {
            // No note found in cloud, check local storage draft
            let savedLocal: string | null = null;
            try {
              savedLocal = localStorage.getItem(scopedKey);
            } catch {}

            if (savedLocal !== null && savedLocal.trim() !== '') {
              setNotes(savedLocal);
              syncToCloud(savedLocal, year, month);
            } else {
              setNotes('');
              lastSyncedRef.current = '';
            }
          }
        })
        .catch(() => {
          if (isCancelled) return;
          let savedLocal: string | null = null;
          try {
            savedLocal = localStorage.getItem(scopedKey);
          } catch {}
          setNotes(savedLocal ?? '');
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingCloud(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }

    // 3. Fallback for guest mode
    let savedLocal: string | null = null;
    try {
      savedLocal = localStorage.getItem(scopedKey);
    } catch {}

    if (savedLocal !== null && savedLocal.trim() !== '') {
      setNotes(savedLocal);
    } else {
      setNotes(DEFAULT_NOTES_TEMPLATE);
    }
    lastSyncedRef.current = '';
  }, [scopedKey, serverNotes, readOnly, userEmail, year, month, syncToCloud, onSaveNote]);

  // Clean up debounced timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (handleGuardAction()) return;

    const val = e.target.value;
    setNotes(val);

    // 1. Instant local persistence
    try {
      localStorage.setItem(scopedKey, val);
    } catch {}

    // 2. Debounced cloud sync (750ms after user pauses typing)
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

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!readOnly && userEmail && notes !== lastSyncedRef.current) {
      syncToCloud(notes, year, month);
    }
  };

  // Helper to update text state, persist, and preserve cursor location
  const updateTextAndCursor = (newText: string, newPos: number) => {
    if (handleGuardAction()) return;

    setNotes(newText);
    try {
      localStorage.setItem(scopedKey, newText);
    } catch {}

    if (!readOnly && userEmail) {
      setSyncStatus('saving');
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        syncToCloud(newText, year, month);
      }, 750);
    }

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newPos;
        textareaRef.current.selectionEnd = newPos;
        textareaRef.current.focus();
      }
    });
  };

  // Smart keyboard handler: Enter key auto-continues bullet lists, numbered lists, and checklists
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) {
      // Allow navigation arrows, block any editing keys and show auth toast
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
        handleGuardAction();
      }
      return;
    }

    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value } = textarea;
      if (selectionStart !== selectionEnd) return; // Allow normal Enter when multiple characters selected

      // Extract current line
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const lastNewlineIdx = beforeCursor.lastIndexOf('\n');
      const currentLine = beforeCursor.substring(lastNewlineIdx + 1);

      // Check for bullet list (• or - or *)
      const bulletMatch = currentLine.match(/^(\s*)([•\-\*])\s+/);
      // Check for numbered list (1., 2., etc.)
      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s+/);
      // Check for checklist (- [ ] or - [x])
      const checkMatch = currentLine.match(/^(\s*)-\s\[([ x])\]\s+/);

      if (checkMatch) {
        const indent = checkMatch[1];
        const prefix = checkMatch[0];
        const lineContent = currentLine.substring(prefix.length);

        // If user pressed Enter on an empty checklist item, end the list
        if (!lineContent.trim()) {
          e.preventDefault();
          const newText = beforeCursor.substring(0, lastNewlineIdx + 1 + indent.length) + afterCursor;
          const newCursorPos = lastNewlineIdx + 1 + indent.length;
          updateTextAndCursor(newText, newCursorPos);
          return;
        }

        e.preventDefault();
        const insert = `\n${indent}- [ ] `;
        const newText = beforeCursor + insert + afterCursor;
        const newCursorPos = selectionStart + insert.length;
        updateTextAndCursor(newText, newCursorPos);
        return;
      }

      if (numberMatch) {
        const indent = numberMatch[1];
        const num = parseInt(numberMatch[2], 10);
        const prefix = numberMatch[0];
        const lineContent = currentLine.substring(prefix.length);

        // If user pressed Enter on an empty numbered item, clear the number and end list
        if (!lineContent.trim()) {
          e.preventDefault();
          const newText = beforeCursor.substring(0, lastNewlineIdx + 1 + indent.length) + afterCursor;
          const newCursorPos = lastNewlineIdx + 1 + indent.length;
          updateTextAndCursor(newText, newCursorPos);
          return;
        }

        e.preventDefault();
        const nextNum = num + 1;
        const insert = `\n${indent}${nextNum}. `;
        const newText = beforeCursor + insert + afterCursor;
        const newCursorPos = selectionStart + insert.length;
        updateTextAndCursor(newText, newCursorPos);
        return;
      }

      if (bulletMatch) {
        const indent = bulletMatch[1];
        const bulletChar = bulletMatch[2];
        const prefix = bulletMatch[0];
        const lineContent = currentLine.substring(prefix.length);

        // If user pressed Enter on an empty bullet item, clear the bullet and end list
        if (!lineContent.trim()) {
          e.preventDefault();
          const newText = beforeCursor.substring(0, lastNewlineIdx + 1 + indent.length) + afterCursor;
          const newCursorPos = lastNewlineIdx + 1 + indent.length;
          updateTextAndCursor(newText, newCursorPos);
          return;
        }

        e.preventDefault();
        const insert = `\n${indent}${bulletChar} `;
        const newText = beforeCursor + insert + afterCursor;
        const newCursorPos = selectionStart + insert.length;
        updateTextAndCursor(newText, newCursorPos);
        return;
      }
    }

    // Handle Tab key to indent with 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd, value } = textarea;
      const insert = '  ';
      const newText = value.substring(0, selectionStart) + insert + value.substring(selectionEnd);
      updateTextAndCursor(newText, selectionStart + insert.length);
    }
  };

  // Helper to parse **bold** inside text
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
    return parts.map((part, i) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const content = part.slice(2, -2);
        return (
          <strong key={i} className="font-bold text-[#15130f] dark:text-[#fbf8f1]">
            {content}
          </strong>
        );
      }
      return part;
    });
  };

  // Checklist counts & stats
  const checklistStats = useMemo(() => {
    const lines = notes.split('\n');
    let total = 0;
    let done = 0;
    lines.forEach((line) => {
      const match = line.match(/^\s*[-*]\s*\[([ xX])\]/);
      if (match) {
        total++;
        if (match[1].toLowerCase() === 'x') done++;
      }
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [notes]);

  // Toggle checklist item at line index
  const toggleChecklistItem = (lineIndex: number) => {
    if (handleGuardAction()) return;

    const lines = notes.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    let nextState = false;
    if (line.match(/^(\s*[-*]\s*)\[ \](.*)$/)) {
      lines[lineIndex] = line.replace(/^(\s*[-*]\s*)\[ \]/, '$1[x]');
      nextState = true;
    } else if (line.match(/^(\s*[-*]\s*)\[[xX]\](.*)$/)) {
      lines[lineIndex] = line.replace(/^(\s*[-*]\s*)\[[xX]\]/, '$1[ ]');
      nextState = false;
    } else {
      return;
    }

    const updated = lines.join('\n');
    setNotes(updated);
    try {
      localStorage.setItem(scopedKey, updated);
    } catch {}

    if (nextState) {
      try {
        confetti({
          particleCount: 24,
          spread: 45,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#ff5a1f', '#fbf8f1', '#15130f', '#fbbf24'],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.75,
        });
      } catch {}
      toast.success('Task checked off!', { duration: 1500 });
    }

    if (!readOnly && userEmail) {
      syncToCloud(updated, year, month);
    }
  };

  // Quick add task in interactive mode
  const handleAddQuickTask = () => {
    if (handleGuardAction()) return;
    if (!newQuickTask.trim()) return;

    const taskText = `- [ ] ${newQuickTask.trim()}`;
    const updated = notes.trim() ? `${notes.trimEnd()}\n${taskText}` : taskText;
    setNotes(updated);
    setNewQuickTask('');
    try {
      localStorage.setItem(scopedKey, updated);
    } catch {}

    toast.success('Task added to journal!');
    if (!readOnly && userEmail) {
      syncToCloud(updated, year, month);
    }
  };

  // Toolbar actions: Insert bullets, numbers, checklist, heading, bold
  const insertFormatting = (type: 'bullet' | 'number' | 'checklist' | 'heading' | 'bold') => {
    if (handleGuardAction()) return;

    // If currently in interactive view, switch to edit mode with item appended
    if (viewMode === 'interactive') {
      let insert = '';
      if (type === 'checklist') insert = notes.trim() ? `${notes.trimEnd()}\n- [ ] ` : '- [ ] ';
      else if (type === 'heading') insert = notes.trim() ? `${notes.trimEnd()}\n\n### Section Title\n` : '### Section Title\n';
      else if (type === 'bullet') insert = notes.trim() ? `${notes.trimEnd()}\n• ` : '• ';
      else if (type === 'number') insert = notes.trim() ? `${notes.trimEnd()}\n1. ` : '1. ';
      else if (type === 'bold') insert = notes.trim() ? `${notes.trimEnd()} **bold text**` : '**bold text**';

      setNotes(insert);
      setViewMode('edit');
      try { localStorage.setItem(scopedKey, insert); } catch {}
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = insert.length;
        }
      }, 50);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    let newText = '';
    let newCursorPos = selectionStart;

    if (type === 'bullet') {
      if (selectedText) {
        const formatted = selectedText
          .split('\n')
          .map((line) => (line.startsWith('• ') ? line : `• ${line}`))
          .join('\n');
        newText = value.substring(0, selectionStart) + formatted + value.substring(selectionEnd);
        newCursorPos = selectionStart + formatted.length;
      } else {
        const before = value.substring(0, selectionStart);
        const isStartOfLine = before.length === 0 || before.endsWith('\n');
        const prefix = isStartOfLine ? '• ' : '\n• ';
        newText = value.substring(0, selectionStart) + prefix + value.substring(selectionEnd);
        newCursorPos = selectionStart + prefix.length;
      }
    } else if (type === 'number') {
      if (selectedText) {
        let counter = 1;
        const formatted = selectedText
          .split('\n')
          .map((line) => `${counter++}. ${line}`)
          .join('\n');
        newText = value.substring(0, selectionStart) + formatted + value.substring(selectionEnd);
        newCursorPos = selectionStart + formatted.length;
      } else {
        const before = value.substring(0, selectionStart);
        const isStartOfLine = before.length === 0 || before.endsWith('\n');
        const prefix = isStartOfLine ? '1. ' : '\n1. ';
        newText = value.substring(0, selectionStart) + prefix + value.substring(selectionEnd);
        newCursorPos = selectionStart + prefix.length;
      }
    } else if (type === 'checklist') {
      if (selectedText) {
        const formatted = selectedText
          .split('\n')
          .map((line) => (line.startsWith('- [ ] ') || line.startsWith('- [x] ') ? line : `- [ ] ${line}`))
          .join('\n');
        newText = value.substring(0, selectionStart) + formatted + value.substring(selectionEnd);
        newCursorPos = selectionStart + formatted.length;
      } else {
        const before = value.substring(0, selectionStart);
        const isStartOfLine = before.length === 0 || before.endsWith('\n');
        const prefix = isStartOfLine ? '- [ ] ' : '\n- [ ] ';
        newText = value.substring(0, selectionStart) + prefix + value.substring(selectionEnd);
        newCursorPos = selectionStart + prefix.length;
      }
    } else if (type === 'heading') {
      const before = value.substring(0, selectionStart);
      const isStartOfLine = before.length === 0 || before.endsWith('\n');
      const prefix = isStartOfLine ? '### ' : '\n\n### ';
      const textToUse = selectedText || 'Section Title';
      newText = value.substring(0, selectionStart) + prefix + textToUse + value.substring(selectionEnd);
      newCursorPos = selectionStart + prefix.length + textToUse.length;
    } else if (type === 'bold') {
      if (selectedText) {
        const formatted = `**${selectedText}**`;
        newText = value.substring(0, selectionStart) + formatted + value.substring(selectionEnd);
        newCursorPos = selectionStart + formatted.length;
      } else {
        const insert = '**bold text**';
        newText = value.substring(0, selectionStart) + insert + value.substring(selectionEnd);
        newCursorPos = selectionStart + 2;
      }
    }

    updateTextAndCursor(newText, newCursorPos);
  };

  // Insert prompt chip into textarea
  const handleInsertPrompt = (promptText: string) => {
    if (handleGuardAction()) return;

    const newText = notes ? `${notes.trimEnd()}${promptText}` : promptText.trimStart();
    setNotes(newText);
    try {
      localStorage.setItem(scopedKey, newText);
    } catch {}

    if (!readOnly && userEmail) {
      syncToCloud(newText, year, month);
    }

    // Refocus textarea and place cursor at end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleLoadTemplate = () => {
    if (handleGuardAction()) return;

    if (notes && !window.confirm('Replace current journal text with the starter template?')) {
      return;
    }
    setNotes(DEFAULT_NOTES_TEMPLATE);
    try {
      localStorage.setItem(scopedKey, DEFAULT_NOTES_TEMPLATE);
    } catch {}
    if (!readOnly && userEmail) {
      syncToCloud(DEFAULT_NOTES_TEMPLATE, year, month);
    }
  };

  const handleClear = () => {
    if (handleGuardAction()) return;

    if (!notes) return;
    if (!window.confirm('Are you sure you want to clear this month’s journal?')) return;
    setNotes('');
    try {
      localStorage.setItem(scopedKey, '');
    } catch {}
    if (!readOnly && userEmail) {
      syncToCloud('', year, month);
    }
  };

  // Compute stats
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div className="rounded-[24px] sm:rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-6 lg:p-8 shadow-framer-card flex flex-col gap-5 sm:gap-6 text-[#15130f] dark:text-[#fbf8f1]">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#ff5a1f]/10 text-[#ff5a1f] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-clash font-semibold text-lg sm:text-xl text-[#15130f] dark:text-[#fbf8f1] leading-tight">
                Monthly Intentions &amp; Reflections
              </h3>
              {readOnly && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Read-Only
                </span>
              )}
            </div>
            <p className="text-xs text-[#15130f]/55 dark:text-[#fbf8f1]/55 font-archivo">
              {monthName ? `${monthName} ${year}` : `${year}`} • Document your mental model &amp; system adjustments
            </p>
          </div>
        </div>

        {/* Sync & Auth Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {readOnly || !userEmail ? (
            <button
              type="button"
              onClick={handleGuardAction}
              className="text-[11px] font-semibold text-[#ff5a1f] bg-[#ff5a1f]/10 hover:bg-[#ff5a1f]/15 px-3 py-1 rounded-full font-archivo flex items-center gap-1.5 border border-[#ff5a1f]/20 transition-colors cursor-pointer"
              title="Sign in to edit journal"
            >
              <Lock className="w-3.5 h-3.5 text-[#ff5a1f]" />
              <span>Sign In to Edit</span>
            </button>
          ) : syncStatus === 'saving' ? (
            <span className="text-[11px] font-semibold text-[#ff5a1f] bg-[#ff5a1f]/10 border border-[#ff5a1f]/20 px-3 py-1 rounded-full font-archivo flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff5a1f]" />
              <span>Syncing to cloud...</span>
            </span>
          ) : syncStatus === 'synced' ? (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-archivo flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Synced</span>
            </span>
          ) : syncStatus === 'error' ? (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-archivo flex items-center gap-1.5">
              <CloudOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Saved locally</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#15130f]/50 dark:text-[#fbf8f1]/50 bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 px-3 py-1 rounded-full font-archivo flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud ready</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Reflection Prompt Chips */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/50 dark:text-[#fbf8f1]/50 font-archivo">
          Quick Reflection Prompts
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (readOnly) {
                  handleGuardAction();
                  return;
                }
                handleInsertPrompt(chip.text);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f2ecdf] dark:bg-[#11100d] hover:bg-[#ff5a1f]/10 dark:hover:bg-[#ff5a1f]/15 hover:text-[#ff5a1f] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 text-[#15130f]/75 dark:text-[#fbf8f1]/75 transition-all whitespace-nowrap cursor-pointer shrink-0"
              title={readOnly ? 'Sign in to use prompts' : 'Click to insert prompt template'}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formatting Toolbar & View Mode Switcher */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#f2ecdf]/70 dark:bg-[#11100d]/90 border border-[#15130f]/8 dark:border-[#fbf8f1]/8">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (readOnly) {
                  handleGuardAction();
                  return;
                }
                insertFormatting('bullet');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-all cursor-pointer"
              title="Bullet Point (or type • or -)"
            >
              <List className="w-4 h-4 text-[#ff5a1f]" />
              <span>Bullet List</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (readOnly) {
                  handleGuardAction();
                  return;
                }
                insertFormatting('number');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-all cursor-pointer"
              title="Numbered List (or type 1.)"
            >
              <ListOrdered className="w-4 h-4 text-[#ff5a1f]" />
              <span>Numbered List</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (readOnly) {
                  handleGuardAction();
                  return;
                }
                insertFormatting('checklist');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-all cursor-pointer"
              title="Interactive Checklist item (- [ ])"
            >
              <CheckSquare className="w-4 h-4 text-[#ff5a1f]" />
              <span>Checklist</span>
            </button>

            <div className="w-[1px] h-4 bg-[#15130f]/15 dark:bg-[#fbf8f1]/15 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => {
                if (readOnly) {
                  handleGuardAction();
                  return;
                }
                insertFormatting('heading');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-all cursor-pointer"
              title="Section Header (###)"
            >
              <Heading className="w-4 h-4 text-[#ff5a1f]" />
              <span>Header</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (readOnly) {
                  handleGuardAction();
                  return;
                }
                insertFormatting('bold');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-all cursor-pointer"
              title="Bold Text (**text**)"
            >
              <Bold className="w-4 h-4 text-[#ff5a1f]" />
              <span>Bold</span>
            </button>
          </div>

          {/* Mode Switcher: Interactive vs Raw Edit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-xl bg-[#15130f]/8 dark:bg-[#fbf8f1]/10 border border-[#15130f]/8 dark:border-[#fbf8f1]/8">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'interactive'
                    ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                    : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f]'
                }`}
                title="View formatted text with clickable checkboxes"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Interactive</span>
                {checklistStats.total > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      viewMode === 'interactive'
                        ? 'bg-[#ff5a1f] text-white'
                        : 'bg-[#ff5a1f]/20 text-[#ff5a1f]'
                    }`}
                  >
                    {checklistStats.done}/{checklistStats.total}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('edit');
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'edit'
                    ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                    : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f]'
                }`}
                title="Write and edit markdown text directly"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Surface: Interactive Mode vs Raw Textarea Mode */}
        {viewMode === 'interactive' ? (
          <div className="w-full">
            {isLoadingCloud ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center gap-3 bg-[#f2ecdf]/30 dark:bg-[#11100d]/40 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-2xl">
                <Loader2 className="w-7 h-7 animate-spin text-[#ff5a1f]" />
                <p className="text-xs sm:text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Retrieving reflections from cloud...
                </p>
              </div>
            ) : !notes.trim() ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center gap-3 bg-[#f2ecdf]/30 dark:bg-[#11100d]/40 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-2xl">
                <BookOpen className="w-8 h-8 text-[#ff5a1f]" />
                <h4 className="font-clash font-semibold text-lg text-[#15130f] dark:text-[#fbf8f1]">
                  No reflections written yet
                </h4>
                <p className="text-xs sm:text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60 max-w-sm">
                  Document your monthly breakthroughs, key takeaways, and action items.
                </p>
                <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (readOnly) {
                        handleGuardAction();
                        return;
                      }
                      handleLoadTemplate();
                    }}
                    className="px-4 py-2 rounded-full bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] text-xs font-semibold cursor-pointer shadow-sm hover:scale-102 transition-transform"
                  >
                    📄 Load Starter Template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (readOnly) {
                        handleGuardAction();
                        return;
                      }
                      setViewMode('edit');
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className="px-4 py-2 rounded-full bg-[#ff5a1f] text-white text-xs font-semibold cursor-pointer shadow-sm hover:bg-[#e04a12] transition-colors"
                  >
                    ✏️ Start Writing
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 w-full bg-[#f2ecdf]/40 dark:bg-[#11100d]/50 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-2xl p-5 sm:p-6 min-h-[300px] sm:min-h-[360px]">
                {/* Checklist Progress Bar (if checklists exist) */}
                {checklistStats.total > 0 && (
                  <div className="pb-3 mb-2 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#15130f]/70 dark:text-[#fbf8f1]/70">
                        Monthly Action Checklist
                      </span>
                      <span className="font-mono font-bold text-[#ff5a1f]">
                        {checklistStats.done} of {checklistStats.total} done ({checklistStats.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ff5a1f] transition-all duration-300"
                        style={{ width: `${checklistStats.pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Rendered Lines */}
                {notes.split('\n').map((line, lineIndex) => {
                  // 1. Checklist item
                  const checkMatch = line.match(/^(\s*[-*]\s*)\[([ xX])\]\s*(.*)$/);
                  if (checkMatch) {
                    const isCompleted = checkMatch[2].toLowerCase() === 'x';
                    const itemText = checkMatch[3];
                    return (
                      <div
                        key={lineIndex}
                        onClick={() => toggleChecklistItem(lineIndex)}
                        className={`group flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer select-none ${
                          isCompleted
                            ? 'bg-[#15130f]/3 dark:bg-[#fbf8f1]/3'
                            : 'hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5'
                        }`}
                      >
                        <button
                          type="button"
                          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          className={`w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isCompleted
                              ? 'bg-[#ff5a1f] border-2 border-[#ff5a1f] text-white shadow-sm'
                              : 'border-2 border-[#15130f]/30 dark:border-[#fbf8f1]/30 group-hover:border-[#ff5a1f]'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span
                          className={`text-sm sm:text-[14.5px] leading-relaxed transition-all ${
                            isCompleted
                              ? 'line-through text-[#15130f]/45 dark:text-[#fbf8f1]/45'
                              : 'text-[#15130f] dark:text-[#fbf8f1]'
                          }`}
                        >
                          {renderInlineFormatting(itemText)}
                        </span>
                      </div>
                    );
                  }

                  // 2. Heading (#, ##, ###)
                  const headerMatch = line.match(/^(#{1,3})\s+(.*)$/);
                  if (headerMatch) {
                    const level = headerMatch[1].length;
                    const headerContent = headerMatch[2];
                    return (
                      <div key={lineIndex} className="pt-3 pb-1 first:pt-0">
                        <h3
                          className={`font-clash font-semibold text-[#15130f] dark:text-[#fbf8f1] flex items-center gap-2 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 pb-1.5 ${
                            level === 1
                              ? 'text-xl sm:text-2xl'
                              : level === 2
                              ? 'text-lg sm:text-xl'
                              : 'text-base sm:text-lg'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#ff5a1f] shrink-0" />
                          <span>{renderInlineFormatting(headerContent)}</span>
                        </h3>
                      </div>
                    );
                  }

                  // 3. Bullet Point (•, -, *)
                  const bulletMatch = line.match(/^(\s*)(?:•|[-*])\s+(.*)$/);
                  if (bulletMatch) {
                    const bulletContent = bulletMatch[2];
                    return (
                      <div key={lineIndex} className="flex items-start gap-2.5 py-1 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] shrink-0 mt-2" />
                        <span className="text-sm sm:text-[14.5px] leading-relaxed text-[#15130f]/85 dark:text-[#fbf8f1]/85">
                          {renderInlineFormatting(bulletContent)}
                        </span>
                      </div>
                    );
                  }

                  // 4. Numbered Item (1., 2.)
                  const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
                  if (numMatch) {
                    const num = numMatch[2];
                    const numContent = numMatch[3];
                    return (
                      <div key={lineIndex} className="flex items-start gap-2.5 py-1 px-1">
                        <span className="font-mono text-xs font-bold text-[#ff5a1f] shrink-0 mt-0.5 w-5 text-right">
                          {num}.
                        </span>
                        <span className="text-sm sm:text-[14.5px] leading-relaxed text-[#15130f]/85 dark:text-[#fbf8f1]/85">
                          {renderInlineFormatting(numContent)}
                        </span>
                      </div>
                    );
                  }

                  // 5. Empty line
                  if (!line.trim()) {
                    return <div key={lineIndex} className="h-2" />;
                  }

                  // 6. Regular Paragraph
                  return (
                    <p key={lineIndex} className="text-sm sm:text-[14.5px] leading-relaxed text-[#15130f]/85 dark:text-[#fbf8f1]/85 py-0.5">
                      {renderInlineFormatting(line)}
                    </p>
                  );
                })}

                {/* Quick Add Checklist Task Input */}
                {!readOnly && (
                  <div className="flex items-center gap-2 pt-4 mt-2 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                    <input
                      type="text"
                      placeholder="+ Add a new checklist task..."
                      value={newQuickTask}
                      onChange={(e) => setNewQuickTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddQuickTask();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#f2ecdf]/70 dark:bg-[#11100d]/70 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs sm:text-sm focus:outline-none focus:border-[#ff5a1f]"
                    />
                    <button
                      type="button"
                      onClick={handleAddQuickTask}
                      className="px-3.5 py-2 rounded-xl bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      + Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('edit');
                        setTimeout(() => textareaRef.current?.focus(), 50);
                      }}
                      className="px-3 py-2 rounded-xl border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-medium hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      title="Edit markdown text directly"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit Markdown</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Textarea Writing Surface */
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={notes}
              readOnly={readOnly}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={() => {
                if (readOnly) handleGuardAction();
              }}
              placeholder={
                readOnly
                  ? 'Sign in to write and edit your monthly reflections...'
                  : `Jot down this month's breakthroughs, systems, reflections, or lessons learned...

e.g.
• What habits felt effortless?
• Where did friction occur, and what small tweak removes it?
• Which non-negotiable ritual generated the highest energy?`
              }
              className={`w-full min-h-[300px] sm:min-h-[360px] p-5 text-sm sm:text-[14.5px] leading-[1.7] font-archivo border rounded-2xl resize-y transition-all ${
                readOnly
                  ? 'bg-[#f2ecdf]/30 dark:bg-[#11100d]/40 border-[#15130f]/8 dark:border-[#fbf8f1]/8 text-[#15130f]/70 dark:text-[#fbf8f1]/70 cursor-pointer hover:border-[#ff5a1f]/40 focus:outline-none'
                  : 'bg-[#f2ecdf]/50 dark:bg-[#11100d]/70 border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f] dark:text-[#fbf8f1] focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] placeholder:text-[#15130f]/35 dark:placeholder:text-[#fbf8f1]/35'
              }`}
            />
          </div>
        )}
      </div>

      {/* Footer Info & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-archivo">
        <div className="flex items-center gap-4">
          <span className="font-mono">
            <strong>{wordCount}</strong> {wordCount === 1 ? 'word' : 'words'} • <strong>{charCount}</strong> characters
          </span>
          <span className="hidden sm:inline-block opacity-40">•</span>
          <span className="hidden sm:inline-block text-[#15130f]/50 dark:text-[#fbf8f1]/50">
            {readOnly ? 'Read-only preview' : 'Auto-saves continuously'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (readOnly) {
                handleGuardAction();
                return;
              }
              handleLoadTemplate();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
            title={readOnly ? 'Sign in to load template' : 'Load starter reflection template'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Load Template</span>
          </button>

          {notes && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500/70 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Clear journal content"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Mode Callout (if not signed in) */}
      {(!userEmail || readOnly) && onRequireAuth && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#ff5a1f]/8 border border-[#ff5a1f]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ff5a1f]/15 text-[#ff5a1f] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs text-[#15130f]/80 dark:text-[#fbf8f1]/80 leading-relaxed font-archivo">
              <strong>Guest Mode:</strong> Journal modification is locked. Sign in or create a free account to write, format, and securely sync your reflections across all devices.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequireAuth}
            className="px-4 py-2 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer shadow-sm"
          >
            Sign in to unlock
          </button>
        </div>
      )}
    </div>
  );
}