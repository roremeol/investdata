import Head from 'next/head';
import Link from 'next/link';
import Layout from './components/layout';

export default function Page1() {
    return (
        <Layout>
          <Head>
            <title>Page 1</title>
          </Head>  
          <h1>Page 1</h1>
        </Layout>
      );
}