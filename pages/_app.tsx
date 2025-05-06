// Imports React
import { ReactElement, ReactNode, useEffect } from 'react';

// Imports Next.js
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Imports tiers
import { CodeHighlightAdapterProvider, createHighlightJsAdapter } from '@mantine/code-highlight';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Imports des styles
import '@mantine/code-highlight/styles.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'highlight.js/styles/atom-one-dark.css';
import '../styles/global.css';

// Imports locaux
import { authApi } from '@/api/authApi';
import { theme } from '../theme';

// Enregistrer les langages nécessaires
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('json', json);

// Créer l'adaptateur highlight.js
const highlightJsAdapter = createHighlightJsAdapter(hljs);

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
      <CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
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
      </CodeHighlightAdapterProvider>
    </MantineProvider>
  );
}
