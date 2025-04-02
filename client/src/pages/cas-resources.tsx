import React from 'react';
import CASResources from '@/components/resources/CASResources';

const CASResourcesPage: React.FC = () => {
  return (
    <>
      <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Children's Aid Society Resources
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Helping parents navigate the child welfare system and advocate effectively
            </p>
          </div>
        </div>
      </div>
      
      <CASResources />
    </>
  );
};

export default CASResourcesPage;