'use client';
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Grid,
  UnstyledButton,
  GridCol,
  Group,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './AppShell.module.css';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { Links } from '@/components/Header/Links';
import Image from 'next/image';
import Link from 'next/link';
import { Session } from 'next-auth';
import { LoginLinks } from '@/components/Header/AuthComponents';

export function BasicAppShell({
  children,
  session,
}: {
  children: any;
  session: Session | undefined;
}) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const desktopOpened = session ? true : false;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: 200, md: 250, lg: 300 },
        breakpoint: 'sm',
        collapsed: { desktop: !desktopOpened, mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShellHeader px="md">
        <Grid align="center" justify="space-between">
          <GridCol span="content">
            <Group>
              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
                hiddenFrom="sm"
                size="sm"
              />
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  textDecoration: 'none',
                  alignItems: 'center',
                  color: 'inherit',
                  fontWeight: 'bold',
                }}
              >
                <Image
                  src="/android-chrome-192x192.png"
                  width={32}
                  height={32}
                  alt={''}
                />
                <Text p={16} size="xl" fw={'bold'}>
                  Daily Questions
                </Text>
              </Link>
            </Group>
          </GridCol>
          <GridCol span="content">
            <Group>
              <Group gap={64} visibleFrom="sm" mr={32}>
                <UnstyledButton
                  className={classes.control}
                  component="a"
                  href="/"
                >
                  Home
                </UnstyledButton>
                <UnstyledButton
                  className={classes.control}
                  component="a"
                  href="/about"
                >
                  About
                </UnstyledButton>
                {!session && <LoginLinks />}
              </Group>
              <ColorSchemeToggle />
            </Group>
          </GridCol>
        </Grid>
      </AppShellHeader>
      <AppShellNavbar p="md" zIndex={1000}>
        <Links session={session} toggleMobile={toggleMobile} />
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
