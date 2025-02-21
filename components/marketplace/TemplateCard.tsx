import { Card, Image, Text, Badge, Button, Group, Stack, Rating } from '@mantine/core';
import { Template } from '../../services/templateService';

interface TemplateCardProps {
  template: Template;
  onDownload: () => void;
}

export default function TemplateCard({ template, onDownload }: TemplateCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={template.thumbnail}
          height={160}
          alt={template.title}
          fallbackSrc="https://placehold.co/600x400?text=Template+Preview"
        />
      </Card.Section>

      <Stack mt="md" gap="xs">
        <Text fw={500} size="lg" lineClamp={2}>
          {template.title}
        </Text>

        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Rating value={template.rating} readOnly size="sm" />
            <Text size="sm" c="dimmed">({template.reviews} reviews)</Text>
          </Group>
          <Badge variant="light">{template.category}</Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {template.description}
        </Text>

        <Stack gap="xs">
          {template.features.map((feature, index) => (
            <Text key={index} size="sm">• {feature}</Text>
          ))}
        </Stack>

        <Text fw={700} size="xl" mt="md">
          ${template.price}
        </Text>

        <Group mt="md">
          <Button variant="filled" onClick={onDownload} fullWidth>
            Buy Now
          </Button>
          <Button variant="light" fullWidth>
            Add to Cart
          </Button>
        </Group>
      </Stack>
    </Card>
  );
} 