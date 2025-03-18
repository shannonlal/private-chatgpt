import React from 'react';
import { HelloWorld } from '../components/HelloWorld';
import { Layout } from '../components/layout/Layout';

export default function HelloPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Hello World Endpoint Demo</h1>
        <HelloWorld />
      </div>
    </Layout>
  );
}
