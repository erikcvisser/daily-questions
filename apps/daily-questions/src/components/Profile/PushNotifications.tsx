'use client';

import { useState, useEffect } from 'react';
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
  getSubscriptions,
  scheduleNotification,
  updateSubscriptionTimezone,
} from '@/lib/actions';
import {
  Title,
  Button,
  Text,
  Stack,
  List,
  ListItem,
  TextInput,
  Container,
  Group,
  Switch,
  Badge,
  Paper,
  ActionIcon,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import {
  IconDeviceLaptop,
  IconDeviceMobile,
  IconTrash,
} from '@tabler/icons-react';
import { User } from '@prisma/client';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';

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

interface SerializedSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  timezone: string;
}

export function PushNotificationManager({ user }: { user: User }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [message, setMessage] = useState('');
  const [notificationTime, setNotificationTime] = useState('');
  const [currentDeviceEndpoint, setCurrentDeviceEndpoint] = useState<
    string | null
  >(null);
  const [currentTimezone, setCurrentTimezone] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

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
        console.log('Waiting for service worker...');
        const registration = await navigator.serviceWorker.ready;
        console.log('Service worker ready');

        console.log(
          'Setting notification time from user preferences:',
          user.notificationTime
        );
        setNotificationTime(user.notificationTime || '20:00');

        console.log('Fetching database subscriptions...');
        const dbSubs = await getSubscriptions();
        console.log(`Database subscriptions count: ${dbSubs?.length}`);

        const browserSub = await registration.pushManager.getSubscription();
        console.log('Browser subscription:', browserSub ? 'exists' : 'none');

        if (browserSub) {
          setCurrentDeviceEndpoint(browserSub.endpoint);
          const serializedSub: SerializedSubscription = {
            endpoint: browserSub.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(await browserSub.getKey('p256dh')!),
              auth: arrayBufferToBase64(await browserSub.getKey('auth')!),
            },
            timezone: currentTimezone,
          };

          const isInDB = dbSubs?.some(
            (sub) => sub.endpoint === serializedSub.endpoint
          );
          console.log(
            'Is current browser subscription in DB?',
            isInDB ? 'Yes' : 'No'
          );

          if (!isInDB) {
            console.log('Registering new subscription to the server...');
            const subResult = await subscribeUser(serializedSub);
            if (!subResult.success) {
              throw new Error(`Failed to save subscription`);
            }
            console.log('Subscription successfully saved to the server.');
          }
        }

        // @ts-expect-error this can be empty
        setSubscriptions(dbSubs || []);
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeSubscription();
  }, [user.notificationTime]);

  useEffect(() => {
    // Check timezone periodically
    const checkTimezone = async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone !== currentTimezone) {
        setCurrentTimezone(timezone);

        // Update timezone for current device if subscribed
        if (currentDeviceEndpoint) {
          await updateSubscriptionTimezone(currentDeviceEndpoint, timezone);
        }
      }
    };

    // Check immediately
    checkTimezone();

    // Check every hour
    const interval = setInterval(checkTimezone, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentTimezone, currentDeviceEndpoint]);

  async function subscribeToPush() {
    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if permission is denied
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        notifications.show({
          title: 'Permission Denied',
          message: 'Please enable notifications in your browser settings',
          color: 'red',
        });
        return;
      }

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
        timezone: currentTimezone,
      };

      console.log('New Subscription:', serializedSub);

      const subResult = await subscribeUser(serializedSub);
      if (!subResult.success) {
        throw new Error(`Failed to save subscription`);
      }

      const scheduleResult = await scheduleNotification(notificationTime);
      if (!scheduleResult.success) {
        throw new Error(
          `Failed to schedule notification: ${scheduleResult.error}`
        );
      }

      setSubscriptions((prev) => [...prev, sub]);
      setCurrentDeviceEndpoint(sub.endpoint);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      notifications.show({
        title: 'Subscription Failed',
        message: 'Failed to enable notifications. Please try again.',
        color: 'red',
      });

      const registration = await navigator.serviceWorker.ready;
      const browserSub = await registration.pushManager.getSubscription();
      if (browserSub) {
        await browserSub.unsubscribe();
      }
      setSubscriptions((prev) =>
        prev.filter((sub) => sub.endpoint !== browserSub?.endpoint)
      );
    } finally {
      setIsSubscribing(false);
    }
  }

  async function unsubscribeFromPush(endpoint: string) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager
        .getSubscription()
        .then((sub) => (sub && sub.endpoint === endpoint ? sub : null));

      if (subscription) {
        await subscription.unsubscribe();
      }

      await unsubscribeUser(endpoint);

      setSubscriptions((prev) =>
        prev.filter((sub) => sub.endpoint !== endpoint)
      );

      if (endpoint === currentDeviceEndpoint) {
        setCurrentDeviceEndpoint(null);
      }
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
    if (subscriptions.length > 0) {
      await sendNotification(title, message);
      setMessage('');
    }
  }

  if (!isSupported) {
    return (
      <Stack>
        <Text>
          Push notifications are not supported in your current browser. To
          enable notifications:
        </Text>
        <List>
          <ListItem>Install the app using the instructions above</ListItem>
          <ListItem>
            Use a modern browser like Chrome, Firefox, or Safari
          </ListItem>
          <ListItem>
            Make sure you&apos;re not in private/incognito mode
          </ListItem>
          <ListItem>
            Contact support if you continue to have issues &nbsp;
            <Link href="mailto:mail@dailyquestions.app">
              mail@dailyquestions.app
            </Link>
          </ListItem>
        </List>
      </Stack>
    );
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
            checked={subscriptions.length > 0}
            onChange={
              subscriptions.length > 0
                ? () => {
                    subscriptions.forEach((sub) =>
                      unsubscribeFromPush(sub.endpoint)
                    );
                  }
                : subscribeToPush
            }
            label={subscriptions.length > 0 ? 'Enabled' : 'Disabled'}
            disabled={isSubscribing}
          />
        </Group>

        {subscriptions.length > 0 && (
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
          </>
        )}
      </Stack>
      <Stack>
        <Title order={4} mt="md">
          Manage Subscriptions
        </Title>
        <Stack>
          {subscriptions.map((sub) => {
            const deviceUrl = new URL(sub.endpoint);
            const isCurrentDevice = currentDeviceEndpoint === sub.endpoint;

            return (
              <Paper key={sub.endpoint} p="xs" withBorder>
                <Group justify="space-between">
                  <Group>
                    {/fcm\.googleapis\.com|apple|android\.googleapis\.com/i.test(
                      deviceUrl.hostname
                    ) ? (
                      <IconDeviceMobile size="1.2rem" stroke={1.5} />
                    ) : (
                      <IconDeviceLaptop size="1.2rem" stroke={1.5} />
                    )}
                    <Text size="sm" c="dimmed">
                      {(() => {
                        switch (true) {
                          case /fcm\.googleapis\.com/i.test(deviceUrl.hostname):
                            return 'Android Device';
                          case /apple/i.test(deviceUrl.hostname):
                            return 'iOS Device';
                          case /mozilla/i.test(deviceUrl.hostname):
                            return 'Firefox Browser';
                          case /chrome/i.test(deviceUrl.hostname):
                            return 'Chrome Browser';
                          default:
                            return 'Web Browser';
                        }
                      })()}
                    </Text>
                    {isCurrentDevice && (
                      <Badge size="sm" variant="light">
                        Current Device
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => unsubscribeFromPush(sub.endpoint)}
                      size="sm"
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            );
          })}
          {!currentDeviceEndpoint && (
            <Button
              variant="light"
              onClick={subscribeToPush}
              leftSection={<IconDeviceLaptop size="1rem" />}
            >
              Subscribe This Device
            </Button>
          )}
        </Stack>
      </Stack>
      {user.email === 'erikcvisser@gmail.com' && (
        <Stack>
          <Title order={4} mt="md">
            Send Test Notification
          </Title>
          <TextInput
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={sendTestNotification} w="fit-content">
            Send Test Notification
          </Button>
        </Stack>
      )}
    </Container>
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}
