'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  Grid,
  Paper,
  Title,
  Text,
  Button,
  Badge,
  Code,
  Loader,
  Group,
  Stack,
} from '@mantine/core';
import { getBullQueueData, removeBullJob } from '@/lib/actions';

interface QueueJob {
  id: string;
  key?: string;
  cron?: string;
  next?: string;
  data: Record<string, unknown>;
  state?: string;
  delay?: number;
  timestamp?: number;
}

interface QueueData {
  repeatableJobs: QueueJob[];
  delayedJobs: QueueJob[];
  jobs: QueueJob[];
  counts: Record<string, number>;
}

export function QueueDashboard() {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getBullQueueData();
      setQueueData(data);
    } catch (error) {
      console.error('Failed to fetch queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (jobId: string, type: 'regular' | 'repeatable') => {
    try {
      await removeBullJob(jobId, type);
      fetchData();
    } catch (error) {
      console.error('Failed to remove job:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Group justify="center">
        <Loader />
        <Text>Loading queue data...</Text>
      </Group>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'green',
      active: 'blue',
      waiting: 'yellow',
      failed: 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <Stack gap="xl">
      <Paper withBorder radius="md" p="md">
        <Title order={2} size="h3" mb="md">
          Queue Status
        </Title>
        <Grid>
          {queueData?.jobCounts &&
            Object.entries(queueData.jobCounts).map(([state, cnt]) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={state}>
                <Paper withBorder p="md" radius="md">
                  <Text size="sm" c="dimmed" tt="capitalize">
                    {state}
                  </Text>
                  <Text size="xl" fw={700}>
                    {cnt as number}
                  </Text>
                </Paper>
              </Grid.Col>
            ))}
        </Grid>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Title order={2} size="h3" mb="md">
          Repeatable Jobs
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>UserID</Table.Th>
              <Table.Th>Pattern</Table.Th>
              <Table.Th>Next Run</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {queueData?.repeatableJobs?.map((job) => (
              <Table.Tr key={job.key}>
                <Table.Td>{job.id}</Table.Td>
                <Table.Td>
                  <Code>{job.cron}</Code>
                </Table.Td>
                <Table.Td>{formatDistanceToNow(new Date(job.next))}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => removeJob(job.key, 'repeatable')}
                  >
                    Remove
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Title order={2} size="h3" mb="md">
          Delayed Jobs
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Data</Table.Th>
              <Table.Th>Delayed Until</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {queueData?.delayedJobs?.map((job) => (
              <Table.Tr key={job.id}>
                <Table.Td>{job.id}</Table.Td>
                <Table.Td>
                  <Code block>{JSON.stringify(job.data, null, 2)}</Code>
                </Table.Td>
                <Table.Td>{formatDistanceToNow(new Date(job.delay))}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => removeJob(job.id, 'regular')}
                  >
                    Remove
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Title order={2} size="h3" mb="md">
          Recent Jobs
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>State</Table.Th>
              <Table.Th>Data</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {queueData?.jobs?.map((job) => (
              <Table.Tr key={job.id}>
                <Table.Td>{job.id}</Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(job.state)}>{job.state}</Badge>
                </Table.Td>
                <Table.Td>
                  <Code block>{JSON.stringify(job.data, null, 2)}</Code>
                </Table.Td>
                <Table.Td>
                  {formatDistanceToNow(new Date(job.timestamp))}
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => removeJob(job.id, 'regular')}
                  >
                    Remove
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
