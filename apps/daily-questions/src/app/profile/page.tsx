import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileDetails from '@/components/Profile/ProfileDetails';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sharedByMe: {
        where: { status: 'ACTIVE' },
        include: {
          recipient: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      sharedWithMe: {
        where: { status: 'ACTIVE' },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      pushSubscriptions: true,
    },
  });
  const sharedOverviews = await prisma.sharedOverview.findMany({
    where: {
      email: user?.email || '',
    },
    include: {
      owner: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <ProfileDetails user={user} sharedOverviews={sharedOverviews} />
    </>
  );
}
