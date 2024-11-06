'use client';
import { useState } from 'react';
import { Button, Stack, Textarea, Alert } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { submitFeedback } from '@/lib/actions';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const result = await submitFeedback(feedback);

      if (!result.success) throw new Error(result.error);

      setStatus('success');
      setFeedback('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Textarea
          placeholder="Tell us what you think about Daily Questions..."
          minRows={2}
          value={feedback}
          autosize
          onChange={(e) => setFeedback(e.currentTarget.value)}
          required
        />

        {status === 'success' && (
          <Alert icon={<IconCheck />} title="Thank you!" color="green">
            Your feedback has been sent successfully.
          </Alert>
        )}

        {status === 'error' && (
          <Alert icon={<IconX />} title="Error" color="red">
            Failed to send feedback. Please try again later.
          </Alert>
        )}

        <Button
          type="submit"
          loading={status === 'loading'}
          disabled={!feedback.trim() || status === 'success'}
          size="sm"
          ml="auto"
        >
          Submit Feedback
        </Button>
      </Stack>
    </form>
  );
}
