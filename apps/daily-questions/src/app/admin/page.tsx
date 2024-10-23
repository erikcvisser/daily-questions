import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminTable } from '@/components/Admin/AdminTable';
import prisma from '@/lib/prisma';
import {
  Container,
  Title,
  Tabs,
  TabsTab,
  TabsList,
  TabsPanel,
} from '@mantine/core';
import { getLibraryQuestions, getCategories } from '@/lib/actions';
import LibraryQuestionManager from '@/components/Admin/LibraryQuestion';
import CategoryManager from '@/components/Admin/Category';

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.email !== 'erikcvisser@gmail.com') {
    redirect('/');
  }

  const users = await prisma.user.findMany({
    include: {
      Submission: {
        orderBy: { date: 'desc' },
      },
      questions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const libraryQuestions = await getLibraryQuestions();
  const categories = await getCategories();

  return (
    <Container size="lg">
      <Title order={2} mb={'lg'}>
        Admin Dashboard
      </Title>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTab value="users">Users</TabsTab>
          <TabsTab value="library-questions">Library Questions</TabsTab>
          <TabsTab value="categories">Categories</TabsTab>
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
      </Tabs>
    </Container>
  );
}
