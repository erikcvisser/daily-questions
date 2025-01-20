'use client';

import { useState } from 'react';
import {
  Modal,
  Text,
  Group,
  Button,
  Stack,
  Select,
  NumberInput,
  SegmentedControl,
  Card,
  Badge,
  Loader,
  Center,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import { analyzeQuestions } from '@/lib/actions';
import { IconArrowDown, IconArrowUp, IconMinus } from '@tabler/icons-react';

interface AnalysisModalProps {
  opened: boolean;
  onClose: () => void;
  userId: string;
}

type DateRangeType = 'absolute' | 'relative';
type RelativePeriod = 'week' | 'month' | '3months' | 'year';
type AnalysisType = 'performance' | 'future_types';

export function AnalysisModal({ opened, onClose, userId }: AnalysisModalProps) {
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('performance');
  const [topCount, setTopCount] = useState<number | ''>(5);
  const [bottomCount, setBottomCount] = useState<number | ''>(5);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('relative');
  const [relativePeriod, setRelativePeriod] = useState<RelativePeriod>('month');
  const [startDate, setStartDate] = useState<DateValue>(null);
  const [endDate, setEndDate] = useState<DateValue>(null);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = () => {
    setLoading(true);
    try {
      let start: Date;
      let end: Date;

      if (dateRangeType === 'absolute') {
        if (!startDate || !endDate) {
          throw new Error('Please select both start and end dates');
        }
        start = startDate;
        end = endDate;
      } else {
        end = new Date();
        start = new Date();
        switch (relativePeriod) {
          case 'week':
            start.setDate(end.getDate() - 7);
            break;
          case 'month':
            start.setMonth(end.getMonth() - 1);
            break;
          case '3months':
            start.setMonth(end.getMonth() - 3);
            break;
          case 'year':
            start.setFullYear(end.getFullYear() - 1);
            break;
        }
      }

      analyzeQuestions({
        userId,
        topCount: topCount || 5,
        bottomCount: bottomCount || 5,
        startDate: start,
        endDate: end,
      })
        .then((analysis) => {
          setResults(analysis);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Analysis failed:', error);
          setLoading(false);
        });
    } catch (error) {
      console.error('Analysis failed:', error);
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <IconArrowUp size={16} color="green" />;
      case 'declining':
        return <IconArrowDown size={16} color="red" />;
      default:
        return <IconMinus size={16} />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNumberInputChange = (
    setter: React.Dispatch<React.SetStateAction<number | ''>>
  ) => {
    return (value: string | number) => {
      setter(value === '' ? '' : Number(value));
    };
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Analyze Questions Performance"
      size="lg"
    >
      <Stack>
        <Select
          label="Analysis Type"
          value={analysisType}
          onChange={(value) => setAnalysisType(value as AnalysisType)}
          data={[
            {
              label: 'Top/Bottom Performance Analysis',
              value: 'performance',
              disabled: false,
            },
            {
              label: 'More analysis types coming soon...',
              value: 'future_types',
              disabled: true,
            },
          ]}
        />

        {analysisType === 'performance' && (
          <>
            <Group grow>
              <NumberInput
                label="Top performing questions"
                placeholder="5"
                min={1}
                max={20}
                value={topCount}
                onChange={handleNumberInputChange(setTopCount)}
              />
              <NumberInput
                label="Bottom performing questions"
                placeholder="5"
                min={1}
                max={20}
                value={bottomCount}
                onChange={handleNumberInputChange(setBottomCount)}
              />
            </Group>

            <SegmentedControl
              value={dateRangeType}
              onChange={(v) => setDateRangeType(v as DateRangeType)}
              data={[
                { label: 'Relative', value: 'relative' },
                { label: 'Absolute', value: 'absolute' },
              ]}
            />

            {dateRangeType === 'relative' ? (
              <Select
                label="Time period"
                value={relativePeriod}
                onChange={(v) => setRelativePeriod(v as RelativePeriod)}
                data={[
                  { label: 'Last week', value: 'week' },
                  { label: 'Last month', value: 'month' },
                  { label: 'Last 3 months', value: '3months' },
                  { label: 'Last year', value: 'year' },
                ]}
              />
            ) : (
              <Group grow>
                <DateInput
                  label="Start date"
                  value={startDate}
                  onChange={setStartDate}
                  maxDate={endDate || new Date()}
                />
                <DateInput
                  label="End date"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                />
              </Group>
            )}

            <Button onClick={handleAnalyze} loading={loading}>
              Analyze
            </Button>

            {loading && (
              <Center>
                <Loader />
              </Center>
            )}

            {results && !loading && (
              <Stack>
                <Text size="sm" c="dimmed">
                  Analysis for period: {formatDate(results.periodStart)} -{' '}
                  {formatDate(results.periodEnd)}
                </Text>

                <Card withBorder>
                  <Text fw={500} mb="xs">
                    Top Performing Questions
                  </Text>
                  <Stack gap="xs">
                    {results.topQuestions.map((q: any) => (
                      <Group key={q.questionId} justify="space-between">
                        <Text size="sm" style={{ flex: 1 }}>
                          {q.title}
                        </Text>
                        <Group gap="xs">
                          <Badge>
                            {(q.averageScore * 100).toFixed(1)}% success
                          </Badge>
                          <Badge variant="light">{q.answerCount} answers</Badge>
                          {getTrendIcon(q.trend)}
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Card>

                <Card withBorder>
                  <Text fw={500} mb="xs">
                    Bottom Performing Questions
                  </Text>
                  <Stack gap="xs">
                    {results.bottomQuestions.map((q: any) => (
                      <Group key={q.questionId} justify="space-between">
                        <Text size="sm" style={{ flex: 1 }}>
                          {q.title}
                        </Text>
                        <Group gap="xs">
                          <Badge color="red">
                            {(q.averageScore * 100).toFixed(1)}% success
                          </Badge>
                          <Badge variant="light">{q.answerCount} answers</Badge>
                          {getTrendIcon(q.trend)}
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
}
