import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { ReactElement, ReactNode, useEffect } from 'react';
import { NextPage } from 'next';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { authApi } from '@/api/authApi';
import { AppConfig } from '@/utils/appConfig';

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const screensNameAllowedToMoveToHomePage = ['/login', '/signup'];

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  const router = useRouter();

  useEffect(() => {
    const userSession = authApi.getUserSession();
    const pathName = router.pathname;
    console.log(pathName);

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
          <link rel="shortcut icon" href="/favicon.svg" />
        </Head>
        {getLayout(
          <DndProvider backend={HTML5Backend}>
            <Component {...pageProps} />
          </DndProvider>
        )}
      </ModalsProvider>
    </MantineProvider>
  );
}
