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
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

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
        router.push('/login');
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
      <Text size="sm" c="dimmed" mb="md">
        Danger Zone
      </Text>
      <Button onClick={handleDeleteAccount} color="red" disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete Account'}
      </Button>
    </>
  );
}
