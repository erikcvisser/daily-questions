import { Suspense } from 'react';
import { Container, Title, Text, Stack, Paper } from '@mantine/core';
import FeedbackForm from '@/app/feedback/FeedbackForm';

export default function FeedbackPage() {
  return (
    <Container size="xl" mt="lg">
      <Stack gap="xl" mx="auto">
        <div>
          <Title order={2} mb="md">
            Share your feedback
          </Title>
          <Paper maw={'600px'} bg="var(--mantine-color-body)">
            <Stack gap="md">
              <Text>
                Thank you for being one of our early users! Daily Questions is
                currently in its pilot phase, and your experience and insights
                are incredibly valuable to us.
              </Text>
              <Text>
                We&apos;d love to hear about your journey with the app -
                what&apos;s working well, what could be improved, and most
                importantly, what features would help you achieve your personal
                goals more effectively.
              </Text>
              <Text>
                Your feedback will directly shape the future of Daily Questions,
                helping us create a better tool for everyone&apos;s
                self-improvement journey. Thank you for taking the time to share
                your thoughts!
              </Text>

              <Suspense fallback={<div>Loading...</div>}>
                <FeedbackForm />
              </Suspense>
            </Stack>
          </Paper>
        </div>
      </Stack>
    </Container>
  );
}
