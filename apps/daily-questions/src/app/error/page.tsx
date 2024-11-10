'use client';

import { useSearchParams } from 'next/navigation';
import { Container, Title, Text, Group } from '@mantine/core';
import classes from '@/components/NotFound/NothingFoundBackground.module.css';
import { CombiForm } from '@/components/Authenticate/CombiForm';

enum Error {
  Configuration = 'Configuration',
}

const errorMap = {
  [Error.Configuration]: 'There was a problem when trying to authenticate.',
};

export default function AuthErrorPage() {
  const search = useSearchParams();
  const error = search.get('error') as Error;

  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>Something went wrong</Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}
          >
            {errorMap[error] || 'An unexpected error occurred.'} Please contact
            us if this error persists.
            {error === Error.Configuration && (
              <>
                {' '}
                Unique error code: <code>Configuration</code>
              </>
            )}
          </Text>
          <Group justify="center">Please try again.</Group>
          <Container size="sm">
            <CombiForm />
          </Container>
        </div>
      </div>
    </Container>
  );
}
