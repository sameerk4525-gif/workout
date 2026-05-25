import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import UserProfileClient from '@/components/workout/UserProfileClient';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export const revalidate = 0; // Live profile stats tracking

export default async function ProfilePage({ params }: ProfilePageProps) {
  let session;
  try {
    session = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  const { userId: currentUserId } = session;

  // 1. Fetch user by username
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      achievements: true,
      workouts: {
        orderBy: { completedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    notFound();
  }

  // 2. Fetch follower counts and following counts
  const followersCount = await prisma.follow.count({
    where: { followingId: user.id },
  });

  const followingCount = await prisma.follow.count({
    where: { followerId: user.id },
  });

  // 3. Check if current user is following this profile
  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: user.id,
      },
    },
  }) !== null;

  // 4. Calculate total volume
  const volumeAggregate = await prisma.workout.aggregate({
    where: { userId: user.id },
    _sum: {
      volume: true,
    },
  });

  const totalVolume = volumeAggregate._sum.volume || 0;

  // 5. Total workouts
  const totalWorkouts = await prisma.workout.count({
    where: { userId: user.id },
  });

  // Re-map profile properties for client view
  const parsedUser = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio || 'No profile bio provided.',
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    workoutsCount: totalWorkouts,
    volumeCount: totalVolume,
    followersCount,
    followingCount,
  };

  const parsedWorkouts = user.workouts.map((w) => ({
    id: w.id,
    title: w.title,
    notes: w.notes,
    duration: w.duration,
    volume: w.volume,
    completedAt: w.completedAt,
  }));

  return (
    <UserProfileClient
      user={parsedUser}
      workouts={parsedWorkouts}
      achievements={user.achievements.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        icon: a.icon,
        unlockedAt: a.unlockedAt,
      }))}
      isFollowing={isFollowing}
      isSelf={user.id === currentUserId}
    />
  );
}
