'use client';

import {
  Container,
  Title,
  Tabs,
  TabsTab,
  TabsList,
  TabsPanel,
  Button,
  Group,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import LibraryQuestionManager from './LibraryQuestion';
import CategoryManager from './Category';
import { AdminTable } from './AdminTable';
import { QueueDashboard } from './QueueDashboard';
import {
  User,
  Submission,
  Question,
  LibraryQuestion,
  Category,
} from '@prisma/client';

interface AdminProps {
  users: (User & { submissions: Submission[]; questions: Question[] })[];
  libraryQuestions: (LibraryQuestion & { category: Category })[];
  categories: Category[];
  queueData: any;
  refresh: () => Promise<void>;
}

export function Admin({
  users,
  libraryQuestions,
  categories,
  queueData,
  refresh,
}: AdminProps) {
  return (
    <Container size="xl" mt="lg">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Admin Dashboard</Title>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={() => refresh()}
          variant="light"
        >
          Refresh Data
        </Button>
      </Group>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTab value="users">Users</TabsTab>
          <TabsTab value="library-questions">Library Questions</TabsTab>
          <TabsTab value="categories">Categories</TabsTab>
          <TabsTab value="queue">Queue</TabsTab>
        </TabsList>

        <TabsPanel value="users">
          <AdminTable users={users} />
        </TabsPanel>

        <TabsPanel value="library-questions">
          <LibraryQuestionManager
            libraryQuestions={libraryQuestions}
            categories={categories}
          />
        </TabsPanel>

        <TabsPanel value="categories">
          <CategoryManager categories={categories} />
        </TabsPanel>

        <TabsPanel value="queue">
          <QueueDashboard data={queueData} />
        </TabsPanel>
      </Tabs>
    </Container>
  );
}
