import { auth } from '@/lib/auth';
import ProfileDetails from '@/components/Profile/ProfileDetails';
import { Container, Title, Space } from '@mantine/core';

export default async function ProfilePage() {
  const session = await auth();

  return (
    <Container size="xl">
      <Title order={2}>Profile</Title>
      <Space h="xl" />
      <ProfileDetails session={session} />
    </Container>
  );
}
