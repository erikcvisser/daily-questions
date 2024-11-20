'use client';
import { useState } from 'react';
import { Modal, TextInput, Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { shareOverview } from '@/lib/actions';

interface ShareModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ShareModal({ opened, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await shareOverview(email);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Invitation sent successfully',
          color: 'green',
        });
        onClose();
        setEmail('');
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to send invitation',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  console.log('opened', opened);
  return (
    <Modal opened={opened} onClose={onClose} title="Share Overview">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Text size="sm" c="dimmed">
            Enter the email address of the person you want to share your
            overview with.
          </Text>
          <TextInput
            required
            label="Email"
            placeholder="example@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <Button type="submit" loading={loading}>
            Send Invitation
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
