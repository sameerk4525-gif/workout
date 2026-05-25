import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { data, type } = payload;

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Handle user.created event
    if (type === 'user.created') {
      const email = data.email_addresses?.[0]?.email_address || '';
      const username = data.username || data.first_name || `user_${data.id.substring(0, 6)}`;
      const avatar = data.image_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;

      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          username,
          avatar,
        },
        create: {
          clerkId: data.id,
          username,
          avatar,
          bio: 'Welcome to IronQuest!',
          level: 1,
          xp: 0,
          streak: 0,
        },
      });

      console.log(`Clerk Sync: Created user @${username}`);
      return NextResponse.json({ message: 'User synced successfully' }, { status: 201 });
    }

    // Handle user.updated event
    if (type === 'user.updated') {
      const username = data.username || data.first_name || `user_${data.id.substring(0, 6)}`;
      const avatar = data.image_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;

      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          username,
          avatar,
        },
      });

      console.log(`Clerk Sync: Updated user @${username}`);
      return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    }

    // Handle user.deleted event
    if (type === 'user.deleted') {
      await prisma.user.delete({
        where: { clerkId: data.id },
      });

      console.log(`Clerk Sync: Deleted user ${data.id}`);
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook sync error:', error.message);
    return NextResponse.json({ error: 'Webhook processing failed', message: error.message }, { status: 500 });
  }
}
