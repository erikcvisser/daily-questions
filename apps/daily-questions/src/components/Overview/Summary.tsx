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
    <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '220px',
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
            padding: '1rem 0',
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
          minHeight: '220px',
          flex: 1,
        }}
      >
        <Text size="lg" fw={500} mb="xs">
          Weekly Target Achievement
        </Text>
        <div style={{ flex: 1, minWidth: '220px' }}>
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
  // Sort submissions by date descending
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedSubmissions.length === 0) return 0;

  // Get today and yesterday dates (at midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get the most recent submission date (at midnight)
  const mostRecentDate = new Date(sortedSubmissions[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);

  // If most recent submission is before yesterday, return 0
  if (mostRecentDate < yesterday) {
    return 0;
  }

  // Calculate streak
  let currentStreak = 1;
  let previousDate = mostRecentDate;

  for (let i = 1; i < sortedSubmissions.length; i++) {
    const currentDate = new Date(sortedSubmissions[i].date);
    currentDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffDays = Math.round(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If difference is 1 day, continue streak
    if (diffDays === 1) {
      currentStreak++;
      previousDate = currentDate;
    } else {
      // Break streak if gap is more than 1 day
      break;
    }
  }

  return currentStreak;
}

function calculateMaxStreak(submissions: Submission[]): number {
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate: string | null = null;

  for (const submission of sortedSubmissions) {
    const currentDateStr = new Date(submission.date)
      .toISOString()
      .split('T')[0];

    if (previousDate) {
      const prevDate = new Date(previousDate);
      const currDate = new Date(currentDateStr);
      const dayDifference = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
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
    previousDate = currentDateStr;
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
