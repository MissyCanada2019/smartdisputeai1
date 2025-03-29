import { useQuery } from "@tanstack/react-query";
import { DocumentTemplate } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormState } from "@/lib/formContext";
import { useNavigate } from "wouter";
import DocumentCard from "@/components/documents/DocumentCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentSelectionForm() {
  const [formState, setFormState] = useFormState();
  const [_, navigate] = useNavigate();
  
  // If there's a province in userInfo, filter templates by province
  const province = formState.userInfo?.province;
  
  // Fetch all document templates or filter by province if available
  const { data: templates, isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: province 
      ? ['/api/document-templates/province', province] 
      : ['/api/document-templates'],
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
