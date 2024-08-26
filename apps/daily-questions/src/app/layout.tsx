import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/components/theme';
import { BasicAppShell } from '@/components/AppShell/AppShell';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Daily Questions',
  description: 'I am using Mantine with Next.js!',
};

export default async function RootLayout({ children }: { children: any }) {
  const session = await auth();
  const user = session?.user || null;

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <BasicAppShell user={user}>{children}</BasicAppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
