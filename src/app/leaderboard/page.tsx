import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import LeaderboardClient from '@/components/workout/LeaderboardClient';

export const revalidate = 0; // Fresh rankings on every visit

export default async function LeaderboardPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // Fetch initial standings sorted by XP
  const dbUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 20,
  });

  const allUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
  });
  
  const userRank = allUsers.findIndex((u) => u.id === userId) + 1;
  const currentUser = allUsers.find((u) => u.id === userId);

  const initialResults = dbUsers.map((u, index) => ({
    id: u.id,
    rank: index + 1,
    username: u.username,
    avatar: u.avatar,
    level: u.level,
    metricValue: `${u.xp.toLocaleString()} XP`,
  }));

  return (
    <LeaderboardClient
      initialStandings={initialResults}
      currentUser={{
        id: userId,
        rank: userRank,
        username: currentUser?.username || 'me',
        avatar: currentUser?.avatar || '',
        level: currentUser?.level || 1,
        xp: currentUser?.xp || 0,
      }}
    />
  );
}
