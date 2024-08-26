'use client';

import { Button, Container, Title, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function Index() {
  return (
    <Container>
      <Title order={1}>Welcome to Daily Questions</Title>
      <Text>Lorum ipsum </Text>

      <Button
        mt={16}
        onClick={() =>
          notifications.show({
            id: 'hello-there',
            position: 'bottom-right',
            withCloseButton: true,
            onClose: () => console.log('unmounted'),
            onOpen: () => console.log('mounted'),
            autoClose: false,
            title: "You've been compromised",
            message: 'Leave the building immediately',
            color: 'red',
            className: 'my-notification-class',
            style: { backgroundColor: 'red' },
            loading: false,
          })
        }
      >
        Show notification
      </Button>
    </Container>
  );
}
