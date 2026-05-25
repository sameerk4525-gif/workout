import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import AnalyticsClient from '@/components/workout/AnalyticsClient';

export const revalidate = 0; // Live analytics reports

export default async function AnalyticsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // 1. Fetch user's workout sessions
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { completedAt: 'asc' },
    include: {
      sessions: {
        include: {
          sets: {
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  // 2. Fetch list of exercises logged by the user to populate the selection dropdown
  const userExercises = await prisma.exercise.findMany({
    where: {
      sets: {
        some: {
          session: {
            userId,
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const parsedExercises = userExercises.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  // Parse workout records into a flat set history array for client-side aggregation
  const parsedSets = workouts.flatMap((w) => {
    const session = w.sessions[0];
    if (!session) return [];
    
    return session.sets.map((s) => ({
      exerciseId: s.exerciseId,
      exerciseName: s.exercise.name,
      muscleGroup: s.exercise.muscleGroup,
      weight: s.weight,
      reps: s.reps,
      completed: s.completed,
      date: w.completedAt,
    }));
  });

  const parsedWorkouts = workouts.map((w) => ({
    id: w.id,
    title: w.title,
    volume: w.volume,
    duration: w.duration,
    completedAt: w.completedAt,
  }));

  return (
    <AnalyticsClient
      workouts={parsedWorkouts}
      setHistory={parsedSets}
      exerciseDropdown={parsedExercises}
    />
  );
}
