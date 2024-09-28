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

  return (
    <>
      <Select
        label="Filter by Category"
        placeholder="All Categories"
        data={categories}
        value={category || 'All'}
        onChange={(value) => setCategory(value === 'All' ? null : value)}
        mb="md"
      />

      <Grid gutter="sm">
        {filteredLibraryQuestions.map((question) => (
          <Grid.Col span={4} key={question.id}>
            <Card shadow="sm" padding="sm">
              <Checkbox
                label={question.title}
                checked={selectedQuestions.includes(question.id)}
                onChange={() => handleSelect(question.id)}
              />
              <Text size="sm" color="dimmed">
                Category: {question.category.name}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Group justify="flex-end" mt="md">
        <Button onClick={handleCopy} disabled={selectedQuestions.length === 0}>
          Copy Selected Questions
        </Button>
      </Group>
    </>
  );
}
