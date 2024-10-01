'use client';
import { Stack, List, ListItem, Space, Button } from '@mantine/core';
import { deleteAccount } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileDetails({ session }: { session: any }) {
  const user = session?.user;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        // Instead of calling signOut here, redirect to a server-side logout route
        router.push('/api/auth/signout');
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Stack>
      <List>
        <ListItem>Id: {user.id}</ListItem>
        <ListItem>Name: {user.name}</ListItem>
        <ListItem>Email: {user.email}</ListItem>
        <ListItem>Target score: {user.targetScore * 100}%</ListItem>
      </List>
      <Space h="md" />
      <Button onClick={handleDeleteAccount} color="red" disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete Account'}
      </Button>
    </Stack>
  );
}
