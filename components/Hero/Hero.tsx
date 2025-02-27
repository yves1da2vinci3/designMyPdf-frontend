import { Box, Container, Title, Text, Button, Group, Stack, rem } from '@mantine/core';
import { IconFileText, IconPencil } from '@tabler/icons-react';
import classes from './Hero.module.css';

const Hero = () => (
    <Container size="lg" className={classes.wrapper}>
      <Box className={classes.inner}>
        <div className={classes.shapes}>
          <div className={classes.hexagon} />
          <div className={classes.circle}>
            <Text className={classes.circleText}>Browse Templates</Text>
          </div>
        </div>

        <Stack className={classes.content}>
          <Title className={classes.title}>
            Design Beautiful
            <br />
            PDFs with Modern
            <br />
            Components <span className={classes.highlight}>📄</span>
          </Title>

          <Text className={classes.description}>
            Create professional PDFs effortlessly with our powerful design toolkit. Drag & drop
            components, customize templates, and export in seconds.
          </Text>

          <div className={classes.stats}>
            <div className={classes.statBox}>
              <Text className={classes.statValue}>100+</Text>
              <Text className={classes.statLabel}>Components</Text>
              <Text className={classes.statSubtext}>ready to use</Text>
            </div>

            <div className={classes.statBox}>
              <Text className={classes.statValue}>50+</Text>
              <Text className={classes.statLabel}>Templates</Text>
              <Text className={classes.statSubtext}>for quick start</Text>
            </div>
          </div>

          <Group className={classes.controls}>
            <Button
              size="xl"
              className={classes.control}
              variant="filled"
              leftSection={<IconFileText size={rem(22)} />}
            >
              Create PDF
            </Button>

            <Button
              size="xl"
              variant="outline"
              className={classes.control}
              leftSection={<IconPencil size={rem(22)} />}
            >
              Try Editor
            </Button>
          </Group>
        </Stack>
      </Box>
    </Container>
);

export default Hero;
