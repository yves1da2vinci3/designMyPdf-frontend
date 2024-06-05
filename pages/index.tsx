import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Stack } from '@mantine/core';
import styles from './index.module.css'
import { NavBar } from '@/components/Navbar/Navbar';
export default function HomePage() {
  return (
    <Stack className={styles.container} >
      <NavBar/>
      <Welcome />
      <ColorSchemeToggle />
    </Stack>
  );
}
