import React, { useState } from 'react';
import { Send, Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

/**
 * Document Email Form Component
 * Allows users to email documents to themselves or others
 */
export default function DocumentEmailForm({ 
  documentId, 
  documentType,
  prefilledEmail = '',
  prefilledName = '',
  onSuccess
}: { 
  documentId?: string | number;
  documentType?: string;
  prefilledEmail?: string;
  prefilledName?: string;
  onSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>(prefilledEmail);
  const [name, setName] = useState<string>(prefilledName);
  const [documentTypeInput, setDocumentTypeInput] = useState<string>(documentType || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.some(ext => fileExtension.endsWith(ext))) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // Handle document type input change
  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTypeInput(e.target.value);
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Submit the form to send the document
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter the recipient's name",
        variant: "destructive"
      });
      return;
    }
    
    if (!documentTypeInput) {
      toast({
        title: "Document type required",
        description: "Please specify the document type",
        variant: "destructive"
      });
      return;
    }
    
    if (!file && !documentId) {
      toast({
        title: "No document selected",
        description: "Please upload a document or provide a document ID",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('documentType', documentTypeInput);
      
      if (documentId) {
        formData.append('documentId', documentId.toString());
      }
      
      if (file) {
        formData.append('document', file);
      }
      
      // Add user ID if available from auth context
      // formData.append('userId', userId); // Uncomment when auth is implemented
      
      const response = await queryClient.apiRequest('/api/documents/send-email', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send document');
      }
      
      const data = await response.json();
      
      // Show success message
      toast({
        title: "Document sent",
        description: `Document was successfully sent to ${email}`,
        variant: "default"
      });
      
      setIsSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending document:', error);
      toast({
        title: "Error sending document",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setEmail(prefilledEmail);
    setName(prefilledName);
    setDocumentTypeInput(documentType || '');
    setIsSuccess(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Email Document</CardTitle>
        <CardDescription>
          Send a document via email to yourself or someone else
        </CardDescription>
      </CardHeader>
      
      {!isSuccess ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={handleEmailChange}
                disabled={isSending}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Recipient Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter recipient name"
                value={name}
                onChange={handleNameChange}
                disabled={isSending}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Input
                id="documentType"
                type="text"
                placeholder="E.g., Lease Dispute Letter"
                value={documentTypeInput}
                onChange={handleDocumentTypeChange}
                disabled={isSending}
                required
              />
            </div>
            
            {!documentId && (
              <div className="space-y-2">
                <Label>Upload Document</Label>
                {!file ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm">
                      <label htmlFor="file-upload" className="cursor-pointer text-primary font-medium">
                        Upload a document
                      </label>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                        disabled={isSending}
                      />
                      <p className="text-gray-500 mt-1">PDF, DOC, DOCX, or TXT up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-500 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFile} disabled={isSending}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={resetForm} disabled={isSending}>
              Reset
            </Button>
            <Button type="submit" disabled={isSending || (!file && !documentId)}>
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Document
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Document Sent Successfully</h3>
            <p className="text-gray-500 mt-1">
              The document has been emailed to {email}. It may take a few minutes to arrive.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={resetForm}>
              Send Another
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}