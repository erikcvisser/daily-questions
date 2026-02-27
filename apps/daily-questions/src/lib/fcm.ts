import admin from 'firebase-admin';
import prisma from './prisma';

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    let privateKey: string | undefined;
    if (rawKey) {
      try {
        // Handle JSON-encoded strings (e.g. wrapped in quotes with escaped \n)
        privateKey = JSON.parse(rawKey);
      } catch {
        // Replace literal \n with actual newlines
        privateKey = rawKey.replace(/\\n/g, '\n');
      }
      // Debug: log key format to help diagnose PEM issues
      console.error(`[FCM] Key length: ${privateKey?.length}, starts: ${privateKey?.substring(0, 30)}, has real newlines: ${privateKey?.includes('\n')}, has literal backslash-n: ${privateKey?.includes('\\n')}`);
    }

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
      } catch (error: unknown) {
        const code = error instanceof Error && 'code' in error ? (error as { code: string }).code : '';
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
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
