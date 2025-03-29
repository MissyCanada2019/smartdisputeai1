import { useQuery } from "@tanstack/react-query";
import { DocumentTemplate } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormState } from "@/lib/formContext";
import { useLocation, useSearch } from "wouter";
import DocumentCard from "@/components/documents/DocumentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function DocumentSelectionForm() {
  const [formState, setFormState] = useFormState();
  const [_, navigate] = useLocation();
  
  // Get URL search params to check for category filter
  const searchParams = new URLSearchParams(useSearch());
  const categoryFilter = searchParams.get('category');
  
  // If there's a province in userInfo, filter templates by province
  const province = formState.userInfo?.province;
  
  // Determine which API endpoint to use based on filters
  let queryKey: string[] = ['/api/document-templates'];
  let queryEndpoint: string = '/api/document-templates';
  
  if (categoryFilter) {
    queryKey = [`/api/document-templates/category/${encodeURIComponent(categoryFilter)}`];
    queryEndpoint = `/api/document-templates/category/${encodeURIComponent(categoryFilter)}`;
  } else if (province) {
    queryKey = [`/api/document-templates/province/${province}`];
    queryEndpoint = `/api/document-templates/province/${province}`;
  }
  
  // Fetch document templates based on filters
  const { data: templates, isLoading } = useQuery<DocumentTemplate[]>({
    queryKey,
    retry: 1,
  });
  
  const handleSelectTemplate = (template: DocumentTemplate) => {
    setFormState({
      ...formState,
      selectedTemplate: template,
      currentStep: 3
    });
    
    navigate("/template-customization");
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : templates?.map((template) => (
          <DocumentCard 
            key={template.id}
            template={template}
            onSelect={() => handleSelectTemplate(template)}
            userIncome={formState.userInfo?.incomeRange}
            requestIncomeBased={formState.userInfo?.requestIncomeBased}
          />
        ))}
        
        {templates?.length === 0 && !isLoading && (
          <div className="col-span-3 text-center py-12">
            <h3 className="text-lg font-medium text-gray-600">No document templates available</h3>
            <p className="text-gray-500 mt-2">Please try again later or contact support for assistance.</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => navigate("/user-info")}>
          Back to Personal Information
        </Button>
      </div>
    </div>
  );
}
