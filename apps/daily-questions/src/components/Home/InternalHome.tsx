import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Card,
} from '@mantine/core';
import { IconClipboardList, IconInfoSquare } from '@tabler/icons-react';
import Questionnaire from '@/components/Questionnaire/Questionnaire';

export default function InternalHome({
  userQuestions,
}: {
  userQuestions: any[];
}) {
  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={2} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            Welcome back to Daily Questions
          </Title>
          <Button
            leftSection={<IconClipboardList size={20} />}
            color="blue"
            component="a"
            href="/overview"
            style={{ flexShrink: 0 }}
          >
            View History
          </Button>
        </Group>

        <Card shadow="sm" padding="lg" withBorder>
          {userQuestions.length > 0 ? (
            <>
              <Text size="lg" fw={500} mb="md">
                Ready for today&apos;s reflection?
              </Text>
              <Questionnaire />
            </>
          ) : (
            <Stack align="center" gap="md">
              <IconInfoSquare size={48} />
              <Text size="lg" fw={500} ta="center">
                No questions configured yet
              </Text>
              <Text c="dimmed" ta="center">
                Set up your daily questions to start your reflection journey.
              </Text>
              <Button color="blue" component="a" href="/questions/new">
                Configure Questions
              </Button>
            </Stack>
          )}
        </Card>
      </Stack>
    </Container>
  );
}
