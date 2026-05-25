import React from 'react';
import { prisma } from '@/lib/db';
import CreateRoutineClient from '@/components/workout/CreateRoutineClient';

export default async function CreateRoutinePage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Re-parse JSON array strings safely for client components
  const parsedExercises = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
  }));

  return <CreateRoutineClient exercises={parsedExercises} />;
}
