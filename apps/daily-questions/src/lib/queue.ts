import Queue from 'bull';
import prisma from './prisma';
import webpush from 'web-push';

// Initialize function
async function initializeQueue() {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        user: true,
      },
      where: {
        user: {
          NOT: { notificationTime: null },
        },
      },
    });

    for (const subscription of subscriptions) {
      if (subscription.user.notificationTime) {
        await scheduleUserNotification(
          subscription.user.id,
          subscription.user.notificationTime,
          subscription.id,
          subscription.timezone
        );
      }
    }

    console.log('Queue initialized successfully');
  } catch (error) {
    console.error('Failed to initialize queue:', error);
  }
}

// Create the notification queue
export const notificationQueue = new Queue(
  'notifications',
  process.env.AUTH_REDIS_URL!
);

// Initialize queue when the module is imported
initializeQueue();

// Process the notifications
notificationQueue.process(async (job) => {
  const { userId, localTime, subscriptionId } = job.data;

  try {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      console.log('No subscription found');
      return;
    }

    // Check for submission for today's date (in subscription's timezone)
    const userTz = subscription.timezone;
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

    const notificationPayload = JSON.stringify({
      title: 'Time for your Daily Questions!',
      body: "Don't forget to answer your daily questions.",
      icon: '/android-chrome-192x192.png',
      url: '/questions',
      targetTime: localTime,
    });

    await webpush
      .sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        },
        notificationPayload
      )
      .catch(async (error) => {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
          console.log(`Removed invalid subscription: ${subscription.endpoint}`);
        } else {
          console.error('Push notification error:', error);
        }
      });
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
});

// Helper function to schedule a notification
export async function scheduleUserNotification(
  userId: string,
  timeString: string,
  subscriptionId: string,
  timezone: string
) {
  // Parse the time
  const [hours, minutes] = timeString.split(':').map(Number);

  // Create cron expression for the specified time in user's timezone
  const cronExpression = `${minutes} ${hours} * * *`;

  // Schedule the notification
  await notificationQueue.add(
    { userId, localTime: timeString, subscriptionId },
    {
      repeat: {
        cron: cronExpression,
        tz: timezone,
      },
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

// Add logging to your queue processing
notificationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
