import { Paper, Text, Flex } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { Submission } from '@prisma/client';

export async function SummarySection({
  submissions,
  personalTarget,
}: {
  submissions: Submission[];
  personalTarget: number;
}) {
  const streak = calculateStreak(submissions);
  const maxStreak = calculateMaxStreak(submissions);
  const weeklyData = await calculateWeeklyData(
    submissions,
    personalTarget * 100
  );
  return (
    <Flex direction={{ base: 'column', md: 'row' }} gap="md">
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '220px',
          flex: 1,
        }}
      >
        <Text size="lg" fw={500} mb="xs">
          Current Streak
        </Text>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Text ta="center" fw={700} size="xl">
            {streak}
          </Text>
          <Text ta="center" c="dimmed" size="sm">
            {streak === 1 ? 'day' : 'days'}
          </Text>
          <Text ta="center" size="sm" c="dimmed">
            Best streak: {maxStreak} days in a row
          </Text>
          <Text ta="center" size="sm" c="blue" mt="xs">
            {streak === 0
              ? "Let's start a new streak today!"
              : streak === maxStreak
              ? "You're at your best! Keep going! 🎉"
              : streak > 3
              ? 'Impressive streak! Keep it up! 🔥'
              : "You're building momentum! 💪"}
          </Text>
        </div>
      </Paper>
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '220px',
          minHeight: '220px',
          flex: 1,
        }}
      >
        <Text size="lg" fw={500} mb="xs">
          Weekly Target Achievement
        </Text>
        <div style={{ height: '220px', minWidth: '220px' }}>
          <LineChart
            h="100%"
            w="100%"
            data={weeklyData}
            dataKey="week"
            yAxisProps={{ domain: [0, 7] }}
            series={[
              {
                name: 'daysMetTarget',
                color: 'blue',
                label: '# days with target met',
              },
            ]}
            curveType="linear"
          />
        </div>
      </Paper>
    </Flex>
  );
}

function calculateStreak(submissions: Submission[]): number {
  // Sort submissions by date in descending order
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start checking from today
  const currentDate = new Date(today);

  // If there's no submission for today, that's okay - we'll start counting from yesterday
  // but we won't break the streak just because today isn't done yet
  if (
    sortedSubmissions.length === 0 ||
    new Date(sortedSubmissions[0].date).getTime() < today.getTime()
  ) {
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // If there is a submission for today, count it
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Now check previous days
  for (const submission of sortedSubmissions) {
    const submissionDate = new Date(submission.date);
    submissionDate.setHours(0, 0, 0, 0);

    if (submissionDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (submissionDate.getTime() < currentDate.getTime()) {
      // If we find a submission before our current date, the streak is broken
      break;
    }
  }

  return streak;
}

function calculateMaxStreak(submissions: Submission[]): number {
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate: Date | null = null;

  for (const submission of sortedSubmissions) {
    const currentDate = new Date(submission.date);
    currentDate.setHours(0, 0, 0, 0);

    if (previousDate) {
      const dayDifference = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDifference === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    previousDate = currentDate;
  }

  return maxStreak;
}

async function calculateWeeklyData(
  submissions: Submission[],
  personalTarget: number
): Promise<{ week: string; daysMetTarget: number }[]> {
  // Sort submissions by date in ascending order
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeklyData: { week: string; daysMetTarget: number }[] = [];
  const weekMap = new Map<string, number>();

  // Get the date range
  const startDate = new Date(sortedSubmissions[0].date);
  const endDate = new Date(
    sortedSubmissions[sortedSubmissions.length - 1].date
  );

  // Initialize all weeks with 0
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const weekNumber = getWeekNumber(currentDate);
    const year = currentDate.getFullYear();
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, 0);
      weeklyData.push({ week: weekKey, daysMetTarget: 0 });
    }

    currentDate.setDate(currentDate.getDate() + 7);
  }

  sortedSubmissions.forEach((submission) => {
    const date = new Date(submission.date);
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    const scorePercentage = submission.scorePercentage || 0;

    if (scorePercentage >= personalTarget) {
      const existingWeek = weeklyData.find((data) => data.week === weekKey);
      if (existingWeek) {
        existingWeek.daysMetTarget += 1;
      }
    }
  });

  return weeklyData;
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
