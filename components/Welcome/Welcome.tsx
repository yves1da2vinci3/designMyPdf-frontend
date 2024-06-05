import { Title, Text, Anchor } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" >
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          Transactional{' '}
        </Text>
      </Title>
      <Text color="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
      Stop struggling with PDF in your projects{' '},this project is open source version of transactional.dev 
       
        <Anchor href="https://transactional.dev/" size="lg">
          this one
        </Anchor>
      </Text>
    </>
  );
}
