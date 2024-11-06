import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { scheduleUserNotification } from '@/lib/queue';

let isInitialized = false;

export async function GET() {
  if (!isInitialized) {
    try {
      // Get all users with notification preferences
      const users = await prisma.user.findMany({
        where: {
          NOT: { notificationTime: null },
        },
      });

      // Schedule notifications for each user
      for (const user of users) {
        if (user.notificationTime) {
          await scheduleUserNotification(user.id, user.notificationTime);
        }
      }

      isInitialized = true;
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error initializing queue:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to initialize queue' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true, message: 'Already initialized' });
}
