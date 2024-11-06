import Queue from 'bull';
import prisma from './prisma';
import { sendNotification } from './actions';

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
  process.env.REDIS_URL!
);

// Initialize queue when the module is imported
initializeQueue();

// Process the notifications
notificationQueue.process(async (job) => {
  const { userId } = job.data;

  try {
    // Check if user has already submitted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

    // Send the notification
    await sendNotification(
      'Time for your Daily Questions!',
      "Don't forget to answer your daily questions.",
      '/questions'
    );

    return { success: true };
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
  // Remove any existing scheduled notifications for this user
  const existingJobs = await notificationQueue.getJobs(['delayed']);
  for (const job of existingJobs) {
    if (job.data.userId === userId) {
      await job.remove();
    }
  }

  // Calculate the next notification time
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  // If the time has passed today, schedule for tomorrow
  if (scheduledTime.getTime() < now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  // Schedule the notification
  const delay = scheduledTime.getTime() - now.getTime();

  // Schedule the initial notification
  await notificationQueue.add(
    { userId },
    {
      delay,
      repeat: {
        cron: `${minutes} ${hours} * * *`, // Daily at the specified time
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
