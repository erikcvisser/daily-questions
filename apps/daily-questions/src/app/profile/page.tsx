import { auth } from '@/lib/auth';
import ProfileDetails from '@/components/Profile/ProfileDetails';
import { Container, Title, Space } from '@mantine/core';
import prisma from '@/lib/prisma';

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
  });

  return (
    <Container size="xl" mt="lg">
      <Title order={2}>Profile</Title>
      <Space h="xl" />
      {user && <ProfileDetails user={user} />}
    </Container>
  );
}
