import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from '@react-email/components';
import { MantineTheme } from './MantineTheme';

interface EndOfYearEmailProps {
  userName: string;
}

export default function EndOfYearEmail({ userName }: EndOfYearEmailProps) {
  return (
    <Html>
      <Head>
        <MantineTheme />
      </Head>
      <Preview>Wishing you a reflective 2025 full of growth and joy!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hello {userName}!</Heading>

          <Text style={text}>
            I&apos;m Erik, the guy behind Daily Questions. As 2024 comes to a
            close, I want to take a moment to thank you for using this app.{' '}
            <br />
            <br />I built Daily Questions to make it as easy as possible for
            people to reflect daily on the areas that matter most to them.
            Seeing so many of you using it—especially those I don&apos;t know
            personally—has been incredibly rewarding. I hope the app is helping
            you grow, just as it&apos;s helping me.
          </Text>
          <Hr style={divider} />
          <Heading style={h2}>Latest additions to the app</Heading>
          <Text style={text}>
            I regularly add new features based on your feedback and my own
            experience. Please keep your ideas coming—either through the{' '}
            <a href="https://dailyquestions.app/feedback" target="_blank">
              feedback form
            </a>{' '}
            or by replying to this email.
          </Text>
          <Text style={listItem}>• Email and push notifications</Text>
          <Text style={listItemDescription}>
            Get daily reminders at your preferred time to complete your daily
            questions via email or push notifications. Head to{' '}
            <a href="https://dailyquestions.app/profile" target="_blank">
              your profile
            </a>{' '}
            to configure your preferences. <br />
            This feature has been a game-changer for my personally, I hardly
            miss a day anymore!
          </Text>
          <Text style={listItem}>• Install on your phone or computer</Text>
          <Text style={listItemDescription}>
            Install the app on your phone or computer for easy access and to
            enable push notifications. Visit{' '}
            <a href="https://dailyquestions.app/profile" target="_blank">
              your profile
            </a>{' '}
            to learn more. <br />
            While the app can already be installed on all devices, it&apos;s not
            yet available in the App Store or Play Store—but I&apos;ll consider
            this if there&apos;s enough interest.
          </Text>
          <Text style={listItem}>• Weekly and monthly questions</Text>
          <Text style={listItemDescription}>
            Some questions are better asked less frequently. Now, you can set
            intervals for weekly or monthly questions. Configure the frequency
            in{' '}
            <a href="https://dailyquestions.app/questions" target="_blank">
              your questions
            </a>
            .
          </Text>
          <Text style={listItem}>• Accountability partners</Text>
          <Text style={listItemDescription}>
            Share your progress with friends or mentors to stay motivated. Go to{' '}
            <a href="https://dailyquestions.app/overview" target="_blank">
              your overview
            </a>{' '}
            to start sharing.
          </Text>
          <Text style={listItem}>• Improved mobile experience</Text>
          <Text style={listItemDescription}>
            Filling out your daily questions on the go is now faster and easier.
            Swipe left or right to answer quickly.
          </Text>
          <Text style={listItem}>• Improved analytics</Text>
          <Text style={listItemDescription}>
            Track your progress over time with detailed insights, including
            trends for each question—or download your data to review in Excel.
          </Text>
          <Hr style={divider} />
          <Heading style={h2}>Some tips</Heading>
          <Text style={listItem}>• Write active questions</Text>
          <Text style={listItemDescription}>
            Active questions focus on what you did, instead of simply reflecting
            on what happened. Start your questions with: &quot;Did I do my best
            to ...&quot;
          </Text>
          <Text style={listItem}>• Request FeedForward and follow through</Text>
          <Text style={listItemDescription}>
            Where feedback focuses on what you did, FeedForward focuses on what
            you can do. You are more likely to see the change you want if you
            request others to provide tips on how you might achieve your goals.{' '}
            <br />
            For example, your goal might be: &quot;I want to get better at
            listening&quot;. As you request feedforward, your friends/mentors
            will suggest a few things and you hopefully see your score on the
            related daily question go up.
          </Text>
          <Text style={listItem}>• Invite others in your journey</Text>
          <Text style={listItemDescription}>
            It is hard to change on your own. Invite others in your journey to
            help you stay motivated and accountable. You can use the &apos;share
            overview&apos; functionality in the app, or simply meet every few
            weeks with them to discuss how things are going.
          </Text>
          <Hr style={divider} />
          <Heading style={h2}>What&apos;s next?</Heading>
          <Text style={text}>
            My goal is to help as many people as possible through this app.
            Daily Questions will always remain completely free to use, as I find
            joy in seeing it make a difference in people&apos;s lives.
            <br />
            If you&apos;re enjoying the app, feel free to share it with others
            in your network. And as always, let me know how I can make it even
            more useful for you.
            <br />
            <br />
            Wishing you a Happy New Year! May 2025 bring growth and joy into
            your life.
            <br />
            <br />
            Warm regards,
            <br />
            Erik
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1A1B1E',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '16px 0',
};
const h2 = {
  color: '#1A1B1E',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '16px 0',
};

const text = {
  color: '#2C2E33',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const divider = {
  borderTop: '1px solid #e9ecef',
  margin: '20px 0',
};

const listItem = {
  color: '#2C2E33',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '8px 0 0px 16px',
};

const listItemDescription = {
  color: '#4A4B4E',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px 16px',
  paddingLeft: '12px',
};
