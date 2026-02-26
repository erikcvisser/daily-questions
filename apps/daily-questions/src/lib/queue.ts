import Queue from 'bull';
import prisma from './prisma';

async function initializeQueue() {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: { notificationTime: null },
        deviceTokens: { some: {} },
      },
    });

    for (const user of users) {
      if (user.notificationTime) {
        await scheduleUserNotification(
          user.id,
          user.notificationTime,
          user.timezone
        );
      }
    }

    console.log('Queue initialized successfully');
  } catch (error) {
    console.error('Failed to initialize queue:', error);
  }
}

export const notificationQueue = new Queue(
  'notifications',
  process.env.AUTH_REDIS_URL ?? ''
);

initializeQueue();

notificationQueue.process('daily-notification', async (job) => {
  const { userId, timezone } = job.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { deviceTokens: true },
    });

    if (!user || user.deviceTokens.length === 0) {
      return;
    }

    const userTz = timezone;
    const todayInTz = new Date(
      new Date().toLocaleString('en-US', { timeZone: userTz })
    );
    todayInTz.setHours(0, 0, 0, 0);

    const tomorrowInTz = new Date(todayInTz);
    tomorrowInTz.setDate(tomorrowInTz.getDate() + 1);

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId,
        date: {
          gte: todayInTz,
          lt: tomorrowInTz,
        },
      },
    });

    if (existingSubmission) {
      console.log('User already submitted today, skipping notification');
      return;
    }

    const { sendPushToUser } = await import('./fcm');
    await sendPushToUser(userId);
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
});

export async function removeExistingUserJobs(userId: string) {
  const repeatableJobs = await notificationQueue.getRepeatableJobs();
  const jobsToRemove = repeatableJobs.filter(
    (job) =>
      job.name === 'daily-notification' && job.key?.includes(userId)
  );

  for (const job of jobsToRemove) {
    await notificationQueue.removeRepeatableByKey(job.key);
  }
}

export async function scheduleUserNotification(
  userId: string,
  timeString: string,
  timezone: string
) {
  await removeExistingUserJobs(userId);

  const [hours, minutes] = timeString.split(':').map(Number);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(
      `Invalid time format: ${timeString}. Expected HH:mm format.`
    );
  }

  const cronExpression = `${minutes} ${hours} * * *`;

  await notificationQueue.add(
    'daily-notification',
    {
      userId,
      localTime: timeString,
      timezone,
    },
    {
      repeat: {
        cron: cronExpression,
        tz: timezone,
      },
      jobId: `notification:${userId}:${cronExpression}`,
    }
  );
}

export async function getQueueStatus() {
  const [waiting, active, completed, failed] = await Promise.all([
    notificationQueue.getWaiting(),
    notificationQueue.getActive(),
    notificationQueue.getCompleted(),
    notificationQueue.getFailed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

export async function getQueueJobs() {
  const jobs = await notificationQueue.getJobs([
    'waiting',
    'active',
    'completed',
    'failed',
  ]);
  return Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      data: job.data,
      status: await job.getState(),
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    }))
  );
}

notificationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
