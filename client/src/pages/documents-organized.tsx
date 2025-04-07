import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import DocumentOrganizer from '@/components/documents/DocumentOrganizer';

export default function DocumentsOrganizedPage() {
  const [userId] = useState<number>(1); // Mock user ID for demonstration
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // In a real implementation, we would get the current user ID from auth context
  // This is just a placeholder since we're using a static userId

  const handleSelectDocument = (documentId: number) => {
    // Navigate to document detail page
    navigate(`/document-review/${documentId}`);
    
    toast({
      title: "Document Selected",
      description: `You've selected document #${documentId}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-gray-600">
            Organized by province, legal issue, and sub-issue for easy access
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          {userId ? (
            <DocumentOrganizer 
              userId={userId} 
              onSelectDocument={handleSelectDocument}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading user information...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}