'use client';

import { Table, Grid, Paper, Title, Text } from '@mantine/core';

function formatRepeatPattern(repeat: any) {
  if (!repeat) return '-';
  if (repeat.cron) return `Cron: ${repeat.cron}`;
  if (repeat.every) return `Every: ${repeat.every}ms`;
  return JSON.stringify(repeat);
}

export function QueueDashboard({
  data,
}: {
  data: {
    counts: Record<string, number>;
    jobs: Record<
      string,
      Array<{
        id: string;
        data: { userId: string };
        timestamp: string;
        processedOn?: string;
        finishedOn?: string;
        repeat?: { cron?: string; every?: number };
        failedReason?: string;
      }>
    >;
  };
}) {
  return (
    <div>
      <Grid mb="lg">
        {Object.entries(data.counts).map(([status, count]) => (
          <Grid.Col span={{ base: 12, xs: 6, md: 2.4 }} key={status}>
            <Paper shadow="xs" p="md">
              <Title order={4} tt="capitalize">
                {status}
              </Title>
              <Text size="xl">{count}</Text>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      {Object.entries(data.jobs).map(
        ([status, jobs]) =>
          jobs.length > 0 && (
            <div key={status} mb="lg">
              <Title order={2} tt="capitalize" mb="md">
                {status} Jobs
              </Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Processed</Table.Th>
                    <Table.Th>Finished</Table.Th>
                    <Table.Th>Repeat</Table.Th>
                    {status === 'failed' && <Table.Th>Error</Table.Th>}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {jobs.map((job: any) => (
                    <Table.Tr key={job.id}>
                      <Table.Td>{job.id}</Table.Td>
                      <Table.Td>{job.data.userId}</Table.Td>
                      <Table.Td>{job.timestamp}</Table.Td>
                      <Table.Td>{job.processedOn || '-'}</Table.Td>
                      <Table.Td>{job.finishedOn || '-'}</Table.Td>
                      <Table.Td>{formatRepeatPattern(job.repeat)}</Table.Td>
                      {status === 'failed' && (
                        <Table.Td className="text-red-500">
                          {job.failedReason}
                        </Table.Td>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          )
      )}
    </div>
  );
}
