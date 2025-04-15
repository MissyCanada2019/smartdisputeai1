import { useState } from "react";
import FileUpload from "@/components/forms/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function FileUploaderDemoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);

  const handleFilesUploaded = (uploadedFiles: File[]) => {
    console.log("Files uploaded:", uploadedFiles);
    setFiles(uploadedFiles);
  };

  const handleError = (error: string) => {
    setLastError(error);
    console.error("File upload error:", error);
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API upload 
    toast({
      title: "Files submitted",
      description: `${files.length} file(s) would be sent to the server.`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">File Upload Component Demo</h1>

      <Tabs defaultValue="default">
        <TabsList className="mb-4">
          <TabsTrigger value="default">Default Configuration</TabsTrigger>
          <TabsTrigger value="restrictive">Restrictive Configuration</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Files</TabsTrigger>
          <TabsTrigger value="nopreview">Without Preview</TabsTrigger>
          <TabsTrigger value="custom">Custom Styling</TabsTrigger>
        </TabsList>

        <TabsContent value="default">
          <Card>
            <CardHeader>
              <CardTitle>Default Configuration</CardTitle>
              <CardDescription>
                Standard file upload with default settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUpload={handleFilesUploaded} 
                errorCallback={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictive">
          <Card>
            <CardHeader>
              <CardTitle>Restrictive Configuration</CardTitle>
              <CardDescription>
                Only allows PDF files with a max size of 2MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUpload={handleFilesUploaded}
                acceptedFileTypes=".pdf" 
                maxFileSizeMB={2}
                label="Upload PDF Documents"
                helpText="Only PDF files up to 2MB in size are accepted"
                errorCallback={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Files</CardTitle>
              <CardDescription>
                Allows selection of multiple files at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUpload={handleFilesUploaded}
                multiple={true}
                label="Upload Multiple Documents"
                helpText="Select multiple files by holding Ctrl/Cmd during selection"
                errorCallback={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nopreview">
          <Card>
            <CardHeader>
              <CardTitle>Without Preview</CardTitle>
              <CardDescription>
                File upload without displaying the preview of selected files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUpload={handleFilesUploaded}
                showPreview={false}
                label="Upload Without Preview"
                helpText="Selected files won't be shown in the preview area"
                errorCallback={handleError}
              />
              <div className="mt-4">
                <p className="text-sm text-gray-500">Files selected: {files.length}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Styling</CardTitle>
              <CardDescription>
                Custom styling applied to the file upload component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUpload={handleFilesUploaded}
                label="Styled Upload Component"
                helpText="This uploader has custom styling applied to it"
                className="border rounded-lg p-4 bg-gray-50"
                errorCallback={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {lastError && (
        <div className="mt-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Last Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{lastError}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit}>Submit Files</Button>
      </div>
    </div>
  );
}