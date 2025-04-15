import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import DocumentManager from '@/components/documents/DocumentManager';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Folder, FileText, User, Lock, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { webSocketService, MessageType, WebSocketMessage } from '@/lib/webSocketService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function DocumentManagement() {
  const [userId, setUserId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error' | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Simulate a user login check
  useEffect(() => {
    // For demo purposes, we'll just set a fixed user ID
    // In a real application, this would come from an authentication system
    setUserId(1);
    
    // If we don't have a logged in user, we could show a message or redirect
  }, []);

  // Set up WebSocket connection and listeners
  useEffect(() => {
    if (!userId) return;
    
    // Initialize connection
    webSocketService.connect();
    
    // Establish identity after successful connection
    setTimeout(() => {
      if (userId) {
        try {
          webSocketService.identify(userId);
        } catch (error) {
          console.error("Error identifying with WebSocket:", error);
          setConnectionStatus('error');
          setConnectionMessage('Error connecting to real-time updates');
        }
      }
    }, 1000);
    
    // Subscribe to document generated notifications
    const documentSub = webSocketService.subscribe(
      MessageType.DOCUMENT_GENERATED, 
      (message: WebSocketMessage) => {
        console.log('Document generated notification received:', message);
        
        // Invalidate document queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/user-documents/user', userId] });
        
        // Show toast notification
        toast({
          title: "Document Generated",
          description: `Your document "${message.templateName || 'New Document'}" is ready.`,
        });
      }
    );
    
    // Subscribe to system notifications to monitor connection status
    const systemNotificationSub = webSocketService.subscribe(
      MessageType.SYSTEM_NOTIFICATION,
      (message: WebSocketMessage) => {
        console.log('System notification received:', message);
        
        // Update connection status based on message
        if (message.status === 'connected') {
          setConnectionStatus('connected');
          setConnectionMessage(null);
        } else if (message.status === 'disconnected') {
          setConnectionStatus('disconnected');
          setConnectionMessage('Connection lost. Attempting to reconnect...');
        } else if (message.status === 'error' || message.status === 'failed') {
          setConnectionStatus('error');
          setConnectionMessage(message.message || 'Error with real-time updates');
        }
      }
    );
    
    // Clean up function
    return () => {
      documentSub();
      systemNotificationSub();
    };
  }, [userId, queryClient, toast]);
  
  // Function to manually reconnect
  const handleReconnect = () => {
    setConnectionStatus('disconnected');
    setConnectionMessage('Attempting to reconnect...');
    webSocketService.forceReconnect();
    
    // Identify after a brief delay
    setTimeout(() => {
      if (userId) {
        try {
          webSocketService.identify(userId);
        } catch (error) {
          console.error("Error identifying with WebSocket:", error);
        }
      }
    }, 1000);
  };
  
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
        {/* Connection Status Alert */}
        {connectionStatus === 'disconnected' && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Connection Status</AlertTitle>
            <AlertDescription className="text-yellow-700">
              {connectionMessage || 'Connection to real-time updates has been lost. Attempting to reconnect...'}
              <Button variant="ghost" size="sm" onClick={handleReconnect} className="ml-2">
                <RefreshCw className="h-4 w-4 mr-1" /> Reconnect
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus === 'error' && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800">Connection Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {connectionMessage || 'Failed to establish real-time connection. Document updates may be delayed.'}
              <Button variant="ghost" size="sm" onClick={handleReconnect} className="ml-2">
                <RefreshCw className="h-4 w-4 mr-1" /> Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DocumentManager userId={userId} />
        </div>
      </div>
    </div>
  );
}