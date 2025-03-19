import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import '../styles/global.css';
import Layout from '../components/layout/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}

export default MyApp;
