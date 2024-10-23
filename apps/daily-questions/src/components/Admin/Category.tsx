'use client';

import { updateCategory, createCategory, deleteCategory } from '@/lib/actions';
import {
  TextInput,
  Button,
  Table,
  Group,
  Box,
  Title,
  Paper,
} from '@mantine/core';
import { useState } from 'react';

export default function CategoryManager({ categories }) {
  const [editingCategory, setEditingCategory] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    if (editingCategory) {
      await updateCategory(editingCategory.id, name);
    } else {
      await createCategory(name);
    }
    setEditingCategory(null);
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <TextInput
          name="name"
          label="Category Name"
          required
          defaultValue={editingCategory?.name}
        />
        <Button type="submit" mt="md">
          {editingCategory ? 'Update' : 'Create'} Category
        </Button>
      </form>

      <Table striped highlightOnHover withBorder>
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
                <Group spacing="xs">
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
