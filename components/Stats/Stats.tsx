import { Container, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import classes from './Stats.module.scss';

const data = [
  {
    title: 'Page Views',
    value: '456,133',
    diff: 34,
  },
  {
    title: 'New Users',
    value: '2,175',
    diff: -13,
  },
  {
    title: 'Completed Orders',
    value: '1,994',
    diff: 18,
  },
];

function Stats() {
  const stats = data.map((stat) => (
    <Paper withBorder p="md" radius="md" key={stat.title}>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" tt="uppercase" fw={700} fz="xs" className={classes.label}>
            {stat.title}
          </Text>
          <Text fw={700} fz="xl">
            {stat.value}
          </Text>
        </div>
      </Group>
    </Paper>
  ));

  return (
    <div className={classes.root}>
      <Container>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>{stats}</SimpleGrid>
      </Container>
    </div>
  );
}

export default Stats;
