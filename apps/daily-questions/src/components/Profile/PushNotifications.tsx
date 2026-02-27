'use client';

import { Switch, Text, Group, Card, Container } from '@mantine/core';
import { updatePushNotifications } from '@/lib/actions';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

export function PushNotifications({
  initialEnabled = true,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const handleToggle = async (checked: boolean) => {
    try {
      const result = await updatePushNotifications(checked);
      if (result.success) {
        setEnabled(checked);
        notifications.show({
          title: 'Success',
          message: checked
            ? 'Push notifications enabled'
            : 'Push notifications disabled',
          color: 'green',
        });
      } else {
        throw new Error(result.error || 'Failed to update notifications');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update push notifications',
        color: 'red',
      });
      setEnabled(!checked);
    }
  };

  return (
    <Container size="lg" ml="0" p="0" miw={{ base: '100%', md: '500px' }}>
      <Card withBorder>
        <Group>
          <Text>Push Notifications</Text>
          <Switch
            checked={enabled}
            onChange={(event) => handleToggle(event.currentTarget.checked)}
            label={enabled ? 'Enabled' : 'Disabled'}
          />
        </Group>
      </Card>
    </Container>
  );
}
