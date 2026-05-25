import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const finishWorkoutSchema = z.object({
  title: z.string().min(1),
  routineId: z.string().uuid().nullable().optional(),
  duration: z.number().int().min(0),
  volume: z.number().min(0),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      sets: z.array(
        z.object({
          weight: z.number().min(0),
          reps: z.number().int().min(0),
          completed: z.boolean(),
        })
      ),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    const body = await req.json();
    const parsed = finishWorkoutSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
    }

    const { title, routineId = null, duration, volume, exercises } = parsed.data;

    // Run inside a database transaction to keep everything synchronized
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Workout Record
      const workout = await tx.workout.create({
        data: {
          userId,
          title,
          notes: 'Completed session.',
          duration,
          volume,
        },
      });

      // 2. Create WorkoutSession Record
      const workoutSession = await tx.workoutSession.create({
        data: {
          userId,
          workoutId: workout.id,
          startedAt: new Date(Date.now() - duration * 1000),
          endedAt: new Date(),
          totalVolume: volume,
        },
      });

      // 3. Create Sets
      for (const ex of exercises) {
        for (let i = 0; i < ex.sets.length; i++) {
          const s = ex.sets[i];
          await tx.set.create({
            data: {
              sessionId: workoutSession.id,
              exerciseId: ex.exerciseId,
              setNumber: i + 1,
              weight: s.weight,
              reps: s.reps,
              completed: s.completed,
            },
          });
        }
      }

      // 4. Award XP (100 XP for Workout Completion)
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const addedXp = 100;
      const nextXp = user.xp + addedXp;
      
      // Calculate training level: Every 500 XP increases level by 1
      const nextLevel = Math.floor(nextXp / 500) + 1;
      const nextStreak = user.streak + 1; // Increment active streak

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: nextXp,
          level: nextLevel,
          streak: nextStreak,
          lastActive: new Date(),
        },
      });

      // 5. Automatic achievements checklist evaluation
      const unlockedAchievements = [];

      // Check "First Rep"
      const hasFirstRep = await tx.achievement.findUnique({
        where: { userId_type: { userId, type: 'FIRST_REP' } },
      });
      if (!hasFirstRep) {
        const ach = await tx.achievement.create({
          data: {
            userId,
            type: 'FIRST_REP',
            title: 'First Rep',
            description: 'Log your first workout.',
            icon: '🏋️',
          },
        });
        unlockedAchievements.push(ach);
      }

      // Check "Iron Will" (7-day streak)
      if (nextStreak >= 7) {
        const hasIronWill = await tx.achievement.findUnique({
          where: { userId_type: { userId, type: 'IRON_WILL' } },
        });
        if (!hasIronWill) {
          const ach = await tx.achievement.create({
            data: {
              userId,
              type: 'IRON_WILL',
              title: 'Iron Will',
              description: 'Maintain a 7-day training streak.',
              icon: '🔥',
            },
          });
          unlockedAchievements.push(ach);
        }
      }

      return {
        workout,
        xpEarned: addedXp,
        levelUp: nextLevel > user.level,
        currentLevel: nextLevel,
        currentStreak: nextStreak,
        unlockedAchievements,
      };
    });

    return NextResponse.json({
      message: 'Workout saved successfully',
      data: result,
    }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/workouts/finish error:', error.message);
    return NextResponse.json({ error: 'Failed to record workout session', message: error.message }, { status: 500 });
  }
}
