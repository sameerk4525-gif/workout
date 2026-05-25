import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import RoutinesClient from '@/components/workout/RoutinesClient';

export const revalidate = 0; // Fresh routines list on every visit

export default async function RoutinesPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // Fetch user routines + public templates
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Re-parse exercises structure cleanly for client components
  const parsedRoutines = routines.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isPublic: r.isPublic,
    isOwner: r.userId === userId,
    exercises: r.exercises.map((re) => ({
      id: re.id,
      exerciseId: re.exerciseId,
      name: re.exercise.name,
      muscleGroup: re.exercise.muscleGroup,
      sets: re.sets,
      reps: re.reps,
      weight: re.weight,
    })),
  }));

  return <RoutinesClient routines={parsedRoutines} />;
}
