import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import WorkoutsOverviewClient from '@/components/workout/WorkoutsOverviewClient';

export const revalidate = 0; // Live session tracking on workouts feed

export default async function WorkoutsPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // 1. Fetch exercise catalog (to add exercises to active workouts)
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' },
  });

  const parsedExercises = exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroup,
  }));

  // 2. Fetch routines
  const routines = await prisma.routine.findMany({
    where: {
      OR: [
        { userId },
        { isPublic: true },
      ],
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  const parsedRoutines = routines.map((r) => ({
    id: r.id,
    name: r.name,
    isPublic: r.isPublic,
    exercises: r.exercises.map((re) => ({
      exerciseId: re.exerciseId,
      name: re.exercise.name,
      muscleGroup: re.exercise.muscleGroup,
      sets: re.sets,
      reps: re.reps,
      weight: re.weight,
    })),
  }));

  // 3. Fetch training history logs
  const workoutsHistory = await prisma.workout.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
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

  const parsedHistory = workoutsHistory.map((w) => ({
    id: w.id,
    title: w.title,
    notes: w.notes,
    duration: w.duration,
    volume: w.volume,
    completedAt: w.completedAt,
    exercises: w.sessions[0]?.sets.reduce((acc, curr) => {
      // Group sets by exercise name
      const exName = curr.exercise.name;
      const existing = acc.find((item: any) => item.name === exName);
      const setDetail = {
        setNumber: curr.setNumber,
        weight: curr.weight,
        reps: curr.reps,
        completed: curr.completed,
      };

      if (existing) {
        existing.sets.push(setDetail);
      } else {
        acc.push({
          name: exName,
          sets: [setDetail],
        });
      }
      return acc;
    }, [] as any[]) || [],
  }));

  return (
    <WorkoutsOverviewClient
      exerciseBank={parsedExercises}
      routines={parsedRoutines}
      history={parsedHistory}
    />
  );
}
