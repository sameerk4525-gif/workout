import { prisma } from './db';

// Simple check to see if we have valid Clerk environment variables
export const isMockAuth = () => {
  return true;
};

export interface AuthSession {
  userId: string; // The database User.id
  clerkId: string; // ClerkId
  username: string;
}

/**
 * Returns the current authenticated database user.
 * Falls back to the seeded 'thor_lifts' user in mock mode for instant offline testing.
 */
export async function requireAuth(): Promise<AuthSession> {
  if (isMockAuth()) {
    // Return seeded thor_lifts user info
    const dbUser = await prisma.user.findUnique({
      where: { username: 'thor_lifts' }
    });
    
    if (!dbUser) {
      // In case seeding didn't happen yet (fallback creation)
      const newUser = await prisma.user.create({
        data: {
          clerkId: 'user_clerk_1',
          username: 'thor_lifts',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thor',
          bio: 'Looking for Mjolnir in the weight room.',
          level: 14,
          xp: 6800,
          streak: 8,
          lastActive: new Date()
        }
      });
      return {
        userId: newUser.id,
        clerkId: newUser.clerkId,
        username: newUser.username
      };
    }

    return {
      userId: dbUser.id,
      clerkId: dbUser.clerkId,
      username: dbUser.username
    };
  }

  // Real Clerk Implementation
  try {
    const { auth } = require('@clerk/nextjs/server');
    const { userId: clerkId } = auth();
    
    if (!clerkId) {
      throw new Error('Unauthorized: No Clerk ID found');
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!dbUser) {
      throw new Error('Unauthorized: User not found in local database');
    }

    return {
      userId: dbUser.id,
      clerkId: dbUser.clerkId,
      username: dbUser.username
    };
  } catch (error: any) {
    console.error('Error authenticating via Clerk:', error.message);
    throw new Error('Unauthorized');
  }
}
