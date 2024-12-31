'use client';

import { Switch, Text, Group, Card, Container } from '@mantine/core';
import { updateEmailNotifications } from '@/lib/actions';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

export function EmailNotifications({
  initialEnabled = false,
  userEmail,
}: {
  initialEnabled: boolean;
  userEmail: string | null;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const handleToggle = async (checked: boolean) => {
    try {
      const result = await updateEmailNotifications(checked);
      if (result.success) {
        setEnabled(checked);
        notifications.show({
          title: 'Success',
          message: checked
            ? 'Email notifications enabled'
            : 'Email notifications disabled',
          color: 'green',
        });
      } else {
        throw new Error(result.error || 'Failed to update notifications');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update email notifications',
        color: 'red',
      });
      setEnabled(!checked); // Revert the toggle
    }
  };

  if (!userEmail) {
    return (
      <div>
        <Text>Email Notifications</Text>
        <Text>
          You need to add an email address to your account to enable email
          notifications.
        </Text>
      </div>
    );
  }

  return (
    <Container size="lg" ml="0" p="0" miw={{ base: '100%', md: '500px' }}>
      <Card withBorder>
        <Group>
          <Text>Email Notifications</Text>
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
