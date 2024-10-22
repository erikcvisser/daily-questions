import {
  Container,
  Title,
  Text,
  Image,
  ListItem,
  Timeline,
  TimelineItem,
  Card,
  Grid,
  GridCol,
  Avatar,
  Group,
  Button,
  SimpleGrid,
  Skeleton,
  Divider,
  Progress,
  Stack,
  List,
} from '@mantine/core';
import { ButtonModal } from '@/components/Authenticate/ButtonModal';
import { auth } from '@/lib/auth';
import Link from 'next/link';

const SectionDivider = () => <Divider my="xl" variant="dashed" />;

export default async function AboutPage() {
  const session = await auth();
  return (
    <>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(45deg, #FF9A8B, #FF6A88)',
          padding: '100px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L100,0 L100,100 L0,100 Z"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M0,50 Q25,0 50,50 T100,50"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
        <Container size="lg" style={{ textAlign: 'center', color: '#fff' }}>
          <Title order={1}>About Daily Questions</Title>
          <Text size="lg" mt="md">
            Empowering personal growth through daily reflection
          </Text>
        </Container>
      </div>

      {/* Introduction */}
      <Container size="md" mt="xl">
        <Text size="lg" ta="center">
          Daily Questions is more than a platform; it&apos;s a journey toward
          self-improvement. Rooted in the principles outlined in Marshall
          Goldsmith&apos;s &quot;Triggers&quot;, we aim to make personal growth
          accessible and achievable for everyone.
        </Text>
      </Container>
      <SectionDivider />

      {/* The Concept of Daily Questions */}
      <Container size="md" mt="xl">
        <Title order={2} ta="center" mb="md">
          The Concept of Daily Questions
        </Title>
        <Text ta="center">
          The practice involves asking yourself a set of questions each day.
          These questions are designed to keep you aligned with your goals and
          values, fostering accountability and continuous improvement.
        </Text>
      </Container>
      <SectionDivider />
      <Container size="md" my="xl">
        <Title order={2} ta="center" mb="md">
          Why Daily Questions Work
        </Title>
        <Text mb="md" ta="center">
          The Daily Questions method, as introduced by Marshall Goldsmith, is a
          powerful tool that promotes self-awareness and personal
          accountability. By consistently asking six core questions, individuals
          take active ownership of their actions and progress. These questions
          are designed to shift focus from external circumstances to personal
          effort, fostering engagement and improvement in key areas of life.
        </Text>

        <Divider my="lg" />

        <Grid gutter="xl">
          <GridCol span={{ base: 12, md: 6 }}>
            <Title order={4} mb="md">
              The Six Starter Questions:
            </Title>
            <List size="md" spacing="md" type="ordered">
              <ListItem>Did I do my best to set clear goals today?</ListItem>
              <ListItem>
                Did I do my best to make progress towards my goals today?
              </ListItem>
              <ListItem>Did I do my best to find meaning today?</ListItem>
              <ListItem>Did I do my best to be happy today?</ListItem>
              <ListItem>
                Did I do my best to build positive relationships today?
              </ListItem>
              <ListItem>Did I do my best to be engaged today?</ListItem>
            </List>
          </GridCol>

          <GridCol span={{ base: 12, md: 6 }}>
            <Title order={4} mb="md">
              Goldsmith&apos;s Research Results:
            </Title>
            <Stack>
              {[
                {
                  label: 'Improved in all six areas',
                  value: 34,
                  color: 'teal',
                },
                {
                  label: 'Improved on at least four items',
                  value: 67,
                  color: 'green',
                },
                {
                  label: 'Improved in at least one area',
                  value: 91,
                  color: 'darkgreen',
                },
                { label: 'Experienced no change', value: 9, color: 'yellow' },
                { label: 'Saw any decline', value: 3, color: 'red' },
              ].map((item, index) => (
                <Group key={index} justify="space-between" wrap="nowrap">
                  <Text style={{ flexBasis: '50%' }}>{item.label}</Text>
                  <Group
                    justify="flex-end"
                    gap="xs"
                    style={{ flexBasis: '50%' }}
                  >
                    <Text
                      size="sm"
                      fw={500}
                      style={{ minWidth: '40px', textAlign: 'right' }}
                    >
                      {item.value}%
                    </Text>
                    <Progress
                      value={item.value}
                      color={item.color}
                      size="sm"
                      style={{ width: '140px' }}
                    />
                  </Group>
                </Group>
              ))}
            </Stack>
            <Text mt="md" size="sm">
              These statistics, based on over 4,800 respondents, illustrate the
              transformative potential of self-questioning when individuals
              commit to daily reflection and growth.
            </Text>
          </GridCol>
        </Grid>
      </Container>
      <Divider my="lg" />

      {/* How Daily Questions Works */}
      <Container size="md" mt="xl">
        <Title order={2} ta="center" mb="xl">
          How Daily Questions Works
        </Title>
        <Timeline active={4} bulletSize={24} lineWidth={2}>
          <TimelineItem title="Set Your Daily Questions">
            <Text c="dimmed" size="sm">
              Select from a list of expert-crafted questions or create your own
              to match your personal goals.
            </Text>
          </TimelineItem>

          <TimelineItem title="Daily Reminders">
            <Text c="dimmed" size="sm">
              Receive prompts at your preferred time to ensure consistency.
            </Text>
          </TimelineItem>

          <TimelineItem title="Reflect and Record">
            <Text c="dimmed" size="sm">
              Answer your questions honestly to track your progress over time.
            </Text>
          </TimelineItem>

          <TimelineItem title="Be Accountable">
            <Text c="dimmed" size="sm">
              Review your own responses in your personal overview, and invite
              your friends to hold you accountable.
            </Text>
          </TimelineItem>
        </Timeline>
      </Container>
      <SectionDivider />
      {/* Benefits of Daily Questions */}
      <Container size="lg" mt="xl">
        <Title order={2} ta="center" mb="xl">
          Benefits of Daily Questions
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
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
      <SectionDivider />

      {/* Testimonials */}
      <Container size="lg" mt="xl">
        <Title order={2} ta="center" mb="xl">
          What Our Users Say
        </Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg">
            <Group>
              <Avatar src={null} alt="User 1" radius="xl">
                <Skeleton height={40} circle />
              </Avatar>
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
              <Avatar src={null} alt="User 2" radius="xl">
                <Skeleton height={40} circle />
              </Avatar>
              <Text fw={500}>Morgan L.</Text>
            </Group>
            <Text mt="sm">
              &quot;The daily prompts keep me focused on what&apos;s important.
              It&apos;s a simple yet powerful tool.&quot;
            </Text>
          </Card>
        </SimpleGrid>
      </Container>
      <SectionDivider />
      {/* About Marshall Goldsmith */}
      <Container size="md" mt="xl">
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, md: 5 }}>
            <Image
              src="/images/marshall.jpg"
              alt="Marshall Goldsmith"
              width={200}
              height={300}
              mx="auto"
              radius="md"
            />
          </GridCol>
          <GridCol span={{ base: 12, md: 7 }}>
            <Title order={3}>Meet Marshall Goldsmith</Title>
            <Text mt="sm">
              Marshall Goldsmith has been recognized as the world&apos;s leading
              Executive Coach and the New York Times bestselling author of many
              books, including What Got You Here Won&apos;t Get You There, Mojo,
              and Triggers. He received his Ph.D. from the UCLA Anderson School
              of Management. In his executive-coaching career, Goldsmith has
              advised more than 200 major CEOs and their management teams. He
              and his wife live in Nashville, Tennessee.
            </Text>
            <Button
              variant="outline"
              size="md"
              mt="md"
              component="a"
              href="https://marshallgoldsmith.com/"
              target="_blank"
            >
              Learn More
            </Button>
          </GridCol>
        </Grid>
      </Container>
      <SectionDivider />

      {/* About 'Triggers' */}
      <Container size="md" mt="xl">
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, md: 7 }}>
            <Title order={3}>And his book: &quot;Triggers&quot;</Title>
            <Text mt="sm">
              &quot;Triggers&quot; explores how our environment shapes our
              behavior and offers tools to enact positive change. The book
              inspires our daily questioning approach, helping you navigate
              life&apos;s challenges with intentionality.
            </Text>
            <Button
              variant="outline"
              size="md"
              mt="md"
              component="a"
              href="https://marshallgoldsmith.com/book-page-triggers/"
              target="_blank"
            >
              Learn More
            </Button>
          </GridCol>
          <GridCol span={{ base: 12, md: 5 }}>
            <Image
              src="/images/triggers.jpg"
              alt="'Triggers' Book Cover"
              mx="auto"
              radius="md"
            />
          </GridCol>
        </Grid>
      </Container>
      <SectionDivider />

      {/* Our Team */}
      <Container size="md" mt="xl">
        <Title order={2} ta="center" mb="xl">
          Behind the scenes
        </Title>
        <Card shadow="sm" padding="lg" radius="md">
          <Grid gutter="xl" align="center">
            <GridCol span={{ base: 12, sm: 4 }}>
              <Image
                src="/images/erik-marshall.jpeg"
                alt="Erik Visser"
                height={350}
                width={200}
                radius="md"
                mx="auto"
              />
            </GridCol>
            <GridCol span={{ base: 12, sm: 8 }}>
              <Text fw={700} size="lg">
                Erik Visser
              </Text>
              <Text c="dimmed" mb="md">
                Founder and co-learner
              </Text>
              <Text>
                Erik first met Marshall Goldsmith in Nashville, Tennessee,
                during the Future Leaders Program in 2024. Marshall&apos;s
                teachings resonated with Erik, particularly the idea that while
                change is simple, it is hard. Although Erik was familiar with
                the concept of accountability in his personal life, he lacked an
                effective method for truly following through. The Daily
                Questions framework made this process much more accessible.
              </Text>
              <Text mb="sm">
                Inspired by Marshall&apos;s principle of &quot;Paying it
                Forward,&quot; Erik decided to take this concept further by
                creating this free platform, aimed at helping others achieve
                meaningful change and reach their goals.
              </Text>
              <Text>
                Erik is a technology leader who likes working on side projects
                like this, focusing on building products that have a positive
                impact.
              </Text>
            </GridCol>
          </Grid>
        </Card>
      </Container>
      <SectionDivider />

      {/* Join Us */}
      <Container size="md" my="xl" ta="center">
        <Title order={2}>Embark on Your Journey Today</Title>
        {session ? (
          <Button component={Link} href="/" size="lg" mt="md">
            Go to Dashboard
          </Button>
        ) : (
          <ButtonModal
            buttonText="Join Daily Questions Today"
            modalTitle="Sign in or sign up"
          />
        )}
      </Container>
    </>
  );
}
