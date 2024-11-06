'use client';

import { useState, useEffect } from 'react';
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
  getSubscription,
  scheduleNotification,
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
  Group,
  Switch,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';

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

// Add this interface
interface SerializedSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState('');
  const [notificationTime, setNotificationTime] = useState('20:00'); // Default to 8 PM

  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window) {
      console.log('Notification permission:', Notification.permission);
    } else {
      console.log('Notifications not supported');
    }
  }, []);

  useEffect(() => {
    async function initializeSubscription() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported:', {
          serviceWorker: 'serviceWorker' in navigator,
          pushManager: 'PushManager' in window,
        });
        setIsLoading(false);
        return;
      }

      setIsSupported(true);
      try {
        // Wait for service worker to be ready (already registered by Serwist)
        console.log('Waiting for service worker...');
        const registration = await navigator.serviceWorker.ready;
        console.log('Service worker ready');

        // Check browser subscription
        console.log('Checking browser subscription...');
        const browserSub = await registration.pushManager.getSubscription();
        console.log('Browser subscription:', browserSub ? 'exists' : 'none');

        // Check database subscription
        console.log('Checking database subscription...');
        const dbSub = await getSubscription();
        console.log('Database subscription:', dbSub ? 'exists' : 'none');

        if (browserSub && !dbSub) {
          // Browser is subscribed but not in DB - clean up
          await browserSub.unsubscribe();
          setSubscription(null);
        } else if (!browserSub && dbSub) {
          // DB has subscription but browser doesn't - clean up
          await unsubscribeUser();
          setSubscription(null);
        } else {
          setSubscription(browserSub);
        }
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      } finally {
        setIsLoading(false);
      }
    }

    initializeSubscription();
  }, []);

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const serializedSub: SerializedSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(await sub.getKey('p256dh')!),
          auth: arrayBufferToBase64(await sub.getKey('auth')!),
        },
      };

      setSubscription(sub);

      // Subscribe to push notifications and schedule daily notification
      const subResult = await subscribeUser(serializedSub);
      const scheduleResult = await scheduleNotification(notificationTime);

      if (!subResult.success || !scheduleResult.success) {
        throw new Error('Failed to save subscription or schedule notification');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setSubscription(null);
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      await unsubscribeUser();
      setSubscription(null);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  async function updateNotificationTime(newTime: string) {
    try {
      const result = await scheduleNotification(newTime);
      if (result.success) {
        setNotificationTime(newTime);
      }
    } catch (error) {
      console.error('Failed to update notification time:', error);
    }
  }

  async function sendTestNotification() {
    const title = 'Daily Questions';
    if (subscription) {
      await sendNotification(title, message);
      setMessage('');
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Container size="sm" ml="0" p="0">
      <Stack>
        <Group align="center">
          <Text>Push notifications</Text>
          <Switch
            checked={!!subscription}
            onChange={subscription ? unsubscribeFromPush : subscribeToPush}
            label={subscription ? 'Enabled' : 'Disabled'}
          />
        </Group>

        {subscription && (
          <>
            <Group align="center">
              <Text>Daily notification time:</Text>
              <TimeInput
                value={notificationTime}
                onChange={(event) =>
                  updateNotificationTime(event.currentTarget.value)
                }
              />
            </Group>

            <TextInput
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendTestNotification}>
              Send Test Notification
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsAndroid(/Android/.test(navigator.userAgent));
    setIsDesktop(
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
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
    <>
      <Title order={4} mb="md">
        Install app
      </Title>
      <Text mb="md">
        Install the app on your phone for easier access and notifications.
      </Text>
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
        {isAndroid && (
          <>
            <Text>To install on Android:</Text>
            <List>
              <ListItem>Tap the menu (⋮) in your browser</ListItem>
              <ListItem>
                Tap &quot;Install app&quot; or &quot;Add to Home Screen&quot;
              </ListItem>
              <ListItem>Follow the installation prompts</ListItem>
            </List>
          </>
        )}
        {isDesktop && deferredPrompt && (
          <Button onClick={handleInstallClick} size="compact">
            Install App
          </Button>
        )}
        {isDesktop && (
          <>
            <Text>To install on Desktop:</Text>
            <List>
              <ListItem>
                Look for the install icon{' '}
                <span role="img" aria-label="install icon">
                  ⊕
                </span>{' '}
                in your browser&apos;s address bar
              </ListItem>
              <ListItem>Click it and select &quot;Install&quot;</ListItem>
              <ListItem>
                Or use Chrome menu (⋮) → &quot;Install [App Name]&quot;
              </ListItem>
            </List>
          </>
        )}
      </Stack>
    </>
  );
}

// Add these helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}
