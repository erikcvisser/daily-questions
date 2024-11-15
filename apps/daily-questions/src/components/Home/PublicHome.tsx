import {
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
  Card,
  Image,
  Grid,
  GridCol,
  Avatar,
  Skeleton,
  Group,
  Divider,
} from '@mantine/core';
import { ButtonModal } from '../Authenticate/ButtonModal';
import Link from 'next/link';
import NextImage from 'next/image';

const SectionDivider = () => <Divider my="xl" variant="dashed" />;

export default function PublicHome() {
  return (
    <>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
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
          <Title order={1}>Transform Your Life One Question at a Time</Title>
          <Text size="lg" mt="md">
            Harness the power of daily reflection inspired by Marshall
            Goldsmith&apos;s &quot;Triggers&quot;
          </Text>
          <ButtonModal
            buttonText="Get Started"
            modalTitle="Sign in or sign up"
          />
        </Container>
      </div>

      {/* Introduction */}
      <Container size="md" mt="xl">
        <Text size="lg" ta="center">
          At Daily Questions, we believe that asking the right questions leads
          to meaningful change. Inspired by Marshall Goldsmith&apos;s
          transformative work, our platform guides you toward personal and
          professional growth through daily self-reflection.
        </Text>
      </Container>

      {/* Who is it for */}
      <Container size="md" mt="xl">
        <SectionDivider />
        <Title order={3} ta="center" mb="md">
          Who is it for?
        </Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={500} mb="sm">
              This is for people who:
            </Text>
            <Text>
              Want to change their behaviors and are committed to personal
              growth.
            </Text>
          </Card>
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={500} mb="sm">
              This is not for people who:
            </Text>
            <Text>
              Do not want to change their behaviors. No one can make a
              successful and contented adult change their behavior unless they
              want to.
            </Text>
          </Card>
        </SimpleGrid>
      </Container>

      {/* Key Benefits */}
      <Container size="lg" mt="xl">
        <SectionDivider />
        <SimpleGrid
          spacing="lg"
          verticalSpacing="lg"
          cols={{ base: 1, md: 2, lg: 4 }}
        >
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={500}>Self-Awareness</Text>
            <Text mt="sm">
              Enhance your understanding of personal habits and behaviors.
            </Text>
          </Card>
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={500}>Accountability</Text>
            <Text mt="sm">
              Stay committed to your goals with daily check-ins.
            </Text>
          </Card>
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={500}>Growth Mindset</Text>
            <Text mt="sm">
              Foster continuous improvement in all areas of life.
            </Text>
          </Card>
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={500}>Community Support</Text>
            <Text mt="sm">
              Join a network of individuals dedicated to self-improvement.
            </Text>
          </Card>
        </SimpleGrid>
      </Container>

      {/* About Marshall Goldsmith */}
      <Container size="md" mt="xl">
        <SectionDivider />
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, md: 5 }}>
            <Image
              component={NextImage}
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
              component={Link}
              href="https://marshallgoldsmith.com/"
              target="_blank"
            >
              Learn More
            </Button>
          </GridCol>
        </Grid>
      </Container>

      {/* About 'Triggers' */}
      <Container size="md" mt="xl">
        <SectionDivider />
        <Grid gutter="xl" align="center">
          <GridCol span={{ base: 12, md: 8 }}>
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
              component={Link}
              href="https://marshallgoldsmith.com/book-page-triggers/"
              target="_blank"
            >
              Learn More
            </Button>
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <Image
              component={NextImage}
              src="/images/triggers.jpg"
              alt="'Triggers' Book Cover"
              mx="auto"
              radius="md"
              height={400}
              width={300}
            />
          </GridCol>
        </Grid>
      </Container>

      {/* Testimonials */}
      {/* <Container size="lg" mt="xl">
        <SectionDivider />
        <Title order={3} ta="center">
          What Our Users Say
        </Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="md">
          <Card shadow="sm" padding="lg" mih={200}>
            <Group>
              <Avatar src={null} alt="User 1" radius="xl">
                <Skeleton height={40} circle />
              </Avatar>
              <Text fw={500}>Alex P.</Text>
            </Group>
            <Text mt="sm">
              &quot;Daily Questions has improved the way I approach my day. I
              like the accountability it creates and I&apos;m more focused and
              driven than ever.&quot;
            </Text>
          </Card>
          <Card shadow="sm" padding="lg">
            <Group>
              <Avatar src={null} alt="User 1" radius="xl">
                <Skeleton height={40} circle />
              </Avatar>
              <Text fw={500}>Jordan S.</Text>
            </Group>
            <Text mt="sm">
              &quot;A simple yet powerful tool for personal growth. Highly
              recommended!&quot;
            </Text>
          </Card>
        </SimpleGrid>
      </Container> */}

      {/* Call to Action */}
      <Container size="md" my="xl" mb="xl" style={{ textAlign: 'center' }}>
        <SectionDivider />
        <Title order={2}>Ready to Start Your Journey?</Title>
        <ButtonModal
          buttonText="Join Daily Questions Today"
          modalTitle="Sign in or sign up"
        />
      </Container>
    </>
  );
}
