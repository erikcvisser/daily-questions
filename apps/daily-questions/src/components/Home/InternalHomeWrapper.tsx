import { Container, Stack, Group, Title, Text, Button } from '@mantine/core';
import { IconClipboardList } from '@tabler/icons-react';
import InternalHome from './InternalHome';
import { Suspense } from 'react';
import Link from 'next/link';

export default async function InternalHomeWrapper() {
  return (
    <Container size="xl" mt="lg">
      <Stack gap="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={2} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            Welcome back
            <Text visibleFrom="lg" component="span" display="inline" inherit>
              {' '}
              to Daily Questions
            </Text>
            !
          </Title>

          <Button
            leftSection={<IconClipboardList size={20} />}
            color="blue"
            component={Link}
            href="/overview"
            style={{ flexShrink: 0 }}
          >
            <Text visibleFrom="xs">View History</Text>
          </Button>
        </Group>

        <Suspense fallback={<div>Loading...</div>}>
          <InternalHome />
        </Suspense>
      </Stack>
    </Container>
  );
}
