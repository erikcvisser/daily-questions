'use server';

import { Question, QuestionStatus, QuestionType } from '@prisma/client';
import { createQuestionSchema } from './definitions';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';
import { CreateUserInput, createUserSchema } from '@/lib/definitions';
import { hash } from 'bcryptjs';
import { Resend } from 'resend';
import webpush from 'web-push';
import {
  notificationQueue,
  scheduleUserNotification,
  removeExistingJobs,
} from './queue';

webpush.setVapidDetails(
  'mailto:mail@dailyquestions.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const CreateQuestion = createQuestionSchema;
export async function createQuestion(formData: any) {
  const session = await auth();
  const { title, type, targetBool, targetInt, targetRating } =
    CreateQuestion.parse({
      title: formData['title'],
      type: formData['type'],
      targetBool: formData['targetBool'] || undefined,
      targetInt: formData['targetInt'] || undefined,
      targetRating: formData['targetRating'] || undefined,
      userId: session?.user?.id || '1',
    });
  await prisma.question.create({
    data: {
      title,
      type,
      ...(targetBool && { targetBool }),
      ...(targetInt && { targetInt }),
      ...(targetRating && { targetRating }),
      status: 'ACTIVE',
      userId: session?.user?.id || '1',
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

export async function updateQuestion(id: string, formData: any) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check if the question is linked to a library question
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    include: { libraryQuestion: true },
  });

  if (existingQuestion?.libraryQuestion) {
    // If linked to a library question, create a new question and archive the current one
    const { title, type, targetBool, targetInt, targetRating } =
      CreateQuestion.parse({
        title: formData['title'],
        type: formData['type'],
        targetBool: formData['targetBool'] || undefined,
        targetInt: formData['targetInt'] || undefined,
        targetRating: formData['targetRating'] || undefined,
      });

    await prisma.$transaction([
      // Create new question
      prisma.question.create({
        data: {
          title,
          type,
          ...(targetBool && { targetBool }),
          ...(targetInt && { targetInt }),
          ...(targetRating && { targetRating }),
          status: 'ACTIVE',
          userId: session.user.id,
          position: existingQuestion.position, // Maintain the same position
        },
      }),
      // Archive the current question
      prisma.question.update({
        where: { id },
        data: { status: 'INACTIVE' },
      }),
    ]);
  } else {
    // If not linked to a library question, update as before
    const { title, type, targetBool, targetInt, targetRating } =
      CreateQuestion.parse({
        title: formData['title'],
        type: formData['type'],
        targetBool: formData['targetBool'] || undefined,
        targetInt: formData['targetInt'] || undefined,
        targetRating: formData['targetRating'] || undefined,
      });

    await prisma.question.update({
      where: { id },
      data: {
        title,
        type,
        ...(targetBool && { targetBool }),
        ...(targetInt && { targetInt }),
        ...(targetRating && { targetRating }),
      },
    });
  }

  revalidatePath('/questions');
  redirect('/questions');
}

export async function deleteQuestion(question: Question) {
  console.log('delete question', question);
  await prisma.question.delete({
    where: {
      id: question.id,
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

export async function archiveQuestion(question: Question) {
  console.log('archive question', question);
  await prisma.question.update({
    where: {
      id: question.id,
    },
    data: {
      status: 'INACTIVE',
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

async function calculateScorePercentage(answers: any[]) {
  let totalQuestions = 0;
  let exceededTarget = 0;

  for (const answer of answers) {
    const question = await prisma.question.findUnique({
      where: { id: answer.questionId },
    });

    if (!question) continue;

    if (
      question.type === QuestionType.BOOLEAN &&
      question.targetBool !== null
    ) {
      totalQuestions++;
      if (answer.answer === String(question.targetBool)) {
        exceededTarget++;
      }
    } else if (
      question.type === QuestionType.INTEGER &&
      question.targetInt !== null
    ) {
      totalQuestions++;
      if (Number(answer.answer) >= question.targetInt) {
        exceededTarget++;
      }
    } else if (
      question.type === QuestionType.RATING &&
      question.targetRating !== null
    ) {
      totalQuestions++;
      if (Number(answer.answer) >= question.targetRating) {
        exceededTarget++;
      }
    }
  }

  return totalQuestions > 0 ? (exceededTarget / totalQuestions) * 100 : null;
}

export async function submitQuestionnaire(formData: any) {
  const session = await auth();
  const answers = [];
  for (const key in formData.answers) {
    answers.push({
      questionId: key,
      answer: formData.answers[key].toString(),
    });
  }

  const scorePercentage = await calculateScorePercentage(answers);

  await prisma.submission.create({
    data: {
      userId: session?.user?.id || '1',
      date: formData['date'],
      answers: { create: answers },
      scorePercentage,
    },
  });
  revalidatePath('/overview');
  redirect('/overview');
}

export async function updateQuestionnaire(id: string, formData: any) {
  const session = await auth();
  const answers = [];
  for (const key in formData.answers) {
    answers.push({
      questionId: key,
      answer: formData.answers[key].toString(),
    });
  }

  const scorePercentage = await calculateScorePercentage(answers);

  await prisma.submission.update({
    where: {
      id: id,
    },
    data: {
      userId: session?.user?.id || '1',
      date: formData['date'],
      answers: {
        deleteMany: {},
        create: answers,
      },
      scorePercentage,
    },
  });

  revalidatePath('/overview');
  redirect('/overview');
}

export async function signInPostmark(formData: FormData) {
  signIn('postmark', formData);
}

export async function deleteSubmission(id: string) {
  await prisma.submission.delete({
    where: {
      id: id,
    },
  });
  revalidatePath('/overview');
}

export async function copyLibraryQuestions(questionIds: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const libraryQuestions = await prisma.libraryQuestion.findMany({
    where: { id: { in: questionIds } },
  });

  const userQuestions = libraryQuestions.map((libQ) => ({
    title: libQ.title,
    type: libQ.type,
    status: 'ACTIVE',
    userId: session?.user?.id || '1',
    libraryQuestionId: libQ.id,
    targetInt: libQ.type === 'INTEGER' ? libQ.targetInt : undefined,
    targetBool: libQ.type === 'BOOLEAN' ? libQ.targetBool : undefined,
    targetRating: libQ.type === 'RATING' ? libQ.targetRating : undefined,
  }));

  await prisma.question.createMany({
    data: userQuestions.map((q) => ({
      ...q,
      status: q.status as QuestionStatus,
    })),
  });

  revalidatePath('/questions');
  redirect('/questions');
}

export async function updateQuestionPositions(updatedQuestions: Question[]) {
  const updatePromises = updatedQuestions.map((question) =>
    prisma.question.update({
      where: { id: question.id },
      data: { position: question.position },
    })
  );

  await Promise.all(updatePromises);
  revalidatePath('/questions');
}

export async function registerUser(formData: CreateUserInput) {
  const validatedData = createUserSchema.parse(formData);
  const hashed_password = await hash(validatedData.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        password: hashed_password,
      },
    });

    if (!user) {
      throw new Error('User creation failed');
    }

    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    await resend.emails.send({
      from: 'Daily Questions <mail@dailyquestions.app>',
      to: user.email || '',
      bcc: 'erikcvisser@gmail.com',
      subject: 'Welcome to Daily Questions!',
      html: `<p>Hello ${user.name},</p>
             <p>Welcome to Daily Questions! We're excited to have you on board.</p>
             <p>Start tracking your daily progress now!<br />
             Open the <a href="https://dailyquestions.app">Daily Questions</a> app to get started.</p>
             <p>Best regards,<br>Erik</p>`,
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw new Error('Email already exists');
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    // Delete all related data
    await prisma.submission.deleteMany({
      where: { userId: session.user.id },
    });
    await prisma.question.deleteMany({
      where: { userId: session.user.id },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    // Return success instead of redirecting
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

export async function updateUserDetails(data: {
  name: string;
  targetScore: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        targetScore: data.targetScore,
      },
    });
    console.log(updatedUser);

    if (!updatedUser) {
      throw new Error('User update failed');
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user details:', error);
    return { success: false, error: 'Failed to update user details' };
  }
}

export async function createLibraryQuestion(formData: any) {
  const { title, type, targetBool, targetInt, targetRating, categoryId } =
    formData;

  const newLibraryQuestion = await prisma.libraryQuestion.create({
    data: {
      title,
      type,
      targetBool: targetBool === 'true',
      targetInt: parseInt(targetInt),
      targetRating: parseInt(targetRating),
      categoryId,
    },
  });

  revalidatePath('/admin');
  return newLibraryQuestion;
}

export async function updateLibraryQuestion(id: string, formData: any) {
  const { title, type, targetBool, targetInt, targetRating, categoryId } =
    formData;

  const updatedLibraryQuestion = await prisma.libraryQuestion.update({
    where: { id },
    data: {
      title,
      type,
      targetBool: targetBool === 'true',
      targetInt: parseInt(targetInt),
      targetRating: parseInt(targetRating),
      categoryId,
    },
  });

  revalidatePath('/admin');
  return updatedLibraryQuestion;
}

export async function deleteLibraryQuestion(id: string) {
  await prisma.libraryQuestion.delete({
    where: { id },
  });

  revalidatePath('/admin');
}

export async function createCategory(name: string) {
  const newCategory = await prisma.category.create({
    data: { name },
  });

  revalidatePath('/admin');
  return newCategory;
}

export async function updateCategory(id: string, name: string) {
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name },
  });

  revalidatePath('/admin');
  return updatedCategory;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id },
  });

  revalidatePath('/admin');
}

export async function subscribeUser(sub: any) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Check if this subscription already exists
    const existingSub = await prisma.pushSubscription.findFirst({
      where: {
        userId: session.user.id,
        endpoint: sub.endpoint,
      },
    });

    if (!existingSub) {
      const newSub = await prisma.pushSubscription.create({
        data: {
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userId: session.user.id,
          timezone,
        },
      });

      // Schedule notification if user has notification time set
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (user?.notificationTime) {
        await scheduleUserNotification(
          session.user.id,
          user.notificationTime,
          newSub.id,
          timezone
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error subscribing user:', error);
    return { success: false, error: 'Failed to subscribe user' };
  }
}

export async function unsubscribeUser(endpoint?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (endpoint) {
    // Unsubscribe specific device
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: endpoint,
      },
    });
  } else {
    // Unsubscribe all devices
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
      },
    });
  }

  return { success: true };
}

export async function getSubscriptions() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const subscription = await prisma.pushSubscription.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return subscription;
}

export async function scheduleNotification(time: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    // Store the notification preference
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notificationTime: time },
    });

    // Get all user's subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    // Schedule the notification for each subscription
    for (const subscription of subscriptions) {
      // Remove existing jobs before scheduling new one
      await removeExistingJobs(subscription.id);

      await scheduleUserNotification(
        session.user.id,
        time,
        subscription.id,
        subscription.timezone
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return { success: false, error: 'Failed to schedule notification' };
  }
}

export async function initializeQueue() {
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

  // Schedule notifications for each subscription
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
}

export async function getQueueData() {
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
    timestamp: new Date(job.timestamp).toLocaleString(),
    processedOn: job.processedOn
      ? new Date(job.processedOn).toLocaleString()
      : null,
    finishedOn: job.finishedOn
      ? new Date(job.finishedOn).toLocaleString()
      : null,
    failedReason: job.failedReason,
    repeat: job.opts?.repeat || null,
  });

  return {
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
  };
}

export async function submitFeedback(feedback: string) {
  const resend = new Resend(process.env.AUTH_RESEND_KEY);
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await resend.emails.send({
      from: 'Daily Questions <mail@dailyquestions.app>',
      to: 'mail@dailyquestions.app',
      subject: 'New Feedback Submission',
      text: `Feedback from ${session.user.email}:\n\n${feedback}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending feedback:', error);
    return { success: false, error: 'Failed to send feedback' };
  }
}

export async function updateSubscriptionTimezone(
  endpoint: string,
  timezone: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Update timezone and reschedule notification
    await prisma.pushSubscription.update({
      where: { endpoint },
      data: { timezone },
    });

    // Reschedule notification with new timezone
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.notificationTime) {
      await scheduleUserNotification(
        session.user.id,
        user.notificationTime,
        subscription.id,
        timezone
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating timezone:', error);
    return { success: false, error: 'Failed to update timezone' };
  }
}

export async function sendNotification(
  title: string,
  message: string,
  url?: string
) {
  const subscriptions = await getSubscriptions();
  if (!subscriptions || subscriptions.length === 0) {
    throw new Error('No subscriptions available');
  }

  try {
    const notificationPayload = JSON.stringify({
      title,
      body: message,
      icon: '/android-chrome-192x192.png',
      url: url || '/',
      scheduledTime: new Date().toISOString(), // Immediate notification
    });

    const sendPromises = subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        },
        notificationPayload
      )
    );

    await Promise.all(sendPromises);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

export async function getBullQueueData() {
  'use server';
  try {
    const [jobs, repeatableJobs, jobCounts, delayedJobs] = await Promise.all([
      notificationQueue.getJobs(['active', 'waiting', 'completed', 'failed']),
      notificationQueue.getRepeatableJobs(),
      notificationQueue.getJobCounts(),
      notificationQueue.getDelayed(),
    ]);

    return {
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        state: job.getState(),
        timestamp: job.timestamp,
      })),
      repeatableJobs,
      jobCounts,
      delayedJobs: delayedJobs.map((job) => ({
        id: job.id,
        data: job.data,
        delay: job.timestamp,
      })),
    };
  } catch (error) {
    console.error('Error fetching queue data:', error);
    throw new Error('Failed to fetch queue data');
  }
}

export async function removeBullJob(
  jobId: string,
  type: 'regular' | 'repeatable'
) {
  'use server';
  try {
    if (type === 'repeatable') {
      await notificationQueue.removeRepeatableByKey(jobId);
    } else {
      const job = await notificationQueue.getJob(jobId);
      if (job) await job.remove();
    }
    return { success: true };
  } catch (error) {
    console.error('Error removing job:', error);
    throw new Error('Failed to remove job');
  }
}
