'use client';

import { Modal, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LoginForm } from '@/app/login/login-form';
import { RegisterForm } from '@/app/register/register-form';
import { IconUserPlus, IconLogin } from '@tabler/icons-react';
import Link from 'next/link';

export function LoginLinks() {
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
  );
}
