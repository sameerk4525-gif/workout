import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { userId } = session;

    // Fetch routine to verify owner
    const routine = await prisma.routine.findUnique({
      where: { id: params.id },
    });

    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    if (routine.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this routine' }, { status: 403 });
    }

    // Delete routine (associated exercises will cascade delete automatically)
    await prisma.routine.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Routine deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API /api/routines/[id] delete error:', error.message);
    return NextResponse.json({ error: 'Failed to delete routine', message: error.message }, { status: 500 });
  }
}
