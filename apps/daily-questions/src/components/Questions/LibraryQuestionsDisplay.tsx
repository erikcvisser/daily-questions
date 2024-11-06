'use client';

import { useState, useMemo } from 'react';
import {
  Group,
  Card,
  Checkbox,
  Button,
  Select,
  Grid,
  Text,
} from '@mantine/core';
import { Category, LibraryQuestion } from '@prisma/client';
import { copyLibraryQuestions } from '@/lib/actions';
import { useMediaQuery } from '@mantine/hooks';

async function onCopy(selectedIds: string[]) {
  try {
    await copyLibraryQuestions(selectedIds);
  } catch (error) {
    console.error('An error occurred while copying questions:', error);
  }
}

export default function LibraryQuestionsDisplay({
  libraryQuestions,
}: {
  libraryQuestions: (LibraryQuestion & { category: Category })[];
}) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(null);

  const filteredLibraryQuestions = useMemo(() => {
    if (!category) return libraryQuestions;
    return libraryQuestions.filter((q) => q.category.name === category);
  }, [libraryQuestions, category]);

  const categories = useMemo(
    () => ['All', ...new Set(libraryQuestions.map((q) => q.category.name))],
    [libraryQuestions]
  );

  const handleSelect = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleCopy = () => {
    onCopy(selectedQuestions);
    setSelectedQuestions([]);
  };

  const isMobile = useMediaQuery('(max-width: 48em)');
  const isTablet = useMediaQuery('(max-width: 62em)');

  return (
    <>
      <Select
        label="Filter by category"
        placeholder="All categories"
        data={categories}
        value={category || 'All'}
        onChange={(value) => setCategory(value === 'All' ? null : value)}
        mb="md"
      />

      <Grid>
        {filteredLibraryQuestions.map((question) => (
          <Grid.Col span={isMobile ? 12 : isTablet ? 6 : 4} key={question.id}>
            <Card
              shadow="sm"
              padding="sm"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative', // Add this
              }}
              onClick={() => handleSelect(question.id)}
            >
              <Checkbox
                checked={selectedQuestions.includes(question.id)}
                onChange={() => handleSelect(question.id)}
                styles={{
                  root: {
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    paddingTop: '4px',
                  },
                  input: {
                    cursor: 'pointer',
                  },
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Text
                size="sm"
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  paddingLeft: '32px', // Add space for checkbox
                }}
              >
                {question.title}
              </Text>
              <Text
                size="sm"
                color="dimmed"
                mt="auto"
                style={{ paddingLeft: '32px' }}
              >
                Category: {question.category.name}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Group justify="flex-end" mt="md">
        <Button onClick={handleCopy} disabled={selectedQuestions.length === 0}>
          Copy selected questions
        </Button>
      </Group>
    </>
  );
}
