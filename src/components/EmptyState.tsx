'use client';

import React from 'react';
import { PlusCircle, Target, Calendar } from 'lucide-react';

interface EmptyStateProps {
  type: 'habits' | 'challenges' | 'calendar';
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * Empty state component with helpful guidance for new users
 */
export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const config = {
    habits: {
      icon: PlusCircle,
      title: 'No habits yet',
      description: 'Start building unstoppable momentum by creating your first daily habit.',
      action: actionLabel || 'Create Your First Habit',
      illustration: (
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl" />
          <div className="relative w-full h-full flex items-center justify-center">
            <PlusCircle className="w-16 h-16 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
          </div>
        </div>
      ),
    },
    challenges: {
      icon: Target,
      title: 'No active challenge',
      description: 'Push yourself with 75 Hard, 90-Day Monk Mode, or create a custom challenge.',
      action: actionLabel || 'Start a Challenge',
      illustration: (
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl" />
          <div className="relative w-full h-full flex items-center justify-center">
            <Target className="w-16 h-16 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
          </div>
        </div>
      ),
    },
    calendar: {
      icon: Calendar,
      title: 'No habit data',
      description: 'Start checking off habits to see your consistency trends and streaks here.',
      action: actionLabel || 'Go to Today',
      illustration: (
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl" />
          <div className="relative w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
          </div>
        </div>
      ),
    },
  };

  const current = config[type];

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="max-w-md w-full text-center">
        {current.illustration}

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {current.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {current.description}
        </p>

        {onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            <current.icon className="w-5 h-5" />
            {current.action}
          </button>
        )}

        {/* Tips */}
        {type === 'habits' && (
          <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">
              💡 Pro Tip
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">
              Start small! Pick 2-3 habits you can realistically do every day.
              Consistency beats intensity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for habit list
 */
export function HabitListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
        >
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for calendar grid
 */
export function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded" />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading spinner component
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Inline loading state for buttons
 */
export function ButtonLoadingState({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {children}
    </span>
  );
}
