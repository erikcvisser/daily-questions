'use client';

import { submitQuestionnaireSchema } from '@/lib/definitions';
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { Question, Answer, Submission } from '@prisma/client';
import { IconChevronLeft, IconChevronRight, IconSend } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { submitQuestionnaire, updateQuestionnaire } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';
import { Carousel, Embla } from '@mantine/carousel';
import posthog from 'posthog-js';

export default function QuestionnaireMobileForm({
  questions,
  submission,
}: {
  questions: Question[];
  submission: (Submission & { answers: Answer[] }) | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [embla, setEmbla] = useState<Embla | null>(null);
  const searchParams = useSearchParams();

  // Form setup
  const dateParam = searchParams.get('date');
  const now = dateParam ? new Date(dateParam) : new Date();
  const localDate = new Date(now);
  localDate.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid timezone issues

  let initialAnswers = {
    date: localDate,
    answers: {
      ...questions.reduce((acc: { [key: string]: string }, question) => {
        acc[question.id] = '';
        return acc;
      }, {}),
    },
  };

  if (submission && submission.answers) {
    const submissionDate = new Date(submission.date);
    submissionDate.setUTCHours(12, 0, 0, 0); // Ensure consistent UTC time for existing submissions

    initialAnswers = {
      date: submissionDate,
      answers: {
        ...submission.answers.reduce(
          (acc: { [key: string]: string }, answer) => {
            acc[answer.questionId] = answer.answer;
            return acc;
          },
          {}
        ),
      },
    };
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: initialAnswers,
    validateInputOnChange: true,
    validate: zodResolver(submitQuestionnaireSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      if (submission) {
        await updateQuestionnaire(submission.id, values);
        posthog.capture('questionnaire_updated', {
          submission_id: submission.id,
          questions_count: questions.length,
          date: values.date,
          platform: 'mobile',
        });
      } else {
        await submitQuestionnaire(values);
        posthog.capture('questionnaire_submitted', {
          questions_count: questions.length,
          date: values.date,
          platform: 'mobile',
        });
      }
      notifications.show({
        message: 'Questionnaire saved successfully!',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        message: 'Something went wrong saving this questionnaire',
        color: 'red',
      });
      posthog.capture('questionnaire_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: submission ? 'update' : 'create',
        platform: 'mobile',
      });
    }
    setSubmitting(false);
  };

  const handleNext = () => {
    if (embla && currentSlide < questions.length) {
      embla.scrollNext();
      handleSlideChange(currentSlide + 1);
    }
  };

  useEffect(() => {
    if (embla) {
      const onSettle = () => {
        const currentIndex = embla.selectedScrollSnap();
        setTimeout(() => {
          const input = document.querySelector(
            `[data-slide="${currentIndex}"] input:not([type="hidden"]):not([type="radio"]), [data-slide="${currentIndex}"] textarea`
          );
          if (input instanceof HTMLElement) {
            input.focus();
          }
        }, 2500);
      };

      embla.on('settle', onSettle);

      // Cleanup
      return () => {
        embla.off('settle', onSettle);
      };
    }
  }, [embla]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    posthog.capture('questionnaire_slide_change', {
      slide_number: index + 1,
      total_slides: questions.length + 1,
    });
  };

  const handleInputChange = (index: number) => {
    if (index < questions.length) {
      handleNext();
    }
  };

  const renderQuestion = (item: Question, index: number) => {
    const inputProps = form.getInputProps(`answers.${item.id}`);
    const onValueChange = (value: string | number | boolean | null) => {
      inputProps.onChange(value);
      handleInputChange(index);
    };

    const commonProps = {
      ...inputProps,
      onChange: onValueChange,
      radius: 'md',
      style: { minHeight: '200px' },
    };

    const textareaProps = {
      ...inputProps,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        inputProps.onChange(e.currentTarget.value);
        handleInputChange(index);
      },
      radius: 'md',
      style: { minHeight: '200px' },
    };

    let questionComponent;
    switch (item.type) {
      case 'INTEGER':
        questionComponent = (
          <NumberInput
            data-slide={index + 1}
            key={`question-${item.id}`}
            label={item.title}
            description="Rate from 0 to 10"
            min={0}
            max={10}
            withAsterisk
            size="md"
            {...commonProps}
          />
        );
        break;
      case 'BOOLEAN':
        questionComponent = (
          <RadioGroup
            data-slide={index + 1}
            key={`question-${item.id}`}
            label={item.title}
            withAsterisk
            size="md"
            {...commonProps}
          >
            <Group mt="xs">
              <Radio value="true" label="Yes" />
              <Radio value="false" label="No" />
            </Group>
          </RadioGroup>
        );
        break;
      case 'FREETEXT':
        questionComponent = (
          <Textarea
            data-slide={index + 1}
            key={`question-${item.id}`}
            label={item.title}
            withAsterisk
            autosize
            size="md"
            minRows={3}
            {...textareaProps}
          />
        );
        break;
      case 'RATING':
        questionComponent = (
          <RadioGroup
            data-slide={index + 1}
            key={`question-${item.id}`}
            label={item.title}
            description="Rate from 0 to 5"
            withAsterisk
            size="sm"
            {...commonProps}
          >
            <Stack gap={4} mt="xs">
              {[
                { value: '0', label: '0. Not done' },
                { value: '1', label: '1. Marginal effort' },
                { value: '2', label: '2. Some effort' },
                { value: '3', label: '3. OK' },
                { value: '4', label: '4. Very good' },
                { value: '5', label: '5. Exceptional' },
              ].map((option) => (
                <Radio.Card
                  key={option.value}
                  value={option.value}
                  radius="md"
                  p="xs"
                  styles={{
                    card: {
                      transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                      '&[data-checked]': {
                        backgroundColor: 'var(--mantine-color-blue-filled)',
                        borderColor: 'var(--mantine-color-blue-filled)',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <Text size="sm" c="inherit">{option.label}</Text>
                </Radio.Card>
              ))}
            </Stack>
          </RadioGroup>
        );
        break;
    }

    return (
      <Carousel.Slide key={item.id} h="100%">
        <Stack h="100%" justify="space-between" py="sm">
          <div>{questionComponent}</div>
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <ActionIcon
                variant="filled"
                size="lg"
                radius="xl"
                onClick={() => embla?.scrollPrev()}
                style={{ visibility: currentSlide === 0 ? 'hidden' : undefined }}
              >
                <IconChevronLeft />
              </ActionIcon>
              <Text size="sm" c="dimmed">
                Question {index + 2} of {questions.length + 1}
              </Text>
              <ActionIcon
                variant="filled"
                size="lg"
                radius="xl"
                onClick={handleNext}
                style={{ visibility: index === questions.length - 1 ? 'hidden' : undefined }}
              >
                <IconChevronRight />
              </ActionIcon>
            </Group>
            {index === questions.length - 1 && (
              <Button
                type="submit"
                disabled={submitting}
                leftSection={<IconSend />}
                radius="md"
                size="lg"
                fullWidth
              >
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            )}
          </Stack>
        </Stack>
      </Carousel.Slide>
    );
  };

  return (
    <div>
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{ height: 'calc(100vh - 230px)' }}
      >
        <Carousel
          getEmblaApi={setEmbla}
          slideSize="100%"
          height="calc(100vh - 230px)"
          draggable
          withControls={false}
          initialSlide={1}
          onSlideChange={handleSlideChange}
          styles={{
            root: {
              maxWidth: '100%',
            },
          }}
        >
          <Carousel.Slide h="100%">
            <Stack h="100%" justify="space-between" py="sm">
              <div>
                <DateInput
                  label="Date"
                  {...form.getInputProps('date')}
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue('date', value);
                      handleNext();
                    }
                  }}
                  radius="md"
                  size="md"
                />
              </div>
              <Group justify="space-between" align="center">
                <ActionIcon
                  variant="filled"
                  size="lg"
                  radius="xl"
                  style={{ visibility: 'hidden' }}
                >
                  <IconChevronLeft />
                </ActionIcon>
                <Text size="sm" c="dimmed">
                  Question 1 of {questions.length + 1}
                </Text>
                <ActionIcon
                  variant="filled"
                  size="lg"
                  radius="xl"
                  onClick={handleNext}
                >
                  <IconChevronRight />
                </ActionIcon>
              </Group>
            </Stack>
          </Carousel.Slide>

          {questions.map((item, index) => renderQuestion(item, index))}
        </Carousel>
      </form>
    </div>
  );
}
