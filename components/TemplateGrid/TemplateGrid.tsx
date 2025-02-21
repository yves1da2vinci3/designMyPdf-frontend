import { SimpleGrid, Text, Title, Group, Button, rem } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import classes from './TemplateGrid.module.css';
import { TemplateDTO } from '@/api/templateApi';

interface TemplateGridProps {
  templates: TemplateDTO[];
  onCreateTemplate: () => void;
  onTemplateSelect: (template: TemplateDTO) => void;
  onTemplateDelete: (id: number) => void;
}

export function TemplateGrid({
  templates,
  onCreateTemplate,
  onTemplateSelect,
  onTemplateDelete,
}: TemplateGridProps) {
  return (
    <div className={classes.wrapper}>
      <Group justify="space-between" mb="xl">
        <div>
          <Title className={classes.title}>Templates</Title>
          <Text className={classes.description}>
            Choose from our collection of professional templates or create your own
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={rem(16)} />}
          variant="filled"
          size="md"
          onClick={onCreateTemplate}
          className={classes.createButton}
        >
          Create Template
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {templates.map((template) => (
          <div
            key={template.ID}
            className={classes.template}
            onClick={() => onTemplateSelect(template)}
          >
            <div className={classes.templatePreview}>
              {/* Add preview image here if available */}
              <div className={classes.previewPlaceholder}>
                <Text size="xl" fw={700}>
                  {template.name.charAt(0)}
                </Text>
              </div>
            </div>
            <div className={classes.templateInfo}>
              <Text className={classes.templateName}>{template.name}</Text>
              <Text className={classes.templateMeta}>
                Created {new Date(template.CreatedAt).toLocaleDateString()}
              </Text>
            </div>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              className={classes.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                onTemplateDelete(template.ID);
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </SimpleGrid>
    </div>
  );
} 