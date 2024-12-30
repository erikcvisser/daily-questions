import Queue from 'bull';
import { Resend } from 'resend';
import prisma from './prisma';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const emailQueue = new Queue(
  'email-notifications',
  process.env.AUTH_REDIS_URL!
);

// Process the email notifications
emailQueue.process('daily-email', async (job) => {
  const { userId, localTime, timezone } = job.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.email || !user.emailNotificationsEnabled) {
      console.log('User email not found or notifications disabled');
      return;
    }

    // Check if user already submitted today
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
      console.log('User already submitted today, skipping email');
      return;
    }

    // Send the email
    await resend.emails.send({
      from: 'Daily Questions <mail@dailyquestions.app>',
      to: user.email,
      subject: 'Time for Your Daily Reflection',
      html: `
        <h3>Hi ${user.name || 'there'},</h3>
        <p>It's time for your daily moment of reflection. Taking a few minutes to answer your questions can help you stay on track with your goals and maintain clarity about what matters most.</p>
        <p>Ready to reflect? <a href="https://dailyquestions.app/">Click here to answer your daily questions</a></p>
        <p>Keep up the great work!</p>
        <br/>
        <p>Best regards,<br/>Daily Questions</p>
      `,
    });
  } catch (error) {
    console.error('Email notification error:', error);
    throw error;
  }
});
