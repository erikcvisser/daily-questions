'use client';
import Link from 'next/link';
import { NavLink, Stack } from '@mantine/core';
import { usePathname } from 'next/navigation';

import {
  IconCalendarMonth,
  IconHome2,
  IconLogout,
  IconQuestionMark,
  IconUserCircle,
} from '@tabler/icons-react';
import { LoginLinks } from './AuthComponents';

export const experimental_ppr = true;

export function Links({ session }: { session: any }) {
  const pathname = usePathname();

  return (
    <>
      <NavLink
        component={Link}
        label="Home"
        href="/"
        active={pathname === '/'}
        leftSection={<IconHome2 stroke={1} />}
      />
      {!session?.user && <LoginLinks />}
      {session?.user && (
        <>
          <NavLink
            component={Link}
            label="Questions"
            href="/questions"
            active={pathname === '/questions'}
            leftSection={<IconQuestionMark stroke={1} />}
          />
          <NavLink
            component={Link}
            label="Overview"
            href="/overview"
            active={pathname === '/overview'}
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
              active={pathname === '/profile'}
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
