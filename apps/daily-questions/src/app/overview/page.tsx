import OverviewContent from './content';
import { Stack, Container, Title, Space } from '@mantine/core';

export default function OverviewPage() {
  return (
    <Container size="xl" mt="lg">
      <Stack>
        <Title order={2} mb="md">
          Overview of your submissions
        </Title>
        <OverviewContent />
      </Stack>
    </Container>
  );
}
