'use client';

import { Button, Container, Title, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function Index() {
  return (
    <Container>
      <Title order={1}>Welcome to Daily Questions</Title>
      <Text>Lorum ipsum </Text>
      <Title order={2} mt={8}>
        About
      </Title>
      <Text>
        This is a simple example of a Next.js application with Tailwind CSS.
      </Text>
      <Button
        onClick={() =>
          // Most used notification props
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
