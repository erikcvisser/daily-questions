'use client';

import {
  Container,
  Title,
  Tabs,
  TabsTab,
  TabsList,
  TabsPanel,
} from '@mantine/core';
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
}

export function Admin({
  users,
  libraryQuestions,
  categories,
  queueData,
}: AdminProps) {
  return (
    <Container size="xl" mt="lg">
      <Title order={2} mb="lg">
        Admin Dashboard
      </Title>
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
