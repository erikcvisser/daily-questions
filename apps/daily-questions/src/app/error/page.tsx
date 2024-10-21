'use client';

import { useSearchParams } from 'next/navigation';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import classes from '@/components/NotFound/NothingFoundBackground.module.css';

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
          <Group justify="center">
            <Button size="md" component="a" href="/">
              Take me back to home page
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  );
}
