'use client';
import Link from 'next/link';
import { NavLink, Stack } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { useViewportSize } from '@mantine/hooks';

import {
  IconCalendarMonth,
  IconHome2,
  IconLogout,
  IconQuestionMark,
  IconUserCircle,
  IconUsersGroup,
} from '@tabler/icons-react';
import { LoginLinks } from './AuthComponents';

export const experimental_ppr = true;

export function Links({
  session,
  toggleMobile,
}: {
  session: any;
  toggleMobile: () => void;
}) {
  const pathname = usePathname();
  const { width } = useViewportSize();

  const handleLinkClick = () => {
    if (width < 768) {
      toggleMobile();
    }
  };

  return (
    <>
      <Stack>
        <NavLink
          component={Link}
          label="Home"
          href="/"
          active={pathname === '/'}
          leftSection={<IconHome2 stroke={1} />}
          onClick={handleLinkClick}
        />
        <NavLink
          component={Link}
          label="About"
          href="/about"
          hiddenFrom="md"
          active={pathname === '/about'}
          leftSection={<IconUsersGroup stroke={1} />}
          onClick={handleLinkClick}
        />
        {!session?.user && <LoginLinks handleLinkClick={handleLinkClick} />}
        {session?.user && (
          <>
            <NavLink
              component={Link}
              label="Overview"
              href="/overview"
              active={pathname === '/overview'}
              leftSection={<IconCalendarMonth stroke={1} />}
              onClick={handleLinkClick}
            />
            <NavLink
              component={Link}
              label="Configure questions"
              href="/questions"
              active={pathname === '/questions'}
              leftSection={<IconQuestionMark stroke={1} />}
              onClick={handleLinkClick}
            />
          </>
        )}
      </Stack>
      {session?.user && (
        <>
          <Stack justify="flex-end" h={'100%'} mt={16}>
            <NavLink
              component={Link}
              label="Profile"
              href="/profile"
              active={pathname === '/profile'}
              leftSection={<IconUserCircle stroke={1} />}
              onClick={handleLinkClick}
            />
            <NavLink
              component={Link}
              label="Logout"
              href="/api/auth/signout"
              leftSection={<IconLogout stroke={1} />}
              onClick={handleLinkClick}
            />
          </Stack>
        </>
      )}
    </>
  );
}
