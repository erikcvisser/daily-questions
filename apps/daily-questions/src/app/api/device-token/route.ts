import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { scheduleUserNotification, removeExistingUserJobs } from '@/lib/queue';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { token, platform, timezone } = await req.json();

    if (!token || !platform) {
      return NextResponse.json(
        { error: 'token and platform are required' },
        { status: 400 }
      );
    }

    await prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId: session.user.id,
        platform,
        timezone: timezone || 'Europe/Amsterdam',
      },
      create: {
        token,
        platform,
        userId: session.user.id,
        timezone: timezone || 'Europe/Amsterdam',
      },
    });

    // Set default push notification time if not yet configured
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user && !user.pushNotificationTime && user.notificationTime) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { pushNotificationTime: user.notificationTime },
      });
    }

    const pushTime = user?.pushNotificationTime || user?.notificationTime;
    if (pushTime && user?.pushNotificationsEnabled) {
      await removeExistingUserJobs(session.user.id);
      await scheduleUserNotification(
        session.user.id,
        pushTime,
        timezone || user.timezone
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering device token:', error);
    return NextResponse.json(
      { error: 'Failed to register device token' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 }
      );
    }

    await prisma.deviceToken.deleteMany({
      where: { token, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing device token:', error);
    return NextResponse.json(
      { error: 'Failed to remove device token' },
      { status: 500 }
    );
  }
}
