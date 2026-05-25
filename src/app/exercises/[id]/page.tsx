import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import ExerciseDetailClient from '@/components/workout/ExerciseDetailClient';

interface ExerciseDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // 1. Fetch exercise
  const exercise = await prisma.exercise.findUnique({
    where: { id: params.id },
  });

  if (!exercise) {
    notFound();
  }

  // 2. Fetch user's PR logs for this exercise
  const prs = await prisma.pRRecord.findMany({
    where: {
      userId,
      exerciseId: params.id,
    },
    orderBy: {
      achievedAt: 'asc',
    },
  });

  // 3. Fetch past sets logged by this user for this exercise
  const sets = await prisma.set.findMany({
    where: {
      exerciseId: params.id,
      session: {
        userId,
      },
    },
    include: {
      session: {
        include: {
          workout: true,
        },
      },
    },
    orderBy: {
      session: {
        startedAt: 'desc',
      },
    },
    take: 20, // Load last 20 sets
  });

  // Safe JSON array parsing for SQLite compatibility
  const parsedExercise = {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    primaryMuscles: JSON.parse(exercise.primaryMuscles) as string[],
    secondaryMuscles: JSON.parse(exercise.secondaryMuscles) as string[],
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    instructions: JSON.parse(exercise.instructions) as string[],
    tips: exercise.tips,
  };

  // Group historical sets by workout session date for a clean list display
  const sessionGroups: Record<string, { workoutTitle: string; date: Date; sets: typeof sets }> = {};
  
  for (const s of sets) {
    const sessionId = s.sessionId;
    const dateStr = s.session.startedAt.toISOString().split('T')[0];
    const key = `${sessionId}_${dateStr}`;
    
    if (!sessionGroups[key]) {
      sessionGroups[key] = {
        workoutTitle: s.session.workout?.title || 'Active Workout Session',
        date: s.session.startedAt,
        sets: [],
      };
    }
    sessionGroups[key].sets.push(s);
  }

  // Sort sets within each group by setNumber
  const historicalSessions = Object.values(sessionGroups).map(g => {
    g.sets.sort((a, b) => a.setNumber - b.setNumber);
    return g;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <ExerciseDetailClient
      exercise={parsedExercise}
      prRecords={prs.map((p) => ({
        id: p.id,
        value: p.value,
        type: p.type,
        achievedAt: p.achievedAt,
      }))}
      history={historicalSessions}
    />
  );
}
