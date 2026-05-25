import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import SocialFeedClient from '@/components/workout/SocialFeedClient';

export const revalidate = 0; // Fresh social stream on every load

export default async function SocialFeedPage() {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId } = session;

  // We can load the initial feed page directly server-side or let the client query the api.
  // Querying the api client-side is extremely responsive and maintains SWR caches,
  // but let's pre-load some seed feed data so it renders immediately with zero latency!
  const workouts = await prisma.workout.findMany({
    orderBy: { completedAt: 'desc' },
    take: 10,
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

  const initialFeed = workouts.map((w) => {
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

  return (
    <SocialFeedClient
      initialFeed={initialFeed}
      currentUserId={userId}
    />
  );
}
