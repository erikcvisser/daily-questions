'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteAccount,
  updateUserDetails,
  revokeSharedOverview,
  acceptSharedOverview,
  scheduleNotification,
} from '@/lib/actions';
import {
  Text,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Divider,
  Alert,
  Modal,
  Title,
  Box,
  Container,
  Paper,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconAlertCircle, IconX } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import InstallPrompt from '@/components/Profile/InstallPrompt';
import { User, SharedOverview } from '@prisma/client';
import { EmailNotifications } from '@/components/Profile/EmailNotifications';

interface ProfileDetailsProps {
  user: User & {
    sharedByMe: (SharedOverview & {
      recipient: { name: string | null; email: string | null } | null;
    })[];
    sharedWithMe: (SharedOverview & {
      owner: { name: string | null; email: string | null };
    })[];
  };
  sharedOverviews: (SharedOverview & {
    owner: User;
  })[];
}

export default function ProfileDetails({
  user,
  sharedOverviews,
}: ProfileDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [targetScore, setTargetScore] = useState(user.targetScore * 100);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationTime, setNotificationTime] = useState(
    user.notificationTime || '20:00'
  );

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
        name: name || '',
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

  const handleRevokeAccess = async (sharedOverviewId: string) => {
    try {
      const result = await revokeSharedOverview(sharedOverviewId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Access revoked successfully',
          color: 'green',
        });
        router.refresh();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to revoke access',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error revoking access:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    }
  };

  const handleAcceptInvite = async (sharedOverviewId: string) => {
    try {
      const result = await acceptSharedOverview(sharedOverviewId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Invite accepted successfully',
          color: 'green',
        });
        router.refresh();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to accept invite',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    }
  };

  const handleNotificationTimeChange = async (newTime: string) => {
    try {
      const result = await scheduleNotification(newTime);
      if (result.success) {
        setNotificationTime(newTime);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to update notification time',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to update notification time:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update notification time',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Container size="xl" my="xl">
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
        <Title order={4} mb="md">
          Your profile
        </Title>
        <Stack>
          <TextInput
            maw="500px"
            label="Email"
            value={user.email || ''}
            readOnly
            disabled
          />
          {isEditing ? (
            <>
              <TextInput
                maw="500px"
                label="Name"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <NumberInput
                maw="500px"
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
              <TextInput
                maw="500px"
                label="Name"
                value={user.name || ''}
                readOnly
                disabled
              />
              <NumberInput
                maw="500px"
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

        <InstallPrompt />
        <Divider my="xl" />

        <Title order={4} mb="md">
          Notifications
        </Title>
        <Text mb="md">
          Configure email notifications as reminders to answer your daily
          questions. For push notifications, use the iOS app.
        </Text>
        {user.emailNotificationsEnabled && (
          <Group align="center" mt="md" mb="md">
            <Text>Daily notification time:</Text>
            <TimeInput
              value={notificationTime}
              onChange={(event) =>
                handleNotificationTimeChange(event.currentTarget.value)
              }
            />
          </Group>
        )}
        <Stack>
          <EmailNotifications
            initialEnabled={user.emailNotificationsEnabled}
            userEmail={user.email}
          />
        </Stack>
        <Divider my="xl" />

        <Title order={4} mb="md">
          Invite accountability partner
        </Title>
        <Text mb="md">
          Invite a friend or partner to hold you accountable. They will be
          able to see your submissions and help you stay strong!
        </Text>

        <Container size="sm" ml="0" p="0">
          <Stack>
            {/* People I've shared with */}
            <Box>
              <Text fw={500} mb="xs">
                People who can see my overview
              </Text>
              {user.sharedByMe.length > 0 ? (
                user.sharedByMe
                  .filter((share) => share.status === 'ACTIVE')
                  .map((share) => (
                    <Paper key={share.id} withBorder p="xs" mb="xs">
                      <Group justify="space-between">
                        <Text>
                          {share.recipient?.name || share.email}{' '}
                          <Text span c="dimmed" size="sm">
                            ({share.recipient?.email || share.email})
                          </Text>
                        </Text>
                        <Button
                          variant="subtle"
                          color="red"
                          size="xs"
                          leftSection={<IconX size={14} />}
                          onClick={() => handleRevokeAccess(share.id)}
                        >
                          Revoke Access
                        </Button>
                      </Group>
                    </Paper>
                  ))
              ) : (
                <Text c="dimmed" size="sm">
                  You haven&apos;t shared your overview with anyone yet.
                </Text>
              )}
            </Box>

            {/* Overviews shared with me - both pending and accepted */}
            <Box mt="lg">
              <Text fw={500} mb="xs">
                Overviews shared with me
              </Text>
              {user.sharedWithMe.length > 0 || sharedOverviews.length > 0 ? (
                <>
                  {/* Show accepted shares */}
                  {user.sharedWithMe.map((share) => (
                    <Paper key={share.id} withBorder p="xs" mb="xs">
                      <Group justify="space-between">
                        <Text>
                          {share.owner.name || share.owner.email}{' '}
                          <Text span c="dimmed" size="sm">
                            ({share.owner.email})
                          </Text>
                        </Text>
                        <Button
                          variant="subtle"
                          color="red"
                          size="xs"
                          leftSection={<IconX size={14} />}
                          onClick={() => handleRevokeAccess(share.id)}
                        >
                          Remove Access
                        </Button>
                      </Group>
                    </Paper>
                  ))}

                  {/* Show pending invites */}
                  {sharedOverviews
                    .filter((share) => share.status === 'PENDING')
                    .map((share) => (
                      <Paper key={share.id} withBorder p="xs" mb="xs">
                        <Group justify="space-between">
                          <Text>
                            Invite from {share.owner.name} ({share.owner.email}){' '}
                            <Text span c="yellow" size="sm" ml="xs">
                              (Pending)
                            </Text>
                          </Text>
                          <Group gap="xs">
                            <Button
                              variant="subtle"
                              color="green"
                              size="xs"
                              onClick={() => handleAcceptInvite(share.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="subtle"
                              color="red"
                              size="xs"
                              leftSection={<IconX size={14} />}
                              onClick={() => handleRevokeAccess(share.id)}
                            >
                              Decline
                            </Button>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                </>
              ) : (
                <Text c="dimmed" size="sm">
                  No one has shared their overview with you yet.
                </Text>
              )}
            </Box>
          </Stack>
        </Container>
        <Divider my="xl" />

        <Title order={4} mb="md">
          Danger Zone
        </Title>

        <Modal
          opened={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
          centered
        >
          <Text size="sm" mb="xl">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </Group>
        </Modal>
        <Text mb="md">
          Delete your account and all your data. This action cannot be undone.
        </Text>
        <Button onClick={() => setShowDeleteModal(true)} color="red" mb="xl">
          Delete Account
        </Button>
      </Container>
    </>
  );
}
