import { Container, List, ListItem, Title } from '@mantine/core';
import { auth } from '../../../auth';

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <Container>
      <Title order={1}>Profile</Title>
      <List>
        <ListItem>Id: {user?.id}</ListItem>
        <ListItem>Name: {user?.name}</ListItem>
        <ListItem>Email: {user?.email}</ListItem>
      </List>
    </Container>
  );
}
