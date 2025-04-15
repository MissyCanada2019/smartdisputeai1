import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, FileText, Link as LinkIcon, Paperclip } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Province {
  value: string;
  label: string;
}

const NewResourcePage = () => {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [province, setProvince] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Canadian provinces
  const provinces: Province[] = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" }
  ];

  // Resource types
  const resourceTypes = [
    { id: "document", name: "Document", icon: <FileText className="h-4 w-4" /> },
    { id: "link", name: "Website Link", icon: <LinkIcon className="h-4 w-4" /> },
    { id: "template", name: "Template", icon: <FileText className="h-4 w-4" /> },
    { id: "guide", name: "Guide", icon: <FileText className="h-4 w-4" /> },
    { id: "contact", name: "Contact Information", icon: <FileText className="h-4 w-4" /> },
  ];

  // Create resource mutation
  const createResourceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/community/resources', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create resource');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Resource shared",
        description: "Your resource has been published successfully.",
      });
      navigate(`/resource-sharing/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !resourceType || !province) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (resourceType === 'link' && !resourceUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a URL for your resource link.",
        variant: "destructive",
      });
      return;
    }
    
    if (['document', 'template', 'guide'].includes(resourceType) && !file) {
      toast({
        title: "Missing file",
        description: "Please upload a file for your resource.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('resourceType', resourceType);
    formData.append('province', province);
    formData.append('tags', tags);
    
    if (resourceUrl) {
      formData.append('resourceUrl', resourceUrl);
    }
    
    if (file) {
      formData.append('file', file);
    }
    
    createResourceMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Share a Resource</CardTitle>
                <CardDescription>
                  Help others by sharing valuable resources, documents, or information
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate("/resource-sharing")}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="Give your resource a clear, descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this resource is and how it can help others..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Resource Type</Label>
                <RadioGroup value={resourceType} onValueChange={setResourceType} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resourceTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value={type.id} id={`type-${type.id}`} />
                      <Label htmlFor={`type-${type.id}`} className="flex items-center cursor-pointer">
                        <span className="mr-2">{type.icon}</span>
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select value={province} onValueChange={setProvince} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province/territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="federal">Federal (All Canada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {resourceType === 'link' && (
                <div className="space-y-2">
                  <Label htmlFor="resourceUrl">Resource URL</Label>
                  <Input
                    id="resourceUrl"
                    type="url"
                    placeholder="https://example.com/resource"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    required={resourceType === 'link'}
                  />
                </div>
              )}

              {['document', 'template', 'guide'].includes(resourceType) && (
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50" 
                      onClick={() => fileInputRef.current?.click()}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx"
                    />
                    {file ? (
                      <div className="flex items-center justify-center">
                        <Paperclip className="h-5 w-5 mr-2 text-blue-500" />
                        <span>{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Upload className="h-8 w-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, or text files</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. legal, housing, template, tenant-rights"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-gray-500">Help others find your resource with relevant tags</p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Resource Sharing Guidelines</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Ensure you have the right to share this content</li>
                    <li>Do not share confidential, personal, or copyright-protected information</li>
                    <li>Resources will be reviewed by moderators before becoming verified</li>
                    <li>Focus on sharing accurate and helpful information</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate("/resource-sharing")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  isSubmitting || 
                  !title || 
                  !description || 
                  !resourceType || 
                  !province || 
                  (resourceType === 'link' && !resourceUrl) ||
                  (['document', 'template', 'guide'].includes(resourceType) && !file)
                }
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Publishing...
                  </>
                ) : (
                  "Share Resource"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewResourcePage;