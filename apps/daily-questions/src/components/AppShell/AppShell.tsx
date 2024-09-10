import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  // Burger,
  Grid,
  GridCol,
  Group,
  Text,
} from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { IconHelpHexagonFilled } from '@tabler/icons-react';
import { Links } from '@/components/Header/Links';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export async function BasicAppShell({ children }: { children: any }) {
  const session = await auth();
  console.log(session?.user?.id);
  // const [burgerOpened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        //  collapsed: { mobile: !burgerOpened },
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShellHeader>
        <Grid>
          <GridCol span="auto">
            <Group h="100%" px="xl">
              {/* <Burger
                opened={burgerOpened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              /> */}
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
          <GridCol visibleFrom="md" span={1}>
            <ColorSchemeToggle />
          </GridCol>
        </Grid>
      </AppShellHeader>
      <AppShellNavbar p="md">
        <Links session={session} />
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
