import Link from 'next/link';
import { NavLink, Stack } from '@mantine/core';

import {
  IconCalendarMonth,
  IconHome2,
  IconLogout,
  IconQuestionMark,
  IconUserCircle,
} from '@tabler/icons-react';
import { auth } from '@/lib/auth';
import { LoginLinks } from './AuthComponents';

export const experimental_ppr = true;

export async function Links() {
  const session = await auth();

  return (
    <>
      <NavLink
        component={Link}
        label="Home"
        href="/"
        leftSection={<IconHome2 stroke={1} />}
      />
      {!session?.user && <LoginLinks />}
      {session?.user && (
        <>
          <NavLink
            component={Link}
            label="Questions"
            href="/questions"
            leftSection={<IconQuestionMark stroke={1} />}
          />
          <NavLink
            component={Link}
            label="Overview"
            href="/overview"
            leftSection={<IconCalendarMonth stroke={1} />}
          />
        </>
      )}
      {session?.user && (
        <>
          <Stack justify="flex-start">
            <NavLink
              component={Link}
              label="Profile"
              href="/profile"
              leftSection={<IconUserCircle stroke={1} />}
            />
            <NavLink
              component={Link}
              label="Logout"
              href="/api/auth/signout"
              leftSection={<IconLogout stroke={1} />}
            />
          </Stack>
        </>
      )}
    </>
  );
}
