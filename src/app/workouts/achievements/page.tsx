import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import AchievementsClient from '@/components/workout/AchievementsClient';

export const revalidate = 0; // Live achievements stats

export default async function AchievementsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // Fetch user's unlocked achievements
  const unlocked = await prisma.achievement.findMany({
    where: { userId },
  });

  return (
    <AchievementsClient
      unlockedAchievements={unlocked.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        icon: a.icon,
        unlockedAt: a.unlockedAt,
      }))}
    />
  );
}
