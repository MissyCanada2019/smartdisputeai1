import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/forms/FileUpload";
import { Loader2, Upload, FileCheck, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EvidenceFile {
  id: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  analyzedContent?: string | null;
}

interface DirectEvidenceUploaderProps {
  onAnalysisComplete?: (analysisResult: any) => void;
  onUploadComplete?: (files: EvidenceFile[]) => void;
}

export function DirectEvidenceUploader({
  onAnalysisComplete,
  onUploadComplete
}: DirectEvidenceUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<EvidenceFile[]>([]);
  const [caseDescription, setCaseDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleUploadAndAnalyze = async () => {
    if (files.length === 0 && !caseDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please either upload files or provide a description of your case",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // First upload files if any
      let uploadedEvidence: EvidenceFile[] = [];
      
      if (files.length > 0) {
        const formData = new FormData();
        
        files.forEach(file => {
          formData.append('evidence', file);
          console.log('Added file to FormData:', file.name);
        });
        
        // Add description
        formData.append('description', caseDescription);
        
        const response = await fetch('/api/direct-evidence/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to upload files';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If we can't parse JSON, use the status text
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        uploadedEvidence = data.files;
        setUploadedFiles(uploadedEvidence);
        
        if (onUploadComplete) {
          onUploadComplete(uploadedEvidence);
        }
        
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${files.length} file(s)`
        });
      }
      
      // Now submit for analysis
      setIsUploading(false);
      setIsAnalyzing(true);
      
      const analysisPayload = {
        evidenceIds: uploadedEvidence.map(file => file.id),
        description: caseDescription,
        useCanLII: true // Flag to indicate we want to search CanLII for similar cases
      };
      
      const analysisResponse = await fetch('/api/direct-evidence/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisPayload)
      });
      
      if (!analysisResponse.ok) {
        let errorMessage = 'Failed to analyze evidence';
        try {
          const errorData = await analysisResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${analysisResponse.status}: ${analysisResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const analysisResult = await analysisResponse.json();
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
      
      toast({
        title: "Analysis complete",
        description: "Your evidence has been analyzed and similar cases found"
      });
      
      // Clear form after successful submission
      setFiles([]);
      setCaseDescription('');
      
    } catch (error: any) {
      console.error('Error in upload and analyze process:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Evidence & Get Case Analysis</CardTitle>
        <CardDescription>
          Upload documents and provide details about your dispute. Our AI will analyze your case and search for similar precedents in Canadian law.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Upload Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div>
          <Label htmlFor="case-description">Describe Your Situation</Label>
          <Textarea 
            id="case-description"
            placeholder="Please describe your legal situation in detail. What happened? Who was involved? Where and when did it occur?"
            className="h-32 mt-1"
            value={caseDescription}
            onChange={(e) => setCaseDescription(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Label>Supporting Evidence</Label>
          <FileUpload 
            onUpload={handleFilesSelected}
            multiple={true}
            acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            maxFileSizeMB={10}
            label="Evidence Files"
            helpText="Upload any documents, photos, or files that support your case (PDF, DOC, JPG, PNG, etc.)"
          />
        </div>
        
        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">Selected files:</p>
            <ul className="text-sm text-gray-600 mt-1">
              {files.map((file, i) => (
                <li key={i} className="flex items-center">
                  <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          onClick={handleUploadAndAnalyze} 
          disabled={isUploading || isAnalyzing || (files.length === 0 && !caseDescription.trim())}
          className="w-full mt-4"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Uploading...
            </>
          ) : isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Analyze
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}