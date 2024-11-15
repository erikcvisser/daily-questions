'use client';

import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CombiForm } from '@/components/Authenticate/CombiForm';

interface ButtonModalProps {
  buttonText: string;
  modalTitle: string;
  variant?: string;
  size?: string;
  mt?: string;
  mb?: string;
}

export function ButtonModal({
  buttonText,
  modalTitle,
  variant = 'filled',
  size = 'lg',
  mt = 'xl',
  mb,
}: ButtonModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant={variant} size={size} mt={mt} mb={mb} onClick={open}>
        {buttonText}
      </Button>

      <Modal opened={opened} onClose={close} title={modalTitle}>
        <CombiForm onLoginSuccess={close} />
      </Modal>
    </>
  );
}
