'use client';

import { Modal, NavLink, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LoginForm } from '@/app/login/login-form';
import { RegisterForm } from '@/app/register/register-form';
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
      <UnstyledButton component={Link} href="#" onClick={openRegister}>
        Register
      </UnstyledButton>
      <UnstyledButton component={Link} href="#" onClick={openLogin}>
        Sign in
      </UnstyledButton>
    </>
  );
}
