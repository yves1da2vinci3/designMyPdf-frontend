import { ReactElement, ReactNode, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { authApi } from '@/api/authApi';
import { theme } from '../theme';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '../styles/global.css';

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const screensNameAllowedToMoveToHomePage = ['/login', '/signup'];

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const router = useRouter();

  useEffect(() => {
    const userSession = authApi.getUserSession();
    const pathName = router.pathname;

    if (userSession?.accessToken) {
      if (screensNameAllowedToMoveToHomePage.includes(pathName)) {
        router.replace('/dashboard');
      } else {
        router.replace(pathName);
      }
    }
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <Head>
          <title>DesignMyPDF</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        {getLayout(
          <DndProvider backend={HTML5Backend}>
            <Component {...pageProps} />
          </DndProvider>,
        )}
      </ModalsProvider>
    </MantineProvider>
  );
}
