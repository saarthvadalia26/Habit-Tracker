'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, ShieldCheck, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { signInAction, signUpAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import { setPendingAuthToast } from '@/lib/auth-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'signin',
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live preview for dashboard header title (capped to 15 chars so it never overflows)
  const previewTitle = (() => {
    const chosen = (nickname.trim() || firstName.trim()).slice(0, 15);
    if (!chosen) return 'HABIT TRACKER';
    const upper = chosen.toUpperCase();
    if (upper.endsWith("'S") || upper.endsWith('’S')) {
      return `${upper} TRACKER`;
    }
    if (upper.endsWith('S')) {
      return `${upper}' TRACKER`;
    }
    return `${upper}'S TRACKER`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signInAction(email, password);
        if (res.error) {
          setError(res.error);
          toast.error(res.error);
        } else {
          setPendingAuthToast({
            type: 'success',
            message: `Welcome back, ${email}!`,
            description: 'Your private workspace is loaded.',
          });
          onClose();
          window.location.reload();
        }
      } else {
        const res = await signUpAction(email, password, {
          firstName,
          lastName,
          nickname,
        });
        if (res.error) {
          setError(res.error);
          toast.error(res.error);
        } else {
          const welcomeName = firstName.trim() || nickname.trim();
          setPendingAuthToast({
            type: 'success',
            message: welcomeName ? `Welcome, ${welcomeName}!` : 'Account created!',
            description: 'Your private workspace is ready.',
          });
          onClose();
          window.location.reload();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 28,
            }}
            className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-slate-900 smooth-scroll dark:text-slate-100 transition-colors"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-indigo-500/20 dark:bg-indigo-600/25 pointer-events-none blur-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs dark:shadow-inner">
                  {mode === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {mode === 'signin'
                      ? 'Access your private habit tracker'
                      : 'Get your own isolated habit workspace'}
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="p-3.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-xl leading-relaxed space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Profile Details for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80">
                  {/* First Name & Last Name (Side by Side) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                        First Name <span className="text-slate-400 lowercase font-normal">(opt)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                        Last Name <span className="text-slate-400 lowercase font-normal">(opt)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Nickname / Custom Tracker Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                        Tracker Title / Nickname <span className="text-slate-400 lowercase font-normal">(opt)</span>
                      </label>
                      <span className="text-[9px] text-slate-400 font-mono">Max 15 chars</span>
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder={firstName.trim() ? `Defaults to "${firstName.trim()}"` : 'Nickname or custom title'}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />

                    {/* Live Tracker Title Preview Badge */}
                    <div className="mt-2 px-2.5 py-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
                        Board Title:
                      </span>
                      <span className="font-mono font-black text-indigo-900 dark:text-indigo-100 text-[11px] tracking-tight">
                        {previewTitle}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Multi-tenant security guarantee badge */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-900 dark:text-slate-200">100% Private Workspace:</strong> Your habits, streaks, and daily progress are strictly isolated and confidential to your account.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer transition-all"
              >
                <span>{isSubmitting ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-5 text-center pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-2 ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
