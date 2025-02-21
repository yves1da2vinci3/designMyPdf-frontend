import {
  Container,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  Stack,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { MainLayout } from '../../layouts/MainLayout';
import { templateService } from '../../services/templateService';

export default function AddTemplate() {
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      thumbnail: '',
      features: '',
    },
    validate: {
      title: (value: string) => (!value ? 'Title is required' : null),
      description: (value: string) => (!value ? 'Description is required' : null),
      price: (value: number) => (value < 0 ? 'Price must be positive' : null),
      category: (value: string) => (!value ? 'Category is required' : null),
      features: (value: string) => (!value ? 'Features are required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const featuresArray = values.features.split('\n').filter((f) => f.trim());
      const template = {
        ...values,
        features: featuresArray,
        rating: 0,
        reviews: 0,
      };

      await templateService.addTemplate(template);

      notifications.show({
        title: 'Success',
        message: 'Template added successfully',
        color: 'green',
      });

      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add template. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <MainLayout>
      <Container size="sm" mt="xl">
        <Title order={2} mb="xl">
          Add New Template
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="Enter template title"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Enter template description"
              required
              minRows={3}
              {...form.getInputProps('description')}
            />

            <NumberInput
              label="Price"
              placeholder="Enter price"
              required
              min={0}
              decimalScale={2}
              {...form.getInputProps('price')}
            />

            <Select
              label="Category"
              placeholder="Select category"
              required
              data={[
                { value: 'business', label: 'Business' },
                { value: 'personal', label: 'Personal' },
                { value: 'education', label: 'Education' },
                { value: 'creative', label: 'Creative' },
              ]}
              {...form.getInputProps('category')}
            />

            <TextInput
              label="Thumbnail URL"
              placeholder="Enter thumbnail image URL"
              {...form.getInputProps('thumbnail')}
            />

            <Textarea
              label="Features"
              placeholder="Enter features (one per line)"
              required
              minRows={3}
              description="Enter each feature on a new line"
              {...form.getInputProps('features')}
            />

            <Button type="submit" mt="md">
              Add Template
            </Button>
          </Stack>
        </form>
      </Container>
    </MainLayout>
  );
}
