'use client';

import { Modal, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CombiForm } from '@/components/Authenticate/CombiForm';
import Link from 'next/link';

export function LoginLinks() {
  const [loginOpened, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);
  return (
    <>
      <Modal
        opened={loginOpened}
        onClose={closeLogin}
        title="Sign in or sign up"
      >
        <CombiForm />
      </Modal>
      <UnstyledButton component={Link} href="#" onClick={openLogin}>
        Sign in
      </UnstyledButton>
    </>
  );
}
