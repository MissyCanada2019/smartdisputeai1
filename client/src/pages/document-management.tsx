import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import DocumentManager from '@/components/documents/DocumentManager';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Folder, FileText, User, Lock } from 'lucide-react';

export default function DocumentManagement() {
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Simulate a user login check
  useEffect(() => {
    // For demo purposes, we'll just set a fixed user ID
    // In a real application, this would come from an authentication system
    setUserId(1);
    
    // If we don't have a logged in user, we could show a message or redirect
  }, []);
  
  if (!userId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 text-center">
          <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in or create an account to access your document management system.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500">
            Manage, organize, and access all your legal documents
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DocumentManager userId={userId} />
        </div>
      </div>
    </div>
  );
}