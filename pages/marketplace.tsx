import { useState, useEffect } from 'react';
import { Container, Grid, Text, Group, TextInput, Select, LoadingOverlay } from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import TemplateCard from '../components/marketplace/TemplateCard';
import { MainLayout } from '../layouts/MainLayout';
import { templateService, Template } from '../services/templateService';

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates({
        search: searchQuery,
        category: category || undefined,
      });
      setTemplates(response.templates);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch templates. Please try again later.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [searchQuery, category]);

  const handleDownload = async (templateId: string) => {
    try {
      const { downloadUrl } = await templateService.downloadTemplate(templateId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to download template. Please try again later.',
        color: 'red',
      });
    }
  };

  return (
    <MainLayout>
      <Container size="xl" mt="xl" pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        <Group justify="space-between" mb="xl">
          <Text size="xl" fw={700}>
            Template Marketplace
          </Text>
          <Group>
            <TextInput
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            <Select
              placeholder="Category"
              value={category}
              onChange={setCategory}
              data={[
                { value: 'business', label: 'Business' },
                { value: 'personal', label: 'Personal' },
                { value: 'education', label: 'Education' },
                { value: 'creative', label: 'Creative' },
              ]}
              leftSection={<IconFilter size={16} />}
            />
          </Group>
        </Group>

        <Grid>
          {templates.map((template) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={template.id}>
              <TemplateCard template={template} onDownload={() => handleDownload(template.id)} />
            </Grid.Col>
          ))}
        </Grid>

        {!loading && templates.length === 0 && (
          <Text ta="center" mt="xl" c="dimmed">
            No templates found. Try adjusting your search criteria.
          </Text>
        )}
      </Container>
    </MainLayout>
  );
}
