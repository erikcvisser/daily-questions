import OverviewContent from './content';
import { Container, Title } from '@mantine/core';

export default function OverviewPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  return (
    <Container size="xl" mt="lg">
      <Title order={2} mb="md">
        Overview of your submissions
      </Title>
      <OverviewContent searchParams={searchParams} />
    </Container>
  );
}
