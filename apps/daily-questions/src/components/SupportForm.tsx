'use client';

import { useState } from 'react';
import { TextInput, Textarea, Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { sendSupportMessage } from '@/lib/actions';

export function SupportForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await sendSupportMessage({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
      });

      if (result.success) {
        notifications.show({
          title: 'Message Sent',
          message: "Thank you! We'll get back to you soon.",
          color: 'green',
        });
        form.reset();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to send message. Please try again.',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput name="name" label="Name" placeholder="Your name" required />
        <TextInput
          name="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          required
        />
        <Textarea
          name="message"
          label="Message"
          placeholder="How can we help?"
          minRows={4}
          required
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </Stack>
    </form>
  );
}
