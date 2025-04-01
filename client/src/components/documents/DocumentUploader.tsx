import React from 'react';
import FileUpload from "@/components/forms/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck } from "lucide-react";

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
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
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

    if (!documentId && !userId && !folderId) {
      toast({
        title: "Upload error",
        description: "Missing documentId, userId, or folderId for upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
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
        formData.append('folderId', folderId.toString());
      }

      const response = await apiRequest("POST", "/api/upload-documents", formData);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error uploading files");
      }

      setUploadedFiles(data.files || []);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${files.length} file${files.length !== 1 ? 's' : ''}`,
        variant: "default",
      });

      if (onUploadComplete) {
        onUploadComplete(data.files);
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
          acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          maxFileSizeMB={5}
          label="Supporting Documents"
          helpText="Upload any documents that support your dispute (PDF, DOC, JPG, PNG)"
        />
        
        <div className="mt-4">
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⟳</span> 
                Uploading...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border">
            <h4 className="font-medium text-sm mb-2 text-gray-700">Successfully Uploaded:</h4>
            <ul className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                  {file.originalName} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}