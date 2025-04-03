import React from 'react';
import FileUpload from "@/components/forms/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck } from "lucide-react";

// Define proper type for evidence files
export interface EvidenceFile {
  id: number;
  userId: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  analyzedContent?: string | null;
  // Aliases for compatibility
  size?: number; // Alias for fileSize
}

interface EvidenceUploaderProps {
  userId: number;
  title?: string;
  description?: string;
  onUploadComplete?: (files: EvidenceFile[]) => void;
}

export default function EvidenceUploader({
  userId,
  title = "Upload Evidence",
  description = "Upload any documents, photos, or files related to your issue.",
  onUploadComplete
}: EvidenceUploaderProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<EvidenceFile[]>([]);
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
        description: "Missing userId for upload. The system is still initializing. Please try again in a moment.",
        variant: "destructive",
      });
      console.error('Upload attempted without userId');
      return;
    }

    setIsUploading(true);
    console.log('Starting upload process with user ID:', userId);
    console.log('Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    try {
      // Create FormData object for the multipart/form-data submission
      const formData = new FormData();
      
      // Add each file with the correct field name expected by the server
      files.forEach(file => {
        // Use 'evidence' as the field name to match server-side multer configuration
        formData.append('evidence', file);
        console.log('Added file to FormData:', file.name, 'Size:', Math.round(file.size/1024), 'KB', 'Type:', file.type);
      });

      // Include the user ID in the form data
      formData.append('userId', userId.toString());
      console.log('Added userId to FormData:', userId);
      
      // Add description metadata if available
      if (title) {
        formData.append('description', title);
        console.log('Added description to FormData:', title);
      }

      // Log upload attempt details
      console.log(`Uploading ${files.length} files to /api/evidence-files/upload for userId: ${userId}`);

      try {
        // Send the upload request
        const response = await apiRequest("POST", "/api/evidence-files/upload", formData);
        console.log('Upload response received - Status:', response.status, response.statusText);
        
        // Try to parse the response as JSON
        let data;
        try {
          data = await response.json();
          console.log('Response data:', data);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          // Try to get text response if JSON parsing fails
          const textResponse = await response.text();
          console.log('Response text:', textResponse);
          throw new Error('Server returned invalid JSON response');
        }

        // Check for error response
        if (!response.ok) {
          console.error('Error response from server:', data);
          throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
        }

        // Process successful response
        if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
          console.warn('Server returned success but no files data');
          throw new Error('No files were processed by the server');
        }

        // Update component state with uploaded files
        setUploadedFiles(data.files);
        console.log('Files uploaded successfully:', data.files);
        
        // Show success message
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${files.length} file${files.length !== 1 ? 's' : ''}`,
          variant: "default",
        });

        // Clear the files array after successful upload
        setFiles([]);

        // Call the callback if provided
        if (onUploadComplete) {
          console.log('Calling onUploadComplete callback with uploaded files');
          onUploadComplete(data.files);
        }
      } catch (fetchError: any) {
        console.error('Network or API error:', fetchError);
        throw new Error(`Upload request failed: ${fetchError.message}`);
      }
    } catch (error: any) {
      console.error('Upload process error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      console.log('Upload process completed');
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
                  {file.originalName || 'File'} ({((file.fileSize || 0) / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </div>
  );
}