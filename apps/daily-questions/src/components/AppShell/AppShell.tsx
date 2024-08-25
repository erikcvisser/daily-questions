'use client';
import {
  AppShell,
  Burger,
  Group,
  Modal,
  NavLink,
  Stack,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import {
  IconCalendarMonth,
  IconHelpHexagonFilled,
  IconHome2,
  IconLogin,
  IconLogout,
  IconQuestionMark,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { LoginForm } from '../../app/login/login-form';
import { RegisterForm } from '../../app/register/register-form';
import { Notifications } from '@mantine/notifications';

export function BasicAppShell({
  user,
  children,
}: {
  user: any;
  children: any;
}) {
  const [burgerOpened, { toggle }] = useDisclosure();
  const [loginOpened, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);
  const [registerOpened, { open: openRegister, close: closeRegister }] =
    useDisclosure(false);

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
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          component={Link}
          label="Home"
          href="/"
          leftSection={<IconHome2 stroke={1} />}
        />
        {!user && (
          <>
            <NavLink
              component={Link}
              label="Register"
              href="#"
              onClick={openRegister}
              leftSection={<IconUserPlus stroke={1} />}
            />
            <NavLink
              component={Link}
              label="Login"
              href="#"
              onClick={openLogin}
              leftSection={<IconLogin stroke={1} />}
            />
          </>
        )}
        {user && (
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
        {user && (
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
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <Modal opened={loginOpened} onClose={closeLogin} title="Log in">
        <LoginForm onLoginSuccess={closeLogin} />
      </Modal>
      <Modal opened={registerOpened} onClose={closeRegister} title="Register">
        <RegisterForm />
      </Modal>
    </AppShell>
  );
}
