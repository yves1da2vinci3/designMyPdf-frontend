import { Container, Text, SimpleGrid, rem, Title } from '@mantine/core';
import { IconPalette, IconComponents, IconDeviceLaptop, IconBrandGit } from '@tabler/icons-react';
import classes from './Features.module.scss';

const features = [
  {
    icon: IconPalette,
    title: 'Modern Design Tools',
    description:
      'Create beautiful PDFs with our modern design tools. Includes templates, components, and customizable styles.',
  },
  {
    icon: IconComponents,
    title: 'Component Library',
    description:
      'Extensive collection of pre-built components. Tables, charts, forms, and more - all ready to use.',
  },
  {
    icon: IconDeviceLaptop,
    title: 'Developer Friendly',
    description:
      'Built with TypeScript and React. Easy to integrate, customize, and extend with your existing tools.',
  },
  {
    icon: IconBrandGit,
    title: 'Open Source',
    description:
      'Free and open source. Join our community, contribute, and help make PDF design better for everyone.',
  },
];

const Features = () => {
  const items = features.map((feature) => (
    <div className={classes.feature} key={feature.title}>
      <feature.icon style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
      <Text className={classes.title} mt="md">
        {feature.title}
      </Text>
      <Text className={classes.description} size="sm">
        {feature.description}
      </Text>
    </div>
  ));

  return (
    <Container size="lg" py="xl">
      <Title order={2} className={classes.sectionTitle} ta="center" mt="sm">
        Everything you need to design PDFs
      </Title>

      <Text c="dimmed" className={classes.sectionDescription} ta="center" mt="md">
        A complete toolkit for creating professional PDFs with modern web technologies
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={50} mt={50}>
        {items}
      </SimpleGrid>
    </Container>
  );
};

export default Features;
