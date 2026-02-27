import {
  Container,
  Title,
  Text,
  List,
  ListItem,
  Divider,
  Anchor,
} from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Daily Questions - learn how we handle your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">
        Privacy Policy
      </Title>
      <Text c="dimmed" mb="xl">
        Last updated: February 27, 2026
      </Text>

      <Text mb="md">
        Daily Questions (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the
        website and mobile application at dailyquestions.app. This Privacy Policy explains how
        we collect, use, and protect your personal information when you use our service.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        1. Information We Collect
      </Title>
      <Title order={4} mt="md" mb="xs">
        Account Information
      </Title>
      <Text mb="sm">
        When you create an account, we collect your name and email address.
      </Text>

      <Title order={4} mt="md" mb="xs">
        Daily Question Responses
      </Title>
      <Text mb="sm">
        We store your daily question answers and scores so you can track your progress over
        time. This data is associated with your account and is private to you.
      </Text>

      <Title order={4} mt="md" mb="xs">
        Device Information
      </Title>
      <Text mb="sm">
        If you enable push notifications, we collect your device token and timezone to
        deliver reminders at the right time.
      </Text>

      <Title order={4} mt="md" mb="xs">
        Usage Analytics
      </Title>
      <Text mb="sm">
        We use PostHog to collect anonymized usage data such as page views and feature
        interactions. This helps us understand how the app is used and where we can improve.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        2. How We Use Your Information
      </Title>
      <Text mb="sm">We use the information we collect to:</Text>
      <List mb="md" spacing="xs">
        <ListItem>Provide and maintain the Daily Questions service</ListItem>
        <ListItem>Send you push notification reminders at your preferred time</ListItem>
        <ListItem>Display your progress and historical data</ListItem>
        <ListItem>Improve the app based on usage patterns</ListItem>
        <ListItem>Respond to support requests</ListItem>
      </List>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        3. Third-Party Services
      </Title>
      <Text mb="sm">We use the following third-party services:</Text>
      <List mb="md" spacing="xs">
        <ListItem>
          <strong>PostHog</strong> — Analytics to understand app usage. PostHog may collect
          anonymized usage data. See their{' '}
          <Anchor href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
            privacy policy
          </Anchor>
          .
        </ListItem>
        <ListItem>
          <strong>Firebase Cloud Messaging</strong> — Push notification delivery. Google may
          process device tokens. See{' '}
          <Anchor href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
            Firebase privacy
          </Anchor>
          .
        </ListItem>
      </List>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        4. Data Storage and Security
      </Title>
      <Text mb="md">
        Your data is stored securely using industry-standard encryption in transit (HTTPS/TLS).
        We take reasonable measures to protect your personal information from unauthorized
        access, alteration, or destruction. However, no method of electronic transmission or
        storage is 100% secure.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        5. Your Rights
      </Title>
      <Text mb="sm">You have the right to:</Text>
      <List mb="md" spacing="xs">
        <ListItem>Access the personal data we hold about you</ListItem>
        <ListItem>Request correction of inaccurate data</ListItem>
        <ListItem>Request deletion of your account and all associated data</ListItem>
        <ListItem>Export your data in a portable format</ListItem>
        <ListItem>Withdraw consent for push notifications at any time via your device settings</ListItem>
      </List>
      <Text mb="md">
        If you are located in the European Economic Area (EEA), you have additional rights
        under the General Data Protection Regulation (GDPR), including the right to lodge a
        complaint with a supervisory authority.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        6. Data Retention
      </Title>
      <Text mb="md">
        We retain your data for as long as your account is active. If you delete your account,
        we will delete your personal data within 30 days, except where we are required by law
        to retain it.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        7. Children&apos;s Privacy
      </Title>
      <Text mb="md">
        Daily Questions is not intended for children under the age of 13. We do not knowingly
        collect personal information from children under 13. If we become aware that we have
        collected personal information from a child under 13, we will take steps to delete that
        information.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        8. Changes to This Policy
      </Title>
      <Text mb="md">
        We may update this Privacy Policy from time to time. We will notify you of any
        significant changes by posting the new policy on this page and updating the &quot;Last
        updated&quot; date.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        9. Contact Us
      </Title>
      <Text mb="xl">
        If you have questions about this Privacy Policy or wish to exercise your rights, please
        contact us at{' '}
        <Anchor href="mailto:hello@dailyquestions.app">hello@dailyquestions.app</Anchor>.
      </Text>
    </Container>
  );
}
