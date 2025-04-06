import React, { useState } from 'react';
import FileUpload from "@/components/forms/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DocumentUploaderProps {
  documentId?: number;
  userId?: number;
  folderId?: number;
  title?: string;
  description?: string;
  onUploadComplete?: (files: any[]) => void;
}

export default function DocumentUploader({
  documentId,
  userId,
  folderId,
  title = "Upload Supporting Documents",
  description = "Upload any supporting documents for your dispute. These will be attached to your document.",
  onUploadComplete
}: DocumentUploaderProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    console.log(`Selected ${selectedFiles.length} files for upload`);
    selectedFiles.forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.name}, size: ${file.size}, type: ${file.type}`);
    });
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!documentId && !userId) {
      toast({
        title: "Upload error",
        description: "Missing documentId or userId for upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Check total file size
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const maxSize = 500 * 1024 * 1024; // 500MB server limit
      
      if (totalSize > maxSize) {
        throw new Error(`Total file size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed (500MB)`);
      }
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      if (documentId) {
        formData.append('documentId', documentId.toString());
      }

      if (userId) {
        formData.append('userId', userId.toString());
      }
      
      if (folderId) {
        // Make sure folderId is properly converted to string
        console.log(`Setting folderId in formData: ${folderId} (type: ${typeof folderId})`);
        formData.append('folderId', String(folderId));
      }

      console.log(`Uploading ${files.length} files with total size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
      
      // Use the apiRequest function to handle protocol matching
      const response = await apiRequest("POST", "/api/upload-documents", formData, {
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
          setUploadProgress(progress);
        }
      });

      // Parse the response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Error parsing server response. The upload may have succeeded but the response was invalid.');
      }

      if (!response.ok) {
        throw new Error(data.message || "Error uploading files");
      }

      setUploadedFiles(data.files || []);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${files.length} file${files.length !== 1 ? 's' : ''}`,
        variant: "default",
      });

      // Reset upload progress and state
      setUploadProgress(0);
      
      if (onUploadComplete) {
        onUploadComplete(data.files);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Ensure progress is reset after a brief delay to show completion
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload 
          onUpload={handleFilesSelected}
          multiple={true}
          acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.mp3,.mp4,.wav,.xlsx,.xls,.ppt,.pptx"
          maxFileSizeMB={200}
          label="Supporting Documents"
          helpText="Upload any documents that support your dispute. We support large files up to 200MB."
        />
        
        <div className="mt-4">
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Uploading...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
          
          {isUploading && (
            <div className="space-y-1 mt-2">
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-xs text-center text-gray-500">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'} {uploadProgress}%
              </p>
            </div>
          )}
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border">
            <h4 className="font-medium text-sm mb-2 text-gray-700">Successfully Uploaded:</h4>
            <ul className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                  {file.originalname || file.name || 'Untitled Document'} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}