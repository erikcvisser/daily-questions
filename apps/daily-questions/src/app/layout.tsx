import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@/app/global.css';

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/components/theme';
import { BasicAppShell } from '@/components/AppShell/AppShell';
import { auth } from '@/lib/auth';
import type { Metadata, Viewport } from 'next';
import { CSPostHogProvider } from './providers';

const APP_NAME = 'Daily Questions';
const APP_DEFAULT_TITLE = 'Daily Questions';
const APP_TITLE_TEMPLATE = '%s - Daily Questions';
const APP_DESCRIPTION = 'Your guide to a better day every day';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/android-chrome-192x192.png' },
  ],
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#FFFFFF',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <CSPostHogProvider>
        <head>
          <ColorSchemeScript />
        </head>
        <body>
          <MantineProvider theme={theme}>
            <BasicAppShell session={session ?? undefined}>
              <Notifications />
              {children}
            </BasicAppShell>
          </MantineProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
