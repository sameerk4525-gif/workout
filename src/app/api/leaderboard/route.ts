import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    const { searchParams } = new URL(req.url);
    const metric = searchParams.get('metric') || 'xp'; // xp | volume | workouts | streak
    const period = searchParams.get('period') || 'all'; // all | weekly | monthly
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    let usersRanked: Array<{
      id: string;
      username: string;
      avatar: string;
      level: number;
      metricValue: string;
      valueNum: number;
    }> = [];

    // Filter by date period if requested
    const dateFilter: any = {};
    if (period === 'weekly') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      dateFilter.gte = startOfWeek;
    } else if (period === 'monthly') {
      const startOfMonth = new Date();
      startOfMonth.setDate(startOfMonth.getDate() - 30);
      dateFilter.gte = startOfMonth;
    }

    if (metric === 'xp') {
      const dbUsers = await prisma.user.findMany({
        orderBy: { xp: 'desc' },
        skip,
        take: limit,
      });

      usersRanked = dbUsers.map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        metricValue: `${u.xp.toLocaleString()} XP`,
        valueNum: u.xp,
      }));
    } else if (metric === 'streak') {
      const dbUsers = await prisma.user.findMany({
        orderBy: { streak: 'desc' },
        skip,
        take: limit,
      });

      usersRanked = dbUsers.map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        metricValue: `${u.streak} Days`,
        valueNum: u.streak,
      }));
    } else if (metric === 'workouts') {
      // Aggregate workouts count per user
      const users = await prisma.user.findMany({
        include: {
          workouts: {
            where: Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : undefined,
          },
        },
      });

      const list = users.map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.level,
        valueNum: u.workouts.length,
        metricValue: `${u.workouts.length} Lifts`,
      }));

      list.sort((a, b) => b.valueNum - a.valueNum);
      usersRanked = list.slice(skip, skip + limit);
    } else if (metric === 'volume') {
      // Aggregate volume sum per user
      const users = await prisma.user.findMany({
        include: {
          workouts: {
            where: Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : undefined,
          },
        },
      });

      const list = users.map((u) => {
        const sum = u.workouts.reduce((acc, curr) => acc + curr.volume, 0);
        return {
          id: u.id,
          username: u.username,
          avatar: u.avatar,
          level: u.level,
          valueNum: sum,
          metricValue: `${Math.round(sum).toLocaleString()} kg`,
        };
      });

      list.sort((a, b) => b.valueNum - a.valueNum);
      usersRanked = list.slice(skip, skip + limit);
    }

    return NextResponse.json({
      page,
      limit,
      results: usersRanked,
      currentUserId: userId,
    });
  } catch (error: any) {
    console.error('API /api/leaderboard error:', error.message);
    return NextResponse.json({ error: 'Failed to compile leaderboard', message: error.message }, { status: 500 });
  }
}
