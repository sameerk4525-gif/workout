import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import PRRecordsClient from '@/components/workout/PRRecordsClient';

export const revalidate = 0; // Live personal records timeline

export default async function PRRecordsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // 1. Fetch user's PRRecords with related exercise details
  const prs = await prisma.pRRecord.findMany({
    where: { userId },
    include: {
      exercise: true,
    },
    orderBy: {
      achievedAt: 'desc',
    },
  });

  const parsedPrs = prs.map((p) => ({
    id: p.id,
    exerciseId: p.exerciseId,
    exerciseName: p.exercise.name,
    muscleGroup: p.exercise.muscleGroup,
    value: p.value,
    type: p.type,
    achievedAt: p.achievedAt,
  }));

  // 2. Fetch past sets to compile 1RM, volume, and max reps stats
  const allCompletedSets = await prisma.set.findMany({
    where: {
      completed: true,
      session: {
        userId,
      },
    },
    include: {
      exercise: true,
    },
  });

  // Calculate best set volume and most reps per exercise
  const exerciseStats: Record<string, { exerciseName: string; maxVolume: number; maxReps: number; max1RM: number }> = {};

  for (const s of allCompletedSets) {
    const exId = s.exerciseId;
    const vol = s.weight * s.reps;
    const epley1RM = s.weight * (1 + s.reps / 30);
    
    if (!exerciseStats[exId]) {
      exerciseStats[exId] = {
        exerciseName: s.exercise.name,
        maxVolume: 0,
        maxReps: 0,
        max1RM: 0,
      };
    }

    if (vol > exerciseStats[exId].maxVolume) exerciseStats[exId].maxVolume = vol;
    if (s.reps > exerciseStats[exId].maxReps) exerciseStats[exId].maxReps = s.reps;
    if (epley1RM > exerciseStats[exId].max1RM) exerciseStats[exId].max1RM = Math.round(epley1RM);
  }

  return (
    <PRRecordsClient
      prRecords={parsedPrs}
      calculatedStats={Object.values(exerciseStats)}
    />
  );
}
