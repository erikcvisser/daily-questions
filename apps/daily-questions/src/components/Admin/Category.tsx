'use client';

import { updateCategory, createCategory, deleteCategory } from '@/lib/actions';
import { TextInput, Button, Table, Group, Box } from '@mantine/core';
import { Category } from '@prisma/client';
import { useState } from 'react';

export default function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;

    if (!name.trim()) {
      console.error('Category name is required');
      // TODO: Show error message to user (e.g., using a toast notification)
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, name);
      } else {
        await createCategory(name);
      }
      setEditingCategory(null);
    } catch (error) {
      console.error('Error submitting category:', error);
      // TODO: Show error message to user (e.g., using a toast notification)
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <TextInput
          name="name"
          label="Category Name"
          required
          defaultValue={editingCategory?.name || ''}
        />
        <Button type="submit" mt="md">
          {editingCategory ? 'Update' : 'Create'} Category
        </Button>
      </form>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((category) => (
            <Table.Tr key={category.id}>
              <Table.Td>{category.name}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => deleteCategory(category.id)}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
