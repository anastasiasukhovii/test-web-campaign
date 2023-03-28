import type { AppProps } from 'next/app';
import { AppShell } from '@mantine/core';
import NextNProgress from 'nextjs-progressbar';

import '../styles/_global.scss';
import Header from '../src/components/navigation/header';
import Sidebar from '../src/components/navigation/sidebar';
// amplify authentication
import { useRouter } from 'next/router';
import { AuthProvider } from '../src/utils/auth/authContext';
import { ProtectedPage } from '../src/utils/auth/ProtectedPage';
import Head from 'next/head';
import { LangProvider } from 'src/utils/lang/languageContext';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <NextNProgress color="#6a00ff" />
      <Head>
        <title>Updoot</title>
        <link rel="shortcut icon" href="/logo.svg" />
      </Head>
      <LangProvider>
        <AuthProvider>
          {router.pathname === '/' || router.pathname === '/auth/signin' || router.pathname === '/auth/signup'? (
            <>
              <Header />
              <Component {...pageProps} />
            </>
          ) : (
            <ProtectedPage>
              <AppShell
                navbarOffsetBreakpoint="sm"
                navbar={<Sidebar />}
                header={<Header />}>
                <Component {...pageProps} />
              </AppShell>
            </ProtectedPage>
          )}
        </AuthProvider>
      </LangProvider>
    </>
  );
}

export default MyApp;
