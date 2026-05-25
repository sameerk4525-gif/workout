import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import DashboardClient from '@/components/workout/DashboardClient';

export const revalidate = 0; // Disable server cache for real-time updates

export default async function DashboardPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // 1. Fetch current database user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect('/sign-in');
  }

  // 2. Fetch total workouts count
  const totalWorkouts = await prisma.workout.count({
    where: { userId },
  });

  // 3. Fetch this week's workouts
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = await prisma.workout.count({
    where: {
      userId,
      completedAt: {
        gte: startOfWeek,
      },
    },
  });

  // 4. Fetch total volume lifted (sum of all workouts)
  const volumeAggregate = await prisma.workout.aggregate({
    where: { userId },
    _sum: {
      volume: true,
    },
  });
  const totalVolume = volumeAggregate._sum.volume || 0;

  // 5. Fetch last 5 workouts
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });

  // 6. Fetch latest 5 PR records with exercise details
  const rawPrs = await prisma.pRRecord.findMany({
    where: { userId },
    orderBy: { achievedAt: 'desc' },
    take: 5,
    include: {
      exercise: true,
    },
  });

  const prs = rawPrs.map((p) => ({
    id: p.id,
    exerciseName: p.exercise.name,
    value: p.value,
    type: p.type,
    achievedAt: p.achievedAt,
  }));

  // 7. Leaderboard Snapshot (Fetch top 3 users by level/XP)
  const topUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 3,
  });

  // Calculate current user's rank
  const allUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
  });
  const userRank = allUsers.findIndex((u) => u.id === userId) + 1;

  return (
    <DashboardClient
      user={{
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
      }}
      stats={{
        totalWorkouts,
        thisWeekWorkouts,
        totalVolume,
      }}
      recentWorkouts={recentWorkouts}
      latestPRs={prs}
      leaderboard={{
        rank: userRank,
        topThree: topUsers.map((tu) => ({
          username: tu.username,
          avatar: tu.avatar,
          level: tu.level,
          xp: tu.xp,
        })),
      }}
    />
  );
}
