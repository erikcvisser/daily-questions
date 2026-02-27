'use client';
import { Table } from '@mantine/core';
import { DeviceToken, Question, Submission, User } from '@prisma/client';
import { useState } from 'react';

type SortConfig = {
  key:
    | keyof (User & {
        submissions: Submission[];
        questions: Question[];
      })
    | 'submissionCount'
    | 'lastSubmission'
    | 'hasIos';
  direction: 'asc' | 'desc';
};

export function AdminTable({
  users,
}: {
  users: (User & {
    submissions: Submission[];
    questions: Question[];
    deviceTokens: DeviceToken[];
  })[];
}) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue, bValue;
    switch (sortConfig.key) {
      case 'submissionCount':
        aValue = a.submissions.length;
        bValue = b.submissions.length;
        break;
      case 'lastSubmission':
        aValue = a.submissions[0]?.createdAt || new Date(0);
        bValue = b.submissions[0]?.createdAt || new Date(0);
        break;
      case 'emailNotificationsEnabled':
        aValue = a.emailNotificationsEnabled ? 'Yes' : 'No';
        bValue = b.emailNotificationsEnabled ? 'Yes' : 'No';
        break;
      case 'hasIos':
        aValue = a.deviceTokens.some((t) => t.platform === 'ios') ? 1 : 0;
        bValue = b.deviceTokens.some((t) => t.platform === 'ios') ? 1 : 0;
        break;
      case 'pushNotificationsEnabled':
        aValue = a.pushNotificationsEnabled ? 1 : 0;
        bValue = b.pushNotificationsEnabled ? 1 : 0;
        break;
      default:
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
    }

    if (aValue === null || bValue === null) return 0;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current?.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th
            onClick={() => handleSort('email')}
            style={{ cursor: 'pointer' }}
          >
            Email{' '}
            {sortConfig?.key === 'email' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('id')}
            style={{ cursor: 'pointer' }}
          >
            UserID{' '}
            {sortConfig?.key === 'id' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('createdAt')}
            style={{ cursor: 'pointer' }}
          >
            Created on{' '}
            {sortConfig?.key === 'createdAt' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('questions')}
            style={{ cursor: 'pointer' }}
          >
            # Questions{' '}
            {sortConfig?.key === 'questions' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('lastSubmission')}
            style={{ cursor: 'pointer' }}
          >
            Last Submission{' '}
            {sortConfig?.key === 'lastSubmission' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('submissionCount')}
            style={{ cursor: 'pointer' }}
          >
            # Subm{' '}
            {sortConfig?.key === 'submissionCount' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('emailNotificationsEnabled')}
            style={{ cursor: 'pointer' }}
          >
            Email Not
            {sortConfig?.key === 'emailNotificationsEnabled' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('hasIos')}
            style={{ cursor: 'pointer' }}
          >
            iOS{' '}
            {sortConfig?.key === 'hasIos' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('pushNotificationsEnabled')}
            style={{ cursor: 'pointer' }}
          >
            Push Not{' '}
            {sortConfig?.key === 'pushNotificationsEnabled' &&
              (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedUsers.map((user) => (
          <Table.Tr key={user.id}>
            <Table.Td>{user.email}</Table.Td>
            <Table.Td>{user.id}</Table.Td>
            <Table.Td>{formatDate(user.createdAt)}</Table.Td>
            <Table.Td>{user.questions.length}</Table.Td>
            <Table.Td>{formatDate(user.submissions[0]?.createdAt)}</Table.Td>
            <Table.Td>{user.submissions.length}</Table.Td>
            <Table.Td>{user.emailNotificationsEnabled ? 'Yes' : 'No'}</Table.Td>
            <Table.Td>
              {user.deviceTokens.some((t) => t.platform === 'ios')
                ? 'Yes'
                : 'No'}
            </Table.Td>
            <Table.Td>{user.pushNotificationsEnabled ? 'Yes' : 'No'}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
