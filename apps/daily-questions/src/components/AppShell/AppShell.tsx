'use client';
import {
  AppShell,
  Burger,
  Grid,
  GridCol,
  Group,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { IconHelpHexagonFilled } from '@tabler/icons-react';
import { Links } from '@/components/Header/Links';

export function BasicAppShell({
  user,
  children,
}: {
  user: any;
  children: any;
}) {
  const [burgerOpened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !burgerOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Grid>
          <GridCol span="auto">
            <Group h="100%" px="md">
              <Burger
                opened={burgerOpened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <ThemeIcon>
                <IconHelpHexagonFilled size={48} />
              </ThemeIcon>
              <h3>Daily Questions</h3>
            </Group>
          </GridCol>
          <GridCol visibleFrom="md" span={1}>
            <ColorSchemeToggle />
          </GridCol>
        </Grid>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Links />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
