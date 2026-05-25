import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const createRoutineSchema = z.object({
  name: z.string().min(1, 'Routine name is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      sets: z.number().int().min(1),
      reps: z.number().int().min(0),
      weight: z.number().min(0),
    })
  ).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    const body = await req.json();

    // 1. Handle Duplication Request
    if (body.duplicateId) {
      const targetRoutine = await prisma.routine.findUnique({
        where: { id: body.duplicateId },
        include: {
          exercises: true,
        },
      });

      if (!targetRoutine) {
        return NextResponse.json({ error: 'Routine template not found' }, { status: 404 });
      }

      // Create duplicated copy record
      const copyRoutine = await prisma.routine.create({
        data: {
          userId,
          name: `${targetRoutine.name} (Copy)`,
          description: targetRoutine.description,
          isPublic: false,
        },
      });

      // Copy exercises
      for (const re of targetRoutine.exercises) {
        await prisma.routineExercise.create({
          data: {
            routineId: copyRoutine.id,
            exerciseId: re.exerciseId,
            order: re.order,
            sets: re.sets,
            reps: re.reps,
            weight: re.weight,
          },
        });
      }

      return NextResponse.json({ message: 'Routine duplicated successfully', routine: copyRoutine }, { status: 201 });
    }

    // 2. Handle standard Create Routine Request
    const parsed = createRoutineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
    }

    const { name, description, isPublic, exercises = [] } = parsed.data;

    const newRoutine = await prisma.routine.create({
      data: {
        userId,
        name,
        description,
        isPublic,
      },
    });

    // Save associated exercises
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await prisma.routineExercise.create({
        data: {
          routineId: newRoutine.id,
          exerciseId: ex.exerciseId,
          order: i,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        },
      });
    }

    return NextResponse.json({ message: 'Routine created successfully', routine: newRoutine }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/routines error:', error.message);
    return NextResponse.json({ error: 'Failed to process routine request', message: error.message }, { status: 500 });
  }
}
