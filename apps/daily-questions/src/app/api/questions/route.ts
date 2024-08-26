import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const { title } = await req.json();
  const session = await auth();
  const user = session?.user;

  await prisma.question.create({
    data: { title, type: 'INTEGER', status: 'ACTIVE', userId: user?.id || '1' },
  });

  return NextResponse.json({ message: 'Created question' }, { status: 200 });
}
