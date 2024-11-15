'use client';
import { Table } from '@mantine/core';
import { Question, Submission, User } from '@prisma/client';

export function AdminTable({
  users,
}: {
  users: (User & { submissions: Submission[]; questions: Question[] })[];
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Email</Table.Th>
          <Table.Th>UserID</Table.Th>
          <Table.Th>Created on</Table.Th>
          <Table.Th># Questions </Table.Th>
          <Table.Th>Last Submission</Table.Th>
          <Table.Th># Subm</Table.Th>
          <Table.Th># PushSubs</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {users.map((user) => (
          <Table.Tr key={user.id}>
            <Table.Td>{user.email}</Table.Td>
            <Table.Td>{user.id}</Table.Td>
            <Table.Td>{formatDate(user.createdAt)}</Table.Td>
            <Table.Td>{user.questions.length}</Table.Td>
            <Table.Td>{formatDate(user.submissions[0]?.createdAt)}</Table.Td>
            <Table.Td>{user.submissions.length}</Table.Td>
            <Table.Td>{user.pushSubscriptions.length}</Table.Td>
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
