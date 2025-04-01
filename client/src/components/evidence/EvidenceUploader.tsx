import React from 'react';
import FileUpload from "@/components/forms/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck } from "lucide-react";

interface EvidenceUploaderProps {
  userId: number;
  title?: string;
  description?: string;
  onUploadComplete?: (files: any[]) => void;
}

export default function EvidenceUploader({
  userId,
  title = "Upload Evidence",
  description = "Upload any documents, photos, or files related to your issue.",
  onUploadComplete
}: EvidenceUploaderProps) {
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

    if (!userId) {
      toast({
        title: "Upload error",
        description: "Missing userId for upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        // Use 'documents' to match the server's expected field name in the upload-documents route
        formData.append('documents', file);
      });

      // Include the user ID for the temporary user
      formData.append('userId', userId.toString());

      // Use the general upload route since we're using a temp user that isn't authenticated
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

      // Clear the files array after successful upload
      setFiles([]);

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
    <div>
      <CardContent className="space-y-4 p-0">
        <FileUpload 
          onUpload={handleFilesSelected}
          multiple={true}
          acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.mp3,.mp4"
          maxFileSizeMB={10}
          label="Evidence Files"
          helpText="Upload any documents, photos, or files that support your case (PDF, DOC, JPG, PNG, etc.)"
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
                Upload Files
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
    </div>
  );
}