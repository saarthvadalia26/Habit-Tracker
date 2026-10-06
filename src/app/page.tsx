import { getHabitsWithLogsAction } from '@/app/actions/habits';
import { getCurrentUserAction } from '@/app/actions/auth';
import { getActiveChallengeAction, getPastChallengesAction } from '@/app/actions/challenges';
import { getSampleHabits } from '@/lib/mockData';
import { HabitDashboard } from '@/components/HabitDashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { user } = await getCurrentUserAction();
  const habitsRes = await getHabitsWithLogsAction();
  const challengeRes = await getActiveChallengeAction();
  const pastChallengesRes = await getPastChallengesAction();

  // If user is authenticated, load their PostgreSQL habits
  // If guest, use local demo habits
  const isGuestMode = !user;
  const initialHabits = user ? (habitsRes.data ?? []) : getSampleHabits();
  const initialCustomName = user?.customName || '';
  const initialChallenge = isGuestMode ? null : (challengeRes?.data ?? null);
  const initialPastChallenges = isGuestMode ? [] : (pastChallengesRes?.data ?? []);

  return (
    <div className="min-h-screen w-full bg-[#f2ecdf] dark:bg-[#11100d] text-[#15130f] dark:text-[#fbf8f1] transition-colors duration-300">
      <HabitDashboard
        initialHabits={initialHabits}
        isGuestMode={isGuestMode}
        userEmail={user?.email}
        initialCustomName={initialCustomName}
        initialChallenge={initialChallenge}
        initialPastChallenges={initialPastChallenges}
        initialMonthlyNotes={user?.monthlyNotes || {}}
        userId={user?.id}
        userFirstName={user?.firstName}
        userLastName={user?.lastName}
      />
    </div>
  );
}
