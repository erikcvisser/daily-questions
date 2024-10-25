'use client';

import { useState, useEffect } from 'react';
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from '@/lib/actions';
import {
  Title,
  Button,
  Text,
  Stack,
  TextInput,
  Container,
} from '@mantine/core';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    await subscribeUser(sub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage('');
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }
  return (
    <Container size="sm" ml="0" p="0">
      {subscription ? (
        <Stack>
          <Text>You are subscribed to push notifications.</Text>
          <Button variant="light" color="red" onClick={unsubscribeFromPush}>
            Unsubscribe
          </Button>
          <TextInput
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={sendTestNotification}>Send Test Notification</Button>
        </Stack>
      ) : (
        <Stack>
          <Text>You are not subscribed to push notifications.</Text>
          <Button onClick={subscribeToPush}>Subscribe</Button>
        </Stack>
      )}
    </Container>
  );
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div>
      <Title order={3}>Install App</Title>
      <Button>Add to Home Screen</Button>
      {isIOS && (
        <Text>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then &quot;Add to Home Screen &quot;
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>
          .
        </Text>
      )}
    </div>
  );
}

export default function PushNotificationsComponent() {
  return (
    <>
      <PushNotificationManager />
      <InstallPrompt />
    </>
  );
}
