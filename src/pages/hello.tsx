import React from 'react';
import { HelloWorld } from '@/components/HelloWorld';
import Layout from '@/components/layout/Layout';

const HelloPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <HelloWorld />
      </div>
    </Layout>
  );
};

export default HelloPage;
