'use client';

import { submitQuestionnaireSchema } from '@/lib/definitions';
import {
  Button,
  Container,
  Group,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { Question, Answer, Submission } from '@prisma/client';
import { IconArrowRight, IconSend } from '@tabler/icons-react';
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
            `[data-slide="${currentIndex}"] input:not([type="hidden"]), [data-slide="${currentIndex}"] textarea, [data-slide="${currentIndex}"] .mantine-Select-input`
          );
          if (input instanceof HTMLElement) {
            input.focus();
            if (input.classList.contains('mantine-Select-input')) {
              input.click();
            }
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
    const formProps = {
      ...form.getInputProps(`answers.${item.id}`),
      onChange: (value: any) => {
        form.getInputProps(`answers.${item.id}`).onChange(value);
        handleInputChange(index);
      },
    };

    const commonProps = {
      ...formProps,
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
            {...commonProps}
          />
        );
        break;
      case 'RATING':
        questionComponent = (
          <Select
            data-slide={index + 1}
            key={`question-${item.id}`}
            label={item.title}
            size="md"
            description="Rate from 0 to 5"
            allowDeselect={false}
            data={[
              { value: '0', label: '0. Not done' },
              { value: '1', label: '1. Marginal effort' },
              { value: '2', label: '2. Some effort' },
              { value: '3', label: '3. OK' },
              { value: '4', label: '4. Very good' },
              { value: '5', label: '5. Exceptional' },
            ]}
            withAsterisk
            {...commonProps}
          />
        );
        break;
    }

    return (
      <Carousel.Slide key={item.id} h="100%">
        <Container size="sm" py="sm" h="100%">
          <Stack h="100%" justify="space-between">
            <div>{questionComponent}</div>
            <Group justify="space-between" mb="0">
              <Text size="sm" c="dimmed">
                Question {index + 2} of {questions.length + 1}
              </Text>
              {index < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  rightSection={<IconArrowRight />}
                  radius="md"
                  size="lg"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  leftSection={<IconSend />}
                  radius="md"
                  size="lg"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              )}
            </Group>
          </Stack>
        </Container>
      </Carousel.Slide>
    );
  };

  return (
    <div>
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{ height: 'calc(100vh - 250px)' }}
      >
        <Carousel
          getEmblaApi={setEmbla}
          slideSize="100%"
          height="calc(100vh - 250px)"
          draggable
          withControls
          withIndicators
          controlsOffset="xs"
          initialSlide={1}
          onSlideChange={handleSlideChange}
          nextControlProps={{
            style: {
              visibility:
                currentSlide === questions.length ? 'hidden' : undefined,

              width: '40px',
              marginRight: '-20px',
              height: '40px',
              backgroundColor: 'var(--mantine-color-blue-filled)',
              border: 'none',
              color: 'white',
            },
          }}
          previousControlProps={{
            style: {
              visibility: currentSlide === 0 ? 'hidden' : undefined,
              marginLeft: '-20px',
            },
          }}
          styles={{
            root: {
              maxWidth: '100%',
            },
            control: {
              '&[dataInactive]': {
                opacity: 0,
                cursor: 'default',
              },
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--mantine-color-blue-filled)',
              border: 'none',
              color: 'white',
              '&:hover': {
                backgroundColor: 'var(--mantine-color-blue-filled-hover)',
              },
            },
          }}
        >
          <Carousel.Slide h="100%">
            <Container size="sm" py="sm" h="100%">
              <Stack h="100%" justify="space-between">
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
                <Group justify="space-between" mb="0">
                  <Text size="sm" c="dimmed">
                    Question 1 of {questions.length + 1}
                  </Text>
                  <Button
                    onClick={handleNext}
                    rightSection={<IconArrowRight />}
                    radius="md"
                    size="lg"
                  >
                    Next
                  </Button>
                </Group>
              </Stack>
            </Container>
          </Carousel.Slide>

          {questions.map((item, index) => renderQuestion(item, index))}
        </Carousel>
      </form>
    </div>
  );
}
