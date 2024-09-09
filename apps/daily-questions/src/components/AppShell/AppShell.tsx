import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  // Burger,
  Grid,
  GridCol,
  Group,
  ThemeIcon,
} from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { IconHelpHexagonFilled } from '@tabler/icons-react';
import { Links } from '@/components/Header/Links';

export function BasicAppShell({ children }: { children: any }) {
  // const [burgerOpened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        //  collapsed: { mobile: !burgerOpened },
      }}
      padding="md"
    >
      <AppShellHeader>
        <Grid>
          <GridCol span="auto">
            <Group h="100%" px="md">
              {/* <Burger
                opened={burgerOpened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              /> */}
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
      </AppShellHeader>
      <AppShellNavbar p="md">
        <Links />
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
