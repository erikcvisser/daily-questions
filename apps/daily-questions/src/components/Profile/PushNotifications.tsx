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
  List,
  ListItem,
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

export function PushNotificationManager() {
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

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
  };

  if (isStandalone) return null;
  return (
    <Stack>
      {isIOS && (
        <>
          <Text>To install on iOS:</Text>
          <List>
            <ListItem>
              Tap the share button{' '}
              <span role="img" aria-label="share icon">
                ⎋
              </span>
            </ListItem>
            <ListItem>
              Scroll down and tap &quot;Add to Home Screen&quot;{' '}
              <span role="img" aria-label="plus icon">
                ➕
              </span>
            </ListItem>
            <ListItem>Tap &quot;Add&quot; to confirm</ListItem>
          </List>
        </>
      )}
      {!isIOS && deferredPrompt && (
        <Button onClick={handleInstallClick}>Install App</Button>
      )}
      {!isIOS && (
        <>
          <Text>To install on Android:</Text>
          <ol>
            <li>Tap the menu (⋮) in your browser</li>
            <li>
              Tap &quot;Install app&quot; or &quot;Add to Home Screen&quot;
            </li>
            <li>Follow the installation prompts</li>
          </ol>
          <Text>To install on Desktop:</Text>
          <ol>
            <li>
              Look for the install icon{' '}
              <span role="img" aria-label="install icon">
                ⊕
              </span>{' '}
              in your browser&apos;s address bar
            </li>
            <li>Click it and select &quot;Install&quot;</li>
            <li>Or use Chrome menu (⋮) → &quot;Install [App Name]&quot;</li>
          </ol>
        </>
      )}
    </Stack>
  );
}
