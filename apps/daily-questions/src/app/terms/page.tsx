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
  title: 'Terms of Service',
  description: 'Terms of Service for Daily Questions.',
};

export default function TermsOfServicePage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">
        Terms of Service
      </Title>
      <Text c="dimmed" mb="xl">
        Last updated: February 27, 2026
      </Text>

      <Text mb="md">
        Welcome to Daily Questions. By accessing or using our website and mobile application at
        dailyquestions.app (&quot;the Service&quot;), you agree to be bound by these Terms of
        Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the
        Service.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        1. Description of Service
      </Title>
      <Text mb="md">
        Daily Questions is a free personal growth platform that helps users build
        self-awareness through daily reflective questions. The Service allows you to set
        personal questions, receive daily reminders, record your responses, and track your
        progress over time. The methodology is inspired by Marshall Goldsmith&apos;s
        &quot;Triggers.&quot;
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        2. User Accounts
      </Title>
      <Text mb="sm">To use the Service, you must create an account. You agree to:</Text>
      <List mb="md" spacing="xs">
        <ListItem>Provide accurate and complete registration information</ListItem>
        <ListItem>Maintain the security of your password and account</ListItem>
        <ListItem>
          Accept responsibility for all activities that occur under your account
        </ListItem>
        <ListItem>Notify us immediately of any unauthorized use of your account</ListItem>
      </List>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        3. Acceptable Use
      </Title>
      <Text mb="sm">When using the Service, you agree not to:</Text>
      <List mb="md" spacing="xs">
        <ListItem>Violate any applicable laws or regulations</ListItem>
        <ListItem>Interfere with or disrupt the Service or its infrastructure</ListItem>
        <ListItem>Attempt to gain unauthorized access to any part of the Service</ListItem>
        <ListItem>Use the Service for any commercial purpose without our consent</ListItem>
        <ListItem>
          Upload or transmit malicious code, viruses, or other harmful material
        </ListItem>
      </List>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        4. Your Content
      </Title>
      <Text mb="md">
        You retain ownership of the content you create within the Service, including your
        questions and responses. By using the Service, you grant us a limited license to store
        and process your content solely for the purpose of providing the Service to you. We
        will not share your personal content with third parties except as described in our{' '}
        <Anchor href="/privacy">Privacy Policy</Anchor>.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        5. Intellectual Property
      </Title>
      <Text mb="md">
        The Service, including its design, features, and content (excluding user-generated
        content), is owned by Daily Questions and is protected by applicable intellectual
        property laws. You may not copy, modify, distribute, or create derivative works of the
        Service without our express written permission.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        6. Disclaimer of Warranties
      </Title>
      <Text mb="md">
        The Service is provided &quot;as is&quot; and &quot;as available&quot; without
        warranties of any kind, either express or implied, including but not limited to
        warranties of merchantability, fitness for a particular purpose, and non-infringement.
        We do not guarantee that the Service will be uninterrupted, secure, or error-free.
        Daily Questions is a self-reflection tool and does not provide professional advice in
        psychology, therapy, or any other field.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        7. Limitation of Liability
      </Title>
      <Text mb="md">
        To the maximum extent permitted by applicable law, Daily Questions and its founder,
        contributors, and affiliates shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, or any loss of profits or data, arising out of or
        related to your use of the Service.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        8. Termination
      </Title>
      <Text mb="md">
        We reserve the right to suspend or terminate your access to the Service at any time,
        with or without cause, and with or without notice. You may delete your account at any
        time through your profile settings. Upon termination, your right to use the Service
        will cease immediately, and we will delete your data in accordance with our{' '}
        <Anchor href="/privacy">Privacy Policy</Anchor>.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        9. Changes to These Terms
      </Title>
      <Text mb="md">
        We may modify these Terms at any time. If we make material changes, we will notify you
        by updating the &quot;Last updated&quot; date at the top of this page. Your continued
        use of the Service after any changes constitutes acceptance of the new Terms.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        10. Governing Law
      </Title>
      <Text mb="md">
        These Terms shall be governed by and construed in accordance with the laws of the
        Netherlands and applicable European Union regulations. Any disputes arising from these
        Terms or your use of the Service shall be subject to the exclusive jurisdiction of the
        courts of the Netherlands.
      </Text>

      <Divider my="lg" />

      <Title order={2} mb="sm">
        11. Contact Us
      </Title>
      <Text mb="xl">
        If you have questions about these Terms, please contact us at{' '}
        <Anchor href="mailto:hello@dailyquestions.app">hello@dailyquestions.app</Anchor>.
      </Text>
    </Container>
  );
}
