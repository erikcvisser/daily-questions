import admin from 'firebase-admin';
import prisma from './prisma';

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }
  return admin;
}

export async function sendPushToUser(userId: string) {
  const firebaseAdmin = getFirebaseAdmin();
  if (!firebaseAdmin) {
    console.warn('Firebase not configured, skipping push notification');
    return;
  }

  const deviceTokens = await prisma.deviceToken.findMany({
    where: { userId },
  });

  if (deviceTokens.length === 0) return;

  const message = {
    notification: {
      title: 'Time for your Daily Questions!',
      body: "Don't forget to answer your daily questions.",
    },
    data: {
      url: '/submission/new',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  const results = await Promise.allSettled(
    deviceTokens.map(async (dt) => {
      try {
        await firebaseAdmin.messaging().send({ ...message, token: dt.token });
      } catch (error: any) {
        if (
          error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token'
        ) {
          await prisma.deviceToken.delete({ where: { id: dt.id } });
          console.log(`Removed invalid device token: ${dt.id}`);
        } else {
          throw error;
        }
      }
    })
  );

  const failures = results.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`Failed to send ${failures.length} push notifications`);
  }
}
