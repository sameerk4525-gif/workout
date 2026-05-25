import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    const workoutId = params.id;

    // Check if workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_workoutId: {
          userId,
          workoutId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_workoutId: {
            userId,
            workoutId,
          },
        },
      });
      isLiked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          workoutId,
        },
      });
      isLiked = true;

      // Add a notification for the recipient if liking someone else's workout
      if (workout.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: workout.userId,
            type: 'LIKE',
            payload: JSON.stringify({
              likerId: userId,
              workoutId,
              workoutTitle: workout.title,
            }),
          },
        });
      }
    }

    // Recalculate like count
    const likeCount = await prisma.like.count({
      where: { workoutId },
    });

    return NextResponse.json({
      message: isLiked ? 'Liked workout' : 'Unliked workout',
      isLiked,
      likeCount,
    });
  } catch (error: any) {
    console.error('API /api/workouts/[id]/like error:', error.message);
    return NextResponse.json({ error: 'Failed to process like', message: error.message }, { status: 500 });
  }
}
