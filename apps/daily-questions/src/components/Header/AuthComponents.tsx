'use client';

import { Modal, NavLink, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CombiForm } from '@/components/Authenticate/CombiForm';
import { IconLogin2 } from '@tabler/icons-react';

export function LoginLinks({
  handleLinkClick,
}: {
  handleLinkClick?: () => void;
}) {
  const [loginOpened, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);

  const handleLoginClick = () => {
    openLogin();
    if (handleLinkClick) {
      handleLinkClick();
    }
  };

  return (
    <>
      <Modal
        opened={loginOpened}
        onClose={closeLogin}
        title="Sign in or sign up"
      >
        <CombiForm />
      </Modal>
      <NavLink
        onClick={handleLoginClick}
        label="Sign in"
        leftSection={<IconLogin2 stroke={1} />}
      />
    </>
  );
}

export function LoginLinkUnstyled() {
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
      <UnstyledButton onClick={openLogin}>
        Sign in
      </UnstyledButton>
    </>
  );
}
