import { Stack } from '@mantine/core';
import { NavBar } from '@/components/Navbar/Navbar';
import { Hero } from '@/components/Hero/Hero';
import { Stats } from '@/components/Stats/Stats';
import { Features } from '@/components/Features/Features';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import classes from './index.module.css';

export default function HomePage() {
  return (
    <Stack className={classes.container}>
      <NavBar />
      <Hero />
      <Stats />
      <Features />
      <ColorSchemeToggle />
    </Stack>
  );
}
