import { getHabitsWithLogsAction } from '@/app/actions/habits';
import { getCurrentUserAction } from '@/app/actions/auth';
import { getActiveChallengeAction } from '@/app/actions/challenges';
import { getSampleHabits } from '@/lib/mockData';
import { SmartTrackerDashboard } from '@/components/SmartTrackerDashboard';
import { AmbientBackground } from '@/components/AmbientBackground';
import { HeaderNav } from '@/components/HeaderNav';
import { Layers } from 'lucide-react';

export default async function HomePage() {
  const { user } = await getCurrentUserAction();
  const habitsRes = await getHabitsWithLogsAction();
  const challengeRes = await getActiveChallengeAction();

  // If user is authenticated, load their personal PostgreSQL habits
  // If user has zero habits yet, start with empty list or let them create
  // If guest, use local demo habits
  const isGuestMode = !user;
  // Authenticated users only see their own habits (empty list for new accounts)
  const initialHabits = user ? (habitsRes.data ?? []) : getSampleHabits();
  const initialCustomName = user?.customName || '';
  const initialChallenge = challengeRes?.data ?? null;

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <AmbientBackground />

      {/* Floating Dark Navigation Header with Individual Account Controls */}
      <HeaderNav
        userEmail={user?.email}
        isGuestMode={isGuestMode}
      />

      {/* Main Interactive Smart Habit Tracker */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <SmartTrackerDashboard
          initialHabits={initialHabits}
          isGuestMode={isGuestMode}
          userEmail={user?.email}
          initialCustomName={initialCustomName}
          initialChallenge={initialChallenge}
        />
      </main>

      {/* Minimalist Dark Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Designed for daily discipline, focus, and personal performance.</span>
        </div>
      </footer>
    </div>
  );
}
