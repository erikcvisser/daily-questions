import { auth } from '@/lib/auth';
import { notificationQueue } from '@/lib/queue';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== 'erikcvisser@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      notificationQueue.getWaiting(),
      notificationQueue.getActive(),
      notificationQueue.getCompleted(),
      notificationQueue.getFailed(),
      notificationQueue.getDelayed(),
    ]);

    const formatJob = (job: any) => ({
      id: job.id,
      data: job.data,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      opts: job.opts,
    });

    return NextResponse.json({
      counts: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      },
      jobs: {
        waiting: waiting.map(formatJob),
        active: active.map(formatJob),
        completed: completed.map(formatJob),
        failed: failed.map(formatJob),
        delayed: delayed.map(formatJob),
      },
    });
  } catch (error) {
    console.error('Queue status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
