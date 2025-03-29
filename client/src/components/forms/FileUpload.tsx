import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  label?: string;
  helpText?: string;
}

export default function FileUpload({
  onUpload,
  multiple = false,
  acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxFileSizeMB = 5,
  label = "Upload Documents",
  helpText = "Upload any supporting documents for your dispute (PDF, DOC, JPG)",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    validateAndAddFiles(selectedFiles);
  };
  
  const validateAndAddFiles = (selectedFiles: File[]) => {
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    const fileExtensionRegex = new RegExp(`\\.(${acceptedFileTypes.replace(/\./g, '').replace(/,/g, '|')})$`, 'i');
    
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of ${maxFileSizeMB}MB`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file type
      if (!fileExtensionRegex.test(file.name)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an accepted file type`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      onUpload(newFiles);
      
      toast({
        title: "Files added",
        description: `Successfully added ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`,
      });
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const items = event.dataTransfer.items;
    const fileList: File[] = [];
    
    // Handle dropped files
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) fileList.push(file);
        }
      }
    } else if (event.dataTransfer.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        fileList.push(event.dataTransfer.files[i]);
      }
    }
    
    validateAndAddFiles(fileList);
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onUpload(newFiles);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">{label}</h3>
        <p className="text-sm text-gray-500">{helpText}</p>
      </div>
      
      <Card 
        className={`border-dashed cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Drag and drop files here</p>
          <p className="text-sm text-gray-500 mb-4">Or click to browse your computer</p>
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
            Select Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple={multiple}
            accept={acceptedFileTypes}
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-md border">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}