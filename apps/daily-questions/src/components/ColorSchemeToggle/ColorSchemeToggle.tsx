'use client';

import {
  ActionIcon,
  Button,
  Group,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSunMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const { toggleColorScheme } = useMantineColorScheme();

  return (
    <Group justify="center" h="100%" px="md">
      <ActionIcon
        color="gray"
        onClick={() => toggleColorScheme()}
        aria-label="toggle color scheme"
      >
        <IconSunMoon />
      </ActionIcon>
    </Group>
  );
}
