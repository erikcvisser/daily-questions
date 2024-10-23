'use client';

import {
  createLibraryQuestion,
  deleteLibraryQuestion,
  updateLibraryQuestion,
} from '@/lib/actions';
import {
  TextInput,
  Select,
  NumberInput,
  Button,
  Table,
  Group,
} from '@mantine/core';
import { Category, LibraryQuestion } from '@prisma/client';
import { useState } from 'react';

export default function LibraryQuestionManager({
  libraryQuestions,
  categories,
}: {
  libraryQuestions: (LibraryQuestion & { category: Category })[];
  categories: Category[];
}) {
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formDataObject: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value.toString();
    });

    try {
      if (editingQuestion) {
        await updateLibraryQuestion(editingQuestion.id, formDataObject);
      } else {
        await createLibraryQuestion(formDataObject);
      }
      setEditingQuestion(null);
      // Instead of reloading the page, update the state
      //const updatedQuestions = await fetchUpdatedQuestions();
      //setLibraryQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error submitting question:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <TextInput
          name="title"
          label="Title"
          required
          defaultValue={editingQuestion?.title}
        />
        <Select
          name="type"
          label="Type"
          required
          data={[
            { value: 'INTEGER', label: 'Integer' },
            { value: 'BOOLEAN', label: 'Boolean' },
            { value: 'FREETEXT', label: 'Free Text' },
          ]}
          defaultValue={editingQuestion?.type}
        />
        <NumberInput
          name="targetInt"
          label="Target Integer"
          defaultValue={editingQuestion?.targetInt}
        />
        <Select
          name="targetBool"
          label="Target Boolean"
          data={[
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' },
          ]}
          defaultValue={editingQuestion?.targetBool?.toString()}
        />
        <Select
          name="categoryId"
          label="Category"
          required
          data={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
          defaultValue={editingQuestion?.categoryId}
        />
        <Button type="submit" mt="md">
          {editingQuestion ? 'Update' : 'Create'} Library Question
        </Button>
      </form>

      <Table mt="xl">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {libraryQuestions.map((question) => (
            <Table.Tr key={question.id}>
              <Table.Td>{question.title}</Table.Td>
              <Table.Td>{question.type}</Table.Td>
              <Table.Td>{question.category.name}</Table.Td>
              <Table.Td>
                <Group>
                  <Button onClick={() => setEditingQuestion(question)}>
                    Edit
                  </Button>
                  <Button
                    color="red"
                    onClick={() => deleteLibraryQuestion(question.id)}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
