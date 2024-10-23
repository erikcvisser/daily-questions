'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccount, updateUserDetails } from '@/lib/actions';
import {
  Text,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Divider,
  Alert,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';

export default function ProfileDetails({ session }: { session: any }) {
  const user = session?.user;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [targetScore, setTargetScore] = useState(user.targetScore * 100);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        await signOut({ redirect: false });
        router.push('/');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setError(result.error || 'Failed to delete account');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleSave = async () => {
    try {
      const result = await updateUserDetails({
        name,
        targetScore: targetScore / 100,
      });
      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update user details');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <>
      {error && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}
      <Stack>
        <TextInput label="Email" value={user.email} readOnly disabled />
        {isEditing ? (
          <>
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <NumberInput
              label="Target score (%)"
              value={targetScore}
              onChange={(value) =>
                setTargetScore(typeof value === 'number' ? value : 0)
              }
              min={0}
              max={100}
              required
            />
          </>
        ) : (
          <>
            <TextInput label="Name" value={user.name} readOnly disabled />
            <NumberInput
              label="Target score (%)"
              value={user.targetScore * 100}
              readOnly
              description="What daily score do you consider a success?"
              disabled
            />
          </>
        )}
      </Stack>
      <Group justify="space-between" mt="xl">
        {isEditing ? (
          <Button onClick={handleSave} color="green">
            Save Changes
          </Button>
        ) : (
          <Button onClick={handleEdit} color="blue">
            Edit Profile
          </Button>
        )}
      </Group>
      <Divider my="xl" />
      <Title order={4} mb="md">
        Notifications
      </Title>
      <Text size="sm" mb="md">
        Configure push or email notifications, as reminders to answers your
        daily questions.
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Coming soon!
      </Text>
      <Divider my="xl" />
      <Title order={4} mb="md">
        Invite accountability partner
      </Title>
      <Text size="sm" mb="md">
        Invite a friend or partner to hold you accountable. He/she will be able
        able to see your submissions, and help you stay strong!
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Coming soon!
      </Text>
      <Divider my="xl" />
      <Title order={4} mb="md">
        Danger Zone
      </Title>

      <Button onClick={handleDeleteAccount} color="red" disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete Account'}
      </Button>
    </>
  );
}
