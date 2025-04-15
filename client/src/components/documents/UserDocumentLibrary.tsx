import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileIcon, FileTextIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  name: string;
  path: string;
  size: number;
  createdAt: string;
}

interface UserDocumentLibraryProps {
  userId: string | number;
  onSelectDocument?: (document: Document) => void;
  onAnalyzeDocument?: (document: Document) => void;
}

const UserDocumentLibrary: React.FC<UserDocumentLibraryProps> = ({ 
  userId = 'guest',
  onSelectDocument,
  onAnalyzeDocument
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("openai");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user documents
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/document-analyzer/user-documents', userId],
    queryFn: async () => {
      const response = await apiRequest(`/api/document-analyzer/user-documents?userId=${userId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      return response.json();
    },
    refetchOnWindowFocus: false
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <FileTextIcon className="w-6 h-6 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <FileTextIcon className="w-6 h-6 text-blue-500" />;
    } else if (['txt', 'text'].includes(extension || '')) {
      return <FileTextIcon className="w-6 h-6 text-gray-500" />;
    }
    
    return <FileIcon className="w-6 h-6 text-gray-500" />;
  };

  const handleAnalyzeDocument = async (document: Document) => {
    setSelectedDocument(document);
    
    if (onAnalyzeDocument) {
      onAnalyzeDocument(document);
    } else {
      toast({
        title: "Document Selected",
        description: `Selected ${document.name} for analysis with ${selectedModel}`,
      });
      
      // Here you would typically trigger the analysis
      // This is a placeholder for direct implementation
      try {
        const formData = new FormData();
        
        // You'd need to fetch the actual file data here
        // This is a simplified example
        toast({
          title: "Analysis Started",
          description: `Starting analysis of ${document.name}`,
        });
        
        // Simplified placeholder - in a real implementation,
        // you'd need to fetch the file content before analysis
      } catch (error) {
        toast({
          title: "Analysis Failed",
          description: "Unable to analyze document",
          variant: "destructive"
        });
      }
    }
  };

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    
    if (onSelectDocument) {
      onSelectDocument(document);
    } else {
      toast({
        title: "Document Selected",
        description: `Selected ${document.name}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800">
        <p>Error loading documents: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/document-analyzer/user-documents'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  const documents = data?.documents || [];

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>Your saved documents will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <FileIcon className="w-12 h-12 mb-4" />
            <p>No documents found</p>
            <p className="text-sm mt-1">Upload documents for analysis to start building your library</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Library</CardTitle>
        <CardDescription>Your saved documents for legal analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AI Model</SelectLabel>
                <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="dual">Dual Analysis (Both Models)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
          {documents.map((doc: Document) => (
            <div 
              key={doc.path} 
              className={`flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer
                ${selectedDocument?.path === doc.path ? 'bg-blue-50 border-blue-200' : ''}
              `}
              onClick={() => handleSelectDocument(doc)}
            >
              <div className="mr-3">
                {getFileIcon(doc.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{doc.name}</div>
                <div className="text-xs text-muted-foreground flex items-center space-x-2">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnalyzeDocument(doc);
                }}
              >
                Analyze
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Manage Documents
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Document Management</AlertDialogTitle>
              <AlertDialogDescription>
                This feature is coming soon! You'll be able to organize, delete, and manage your documents.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default UserDocumentLibrary;