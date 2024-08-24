'use client';
import { AppShell, Burger, Group, NavLink, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { IconHome2 } from '@tabler/icons-react';

export function BasicAppShell({
  user,
  children,
}: {
  user: any;
  children: any;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <h3>Daily Questions</h3>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          component={Link}
          label="Home"
          href="/"
          leftSection={<IconHome2 size="1rem" stroke={1.5} />}
        />
        {!user && (
          <>
            <NavLink
              component={Link}
              label="Register"
              href="/register"
              className="text-ct-dark-600"
            />
            <NavLink
              component={Link}
              label="Login"
              href="/login"
              className="text-ct-dark-600"
            />
          </>
        )}
        {user && (
          <>
            <NavLink
              component={Link}
              label="Questions"
              href="/questions"
              className="text-ct-dark-600"
            />
            <Group>
              <NavLink
                component={Link}
                label="Profile"
                href="/profile"
                className="text-ct-dark-600"
              />
              <NavLink
                component={Link}
                label="Logout"
                href="/api/auth/signout"
                className="text-ct-dark-600"
              />
            </Group>
          </>
        )}
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={32} mt="sm" animate={false} />
          ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
