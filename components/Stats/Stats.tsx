import { Container, Text, SimpleGrid, rem } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { useRef } from 'react';
import classes from './Stats.module.css';

const stats = [
  { value: '100+', label: 'Components' },
  { value: '50+', label: 'Templates' },
  { value: '1000+', label: 'GitHub Stars' },
  { value: '99%', label: 'TypeScript' },
];

export function Stats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.2,
  });

  const items = stats.map((stat) => (
    <div key={stat.label} className={classes.stat}>
      <Text className={classes.value}>{stat.value}</Text>
      <Text className={classes.label}>{stat.label}</Text>
    </div>
  ));

  return (
    <Container size="lg" py="xl" ref={containerRef}>
      <div className={`${classes.root} ${entry?.isIntersecting ? classes.visible : ''}`} ref={ref}>
        <SimpleGrid cols={{ base: 2, xs: 4 }}>{items}</SimpleGrid>
      </div>
    </Container>
  );
} 