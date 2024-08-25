import { Container, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';

const Overview = () => {
  return (
    <Container>
      <Title order={1}>Overview</Title>
      <Calendar />
    </Container>
  );
};

export default Overview;
