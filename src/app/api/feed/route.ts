import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetch recent workouts globally to simulate an active community feed
    const workouts = await prisma.workout.findMany({
      orderBy: { completedAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
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

    const parsedFeed = workouts.map((w) => {
      const hasLiked = w.likes.some((l) => l.userId === userId);
      const session = w.sessions[0];
      
      const exercises = session?.sets.reduce((acc, curr) => {
        const exName = curr.exercise.name;
        const existing = acc.find((item: any) => item.name === exName);
        const setDetail = {
          setNumber: curr.setNumber,
          weight: curr.weight,
          reps: curr.reps,
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
      }, [] as any[]) || [];

      return {
        id: w.id,
        title: w.title,
        notes: w.notes,
        duration: w.duration,
        volume: w.volume,
        completedAt: w.completedAt,
        user: {
          id: w.user.id,
          username: w.user.username,
          avatar: w.user.avatar,
          level: w.user.level,
        },
        likesCount: w.likes.length,
        hasLiked,
        comments: w.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          user: {
            username: c.user.username,
            avatar: c.user.avatar,
          },
        })),
        exercises,
      };
    });

    return NextResponse.json({
      page,
      limit,
      results: parsedFeed,
    });
  } catch (error: any) {
    console.error('API /api/feed error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch activity feed', message: error.message }, { status: 500 });
  }
}
