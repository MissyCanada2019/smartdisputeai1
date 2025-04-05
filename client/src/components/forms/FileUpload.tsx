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
  showPreview?: boolean;
  errorCallback?: (error: string) => void;
  className?: string;
}

export default function FileUpload({
  onUpload,
  multiple = false,
  acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxFileSizeMB = 50,
  label = "Upload Documents",
  helpText = "Upload any supporting documents for your dispute (PDF, DOC, JPG)",
  showPreview = true,
  errorCallback,
  className = "",
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
    const acceptedTypes = acceptedFileTypes.replace(/\./g, '').replace(/,/g, '|');
    const fileExtensionRegex = new RegExp(`\\.(${acceptedTypes})$`, 'i');
    
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > maxSizeBytes) {
        const errorMessage = `${file.name} exceeds the maximum file size of ${maxFileSizeMB}MB`;
        toast({
          title: "File too large",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (errorCallback) {
          errorCallback(errorMessage);
        }
        return false;
      }
      
      // Check file type
      if (!fileExtensionRegex.test(file.name)) {
        // Get file extension
        const extension = file.name.split('.').pop() || '';
        const acceptedTypesFormatted = acceptedFileTypes.replace(/\./g, '').toUpperCase().split(',').join(', ');
        const errorMessage = `${file.name} has an unsupported file type (.${extension}). Accepted types: ${acceptedTypesFormatted}`;
        
        toast({
          title: "Invalid file type",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (errorCallback) {
          errorCallback(errorMessage);
        }
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
    } else if (selectedFiles.length > 0 && validFiles.length === 0) {
      // All files were invalid
      const errorMessage = "No valid files were selected";
      if (errorCallback) {
        errorCallback(errorMessage);
      }
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
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">{label}</h3>
        <p className="text-sm text-gray-500">{helpText}</p>
      </div>
      
      <Card 
        className={`border-dashed cursor-pointer transition-colors duration-200 ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-12">
          <Upload className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-base sm:text-lg font-medium mb-2">Drag and drop files here</p>
          <p className="text-sm text-gray-500 mb-3">Or click to browse your computer</p>
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
            Select Files {multiple && "(Multiple)"}
          </Button>
          <p className="text-xs text-gray-400 mt-3">
            Accepted file types: {acceptedFileTypes.replace(/\./g, '').toUpperCase().split(',').join(', ')}
            <br />
            Maximum file size: {maxFileSizeMB} MB
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple={multiple}
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            aria-label={`Upload ${label}`}
          />
        </CardContent>
      </Card>
      
      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Selected Files</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto p-1 border rounded">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-md border">
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0 ml-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500"
                    aria-label={`Remove ${file.name}`}
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