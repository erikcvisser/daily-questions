import Queue from 'bull';
import prisma from './prisma';
import webpush from 'web-push';

// Initialize function
async function initializeQueue() {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: { notificationTime: null },
      },
    });

    for (const user of users) {
      if (user.notificationTime) {
        await scheduleUserNotification(user.id, user.notificationTime);
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
  const { userId, localTime } = job.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pushSubscriptions: true,
      },
    });

    if (!user?.pushSubscriptions.length) {
      console.log('No push subscriptions found for user');
      return;
    }

    // Check for submission for today's date (in UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
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
      targetTime: localTime, // For service worker timing check
    });

    const notificationPromises = user.pushSubscriptions.map((subscription) =>
      webpush
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
            // Subscription is no longer valid, remove it
            await prisma.pushSubscription.delete({
              where: {
                endpoint: subscription.endpoint,
              },
            });
            console.log(
              `Removed invalid subscription: ${subscription.endpoint}`
            );
          } else {
            console.error('Push notification error:', error);
          }
        })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
});

// Helper function to schedule a notification
export async function scheduleUserNotification(
  userId: string,
  timeString: string
) {
  // Remove existing jobs
  const existingJobs = await notificationQueue.getJobs(['delayed']);
  for (const job of existingJobs) {
    if (job.data.userId === userId) {
      await job.remove();
    }
  }

  // Parse the time in UTC
  const [hours, minutes] = timeString.split(':').map(Number);

  // Create cron expression in UTC
  // Convert local time to UTC for cron
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();

  const cronExpression = `${utcMinutes} ${utcHours} * * *`;

  // Schedule the notification
  await notificationQueue.add(
    { userId, localTime: timeString }, // Store local time in job data
    {
      repeat: {
        cron: cronExpression,
        tz: 'UTC', // Explicitly set timezone to UTC
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
