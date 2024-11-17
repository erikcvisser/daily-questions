'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  if (window.location.hostname !== 'localhost') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'always',
    });
  }
}

export function identifyPostHogUser(user) {
  if (user?.email) {
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
    });
  } else {
    posthog.reset();
  }
}

export function CSPostHogProvider({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
