'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, ShieldCheck, UserPlus, LogIn, AlertCircle, User } from 'lucide-react';
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

  // Live preview for dashboard header title
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
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="relative w-full max-w-[390px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/12 dark:border-[#fbf8f1]/12 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#15130f] dark:text-[#fbf8f1] font-archivo max-h-[min(90vh,680px)] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#ff5a1f]">
                {mode === 'signin' ? 'Welcome Back' : 'Create Free Account'}
              </span>
              <h3 className="font-clash font-semibold text-xl sm:text-[22px] tracking-tight leading-tight">
                {mode === 'signin' ? 'Sign in to Habit Tracker' : 'Start your journey'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Pill */}
          <div className="p-1 rounded-full bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex items-center">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                  : 'text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                  : 'text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Custom Board Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FOCUS, PRIME"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                  />
                  <p className="text-[10px] text-[#15130f]/45 dark:text-[#fbf8f1]/45">
                    Will display as: <span className="font-semibold text-[#ff5a1f]">{previewTitle}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#15130f]/40 dark:text-[#fbf8f1]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#15130f]/40 dark:text-[#fbf8f1]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full py-2.5 sm:py-3 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Please wait...</span>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 pt-1.5 border-t border-[#15130f]/8 dark:border-[#fbf8f1]/8">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff5a1f]" />
            <span>Encrypted & synchronized across all your devices.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
