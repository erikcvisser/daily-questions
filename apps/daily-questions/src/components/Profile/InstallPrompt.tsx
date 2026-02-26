'use client';
import { Title, Stack, List, ListItem, Button, Text } from '@mantine/core';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
    );
    setIsAndroid(/Android/.test(navigator.userAgent));
    setIsDesktop(
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
  };

  if (isStandalone) return null;
  return (
    <>
      <Title order={4} mb="md">
        Install app
      </Title>
      <Text mb="md">
        Install the app on your phone for easier access and notifications.
      </Text>
      <Stack>
        {isIOS && (
          <>
            <Text>To install on iOS:</Text>
            <List>
              <ListItem>
                Tap the share button{' '}
                <span role="img" aria-label="share icon">
                  ⎋
                </span>
              </ListItem>
              <ListItem>
                Scroll down and tap &quot;Add to Home Screen&quot;{' '}
                <span role="img" aria-label="plus icon">
                  ➕
                </span>
              </ListItem>
              <ListItem>Tap &quot;Add&quot; to confirm</ListItem>
            </List>
          </>
        )}
        {isAndroid && (
          <>
            <Text>To install on Android:</Text>
            <List>
              <ListItem>Tap the menu (⋮) in your browser</ListItem>
              <ListItem>
                Tap &quot;Install app&quot; or &quot;Add to Home Screen&quot;
              </ListItem>
              <ListItem>Follow the installation prompts</ListItem>
            </List>
          </>
        )}
        {isDesktop && deferredPrompt && (
          <Button onClick={handleInstallClick} size="compact">
            Install App
          </Button>
        )}
        {isDesktop && (
          <>
            <Text>To install on Desktop:</Text>
            <List>
              <ListItem>
                Look for the install icon{' '}
                <span role="img" aria-label="install icon">
                  ⊕
                </span>{' '}
                in your browser&apos;s address bar
              </ListItem>
              <ListItem>Click it and select &quot;Install&quot;</ListItem>
              <ListItem>
                Or use Chrome menu (⋮) → &quot;Install [App Name]&quot;
              </ListItem>
            </List>
          </>
        )}
      </Stack>
    </>
  );
}
