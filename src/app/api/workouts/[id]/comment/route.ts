import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    const workoutId = params.id;

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
    }

    const { content } = parsed.data;

    // Verify workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        workoutId,
        content,
      },
      include: {
        user: true,
      },
    });

    // Create in-app notification if commenting on someone else's workout
    if (workout.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: workout.userId,
          type: 'COMMENT',
          payload: JSON.stringify({
            commenterId: userId,
            commenterUsername: comment.user.username,
            workoutId,
            workoutTitle: workout.title,
            commentContent: content.substring(0, 30),
          }),
        },
      });
    }

    return NextResponse.json({
      message: 'Comment posted successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          username: comment.user.username,
          avatar: comment.user.avatar,
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/workouts/[id]/comment error:', error.message);
    return NextResponse.json({ error: 'Failed to post comment', message: error.message }, { status: 500 });
  }
}
