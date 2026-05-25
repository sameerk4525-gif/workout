import React from 'react';
import { prisma } from '@/lib/db';
import ExercisesClient from '@/components/workout/ExercisesClient';

export const revalidate = 3600; // Cache catalog list for up to 1 hour since standard library is static

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Re-parse SQLite JSON string arrays safely for client consumption
  const parsedExercises = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    primaryMuscles: JSON.parse(ex.primaryMuscles) as string[],
    secondaryMuscles: JSON.parse(ex.secondaryMuscles) as string[],
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    tips: ex.tips,
  }));

  return <ExercisesClient exercises={parsedExercises} />;
}
