'use client';

import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { sendEndOfYearEmailToAllUsers } from '@/lib/actions';

export function AdminControls() {
  const handleSendEndOfYearEmail = async () => {
    try {
      const result = await sendEndOfYearEmailToAllUsers();
      notifications.show({
        title: 'End of Year Email Sent',
        message: result.message,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send end of year email',
        color: 'red',
      });
    }
  };

  return (
    <Button onClick={handleSendEndOfYearEmail} color="blue">
      Send End of Year Email to Users
    </Button>
  );
}
