import { NextPage } from 'next';
import {
  Container,
  Title,
  Text,
  Image,
  Timeline,
  TimelineItem,
  Card,
  Grid,
  GridCol,
  Avatar,
  Group,
  Button,
  SimpleGrid,
} from '@mantine/core';
import Link from 'next/link';

const AboutPage: NextPage = () => {
  return (
    <>
      {/* Introduction */}
      <Container size="md" mt="xl">
        <Title order={2}>About Daily Questions</Title>
        <Text size="lg" mt="md">
          Daily Questions is more than a platform; it&apos;s a journey toward
          self-improvement. Rooted in the principles outlined in Marshall
          Goldsmith&apos;s &quot;Triggers&quot;, we aim to make personal growth
          accessible and achievable for everyone.
        </Text>
      </Container>

      {/* Our Mission */}
      <Container size="md" mt="xl">
        <Title order={3}>Our Mission</Title>
        <Text mt="md">
          Our mission is to empower individuals to take control of their lives
          through consistent self-reflection. By providing the tools and
          community support needed, we help you unlock your full potential.
        </Text>
      </Container>

      {/* The Concept of Daily Questions */}
      <Container size="md" mt="xl">
        <Title order={3}>The Concept of Daily Questions</Title>
        <Grid align="center" mt="md">
          <GridCol span={6}>
            <Image
              src="/path-to-daily-questions-illustration.jpg"
              alt="Daily Questions Illustration"
            />
          </GridCol>
          <GridCol span={6}>
            <Text>
              The practice involves asking yourself a set of tailored questions
              each day. These questions are designed to keep you aligned with
              your goals and values, fostering accountability and continuous
              improvement.
            </Text>
          </GridCol>
        </Grid>
      </Container>

      {/* Marshall Goldsmith and 'Triggers' */}
      <Container size="md" mt="xl">
        <Title order={3}>Marshall Goldsmith and &quot;Triggers&quot;</Title>
        <Grid align="center" mt="md">
          <GridCol span={6}>
            <Image src="/images/marshall.jpg" alt="Marshall Goldsmith" />
          </GridCol>
          <GridCol span={6}>
            <Image src="/images/triggers.jpg" alt="'Triggers' Book Cover" />
          </GridCol>
        </Grid>
        <Text mt="md">
          Marshall Goldsmith has been recognized as the world&apos;s leading
          Executive Coach and the New York Times bestselling author of many
          books, including What Got You Here Won&apos;t Get You There, Mojo, and
          Triggers. He received his Ph.D. from the UCLA Anderson School of
          Management. In his executive-coaching career, Goldsmith has advised
          more than 200 major CEOs and their management teams. He and his wife
          live in Nashville, Tennessee.
        </Text>
        <Button
          variant="outline"
          size="md"
          mt="md"
          component="a"
          href="https://marshallgoldsmith.com/"
          target="_blank"
        >
          Visit Marshall&apos;s Website
        </Button>
      </Container>

      {/* How Daily Questions Works */}
      <Container size="md" mt="xl">
        <Title order={3}>How Daily Questions Works</Title>
        <Timeline active={4} bulletSize={24} lineWidth={2} mt="md">
          <TimelineItem title="Customize Your Questions">
            <Text color="dimmed" size="sm">
              Select from a list of expert-crafted questions or create your own
              to match your personal goals.
            </Text>
          </TimelineItem>

          <TimelineItem title="Daily Reminders">
            <Text color="dimmed" size="sm">
              Receive prompts at your preferred time to ensure consistency.
            </Text>
          </TimelineItem>

          <TimelineItem title="Reflect and Record">
            <Text color="dimmed" size="sm">
              Answer your questions honestly to track your progress over time.
            </Text>
          </TimelineItem>

          <TimelineItem title="Review and Adjust">
            <Text color="dimmed" size="sm">
              Analyze your responses to identify patterns and make necessary
              adjustments.
            </Text>
          </TimelineItem>
        </Timeline>
      </Container>

      {/* Benefits of Daily Questions */}
      <Container size="md" mt="xl">
        <Title order={3}>Benefits of Daily Questions</Title>
        <SimpleGrid cols={3} spacing="lg" mt="md">
          <Card shadow="sm" padding="lg" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} color="blue">
              1
            </Text>
            <Title order={4} mt="md">
              Improved Self-Awareness
            </Title>
            <Text mt="sm">
              Regular reflection helps you understand your thoughts and actions
              better.
            </Text>
          </Card>

          <Card shadow="sm" padding="lg" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} color="blue">
              2
            </Text>
            <Title order={4} mt="md">
              Enhanced Decision-Making
            </Title>
            <Text mt="sm">
              Stay aligned with your goals, leading to better choices.
            </Text>
          </Card>

          <Card shadow="sm" padding="lg" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} color="blue">
              3
            </Text>
            <Title order={4} mt="md">
              Personal Accountability
            </Title>
            <Text mt="sm">
              Hold yourself accountable in a supportive environment.
            </Text>
          </Card>
        </SimpleGrid>
      </Container>

      {/* User Stories */}
      <Container size="md" mt="xl">
        <Title order={3}>User Stories</Title>
        <SimpleGrid cols={2} spacing="lg" mt="md">
          <Card shadow="sm" padding="lg">
            <Group>
              <Avatar src="/path-to-user3-photo.jpg" alt="User 3" radius="xl" />
              <Text fw={500}>Taylor R.</Text>
            </Group>
            <Text mt="sm">
              &quot;Using Daily Questions has been a game-changer. I&apos;ve
              seen significant improvements in my productivity and
              mindset.&quot;
            </Text>
          </Card>
          <Card shadow="sm" padding="lg">
            <Group>
              <Avatar src="/path-to-user4-photo.jpg" alt="User 4" radius="xl" />
              <Text fw={500}>Morgan L.</Text>
            </Group>
            <Text mt="sm">
              &quot;The daily prompts keep me focused on what&apos;s important.
              It&apos;s a simple yet powerful tool.&quot;
            </Text>
          </Card>
        </SimpleGrid>
      </Container>

      {/* Our Team */}
      <Container size="md" mt="xl">
        <Title order={3}>Our Team</Title>
        <Grid mt="md">
          {/* Repeat this Grid.Col for each team member */}
          <GridCol>
            <Card shadow="sm" padding="lg">
              <Image
                src="/path-to-team-member-photo.jpg"
                alt="Team Member"
                radius="md"
              />
              <Text fw={500} mt="md">
                Erik Visser
              </Text>
              <Text size="sm" color="dimmed">
                Founder & CEO
              </Text>
              <Text mt="sm">
                Erik is passionate about personal development and technology.
              </Text>
            </Card>
          </GridCol>
          {/* Add more team members as needed */}
        </Grid>
      </Container>

      {/* Join Us */}
      <Container size="md" mt="xl" style={{ textAlign: 'center' }}>
        <Title order={3}>Embark on Your Journey Today</Title>
        <Button
          variant="filled"
          size="lg"
          mt="md"
          component={Link}
          href="/signup"
        >
          Sign Up Now
        </Button>
      </Container>
    </>
  );
};

export default AboutPage;
