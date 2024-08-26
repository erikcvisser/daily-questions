'use client';
import Link from 'next/link';
import { Modal, NavLink, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import {
  IconCalendarMonth,
  IconHome2,
  IconLogin,
  IconLogout,
  IconQuestionMark,
  IconUserCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { LoginForm } from '@/app/login/login-form';
import { RegisterForm } from '@/app/register/register-form';

export function Links() {
  //!remove
  const user = { user: null };

  const [loginOpened, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);
  const [registerOpened, { open: openRegister, close: closeRegister }] =
    useDisclosure(false);

  return (
    <>
      <Modal opened={loginOpened} onClose={closeLogin} title="Log in">
        <LoginForm onLoginSuccess={closeLogin} />
      </Modal>
      <Modal opened={registerOpened} onClose={closeRegister} title="Register">
        <RegisterForm />
      </Modal>
      <NavLink
        component={Link}
        label="Home"
        href="/"
        leftSection={<IconHome2 stroke={1} />}
      />
      {!user.user && (
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
      {user.user && (
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
    </>
  );
}
