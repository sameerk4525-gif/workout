import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requireAuth();
    const { userId: followerId } = session;

    const followingId = params.userId;

    if (followerId === followingId) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      isFollowing = true;

      // Create a notification for the recipient
      await prisma.notification.create({
        data: {
          userId: followingId,
          type: 'FOLLOW',
          payload: JSON.stringify({
            followerId,
          }),
        },
      });
    }

    // Recalculate followers count
    const followersCount = await prisma.follow.count({
      where: { followingId },
    });

    return NextResponse.json({
      message: isFollowing ? 'Followed user' : 'Unfollowed user',
      isFollowing,
      followersCount,
    });
  } catch (error: any) {
    console.error('API /api/follow/[userId] error:', error.message);
    return NextResponse.json({ error: 'Failed to process follow', message: error.message }, { status: 500 });
  }
}
