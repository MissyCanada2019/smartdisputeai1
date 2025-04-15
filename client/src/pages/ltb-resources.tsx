import React from 'react';
import LTBResources from '@/components/resources/LTBResources';

const LTBResourcesPage: React.FC = () => {
  return (
    <>
      <div className="bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Ontario Landlord & Tenant Board
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Resources for navigating tenant rights and disputes in Ontario
            </p>
          </div>
        </div>
      </div>
      
      <LTBResources />
    </>
  );
};

export default LTBResourcesPage;