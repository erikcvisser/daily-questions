import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/components/theme';
import { BasicAppShell } from '@/components/AppShell/AppShell';

export const metadata = {
  title: 'Daily Questions',
  description: 'I am using Mantine with Next.js!',
};

export default async function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <BasicAppShell>
            <Notifications />
            {children}
          </BasicAppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
