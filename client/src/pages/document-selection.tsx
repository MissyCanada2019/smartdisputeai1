import ProgressTracker from "@/components/common/ProgressTracker";
import DocumentSelectionForm from "@/components/forms/DocumentSelection";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import { useSearch } from "wouter";
import { Badge } from "@/components/ui/badge";
import { X, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useFormState } from "@/lib/formContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentSelection() {
  // Get form state to access evidence analysis results
  const [formState] = useFormState();
  
  // Get URL search params to check for category filter or recommendations
  const searchParams = new URLSearchParams(useSearch());
  const categoryFilter = searchParams.get('category');
  const showRecommended = searchParams.get('recommended') === 'true' || 
    (formState.evidence && formState.evidence.files && formState.evidence.files.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={3} />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {categoryFilter ? `${categoryFilter} Documents` : 'Select Your Document Type'}
        </h1>
        <p className="text-gray-600">Choose the document that best suits your needs</p>
        
        {categoryFilter && (
          <div className="mt-4 flex items-center">
            <Badge variant="outline" className="px-3 py-1">
              <span className="mr-2">Category: {categoryFilter}</span>
              <Link href="/document-selection">
                <Button size="icon" variant="ghost" className="h-4 w-4 rounded-full p-0">
                  <X className="h-3 w-3" />
                </Button>
              </Link>
            </Badge>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <TemplateSidebar />
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          {showRecommended && formState.recommendedForms && formState.recommendedForms.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-primary">
              <div className="flex items-start mb-4">
                <FileCheck className="h-6 w-6 text-primary mr-3 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold">Recommended Documents Based on Your Evidence</h2>
                  <p className="text-gray-600 mt-1">
                    After analyzing your evidence, we recommend the following documents for your situation:
                  </p>
                </div>
              </div>
              
              {formState.caseAnalysis?.caseSummary && (
                <Alert className="mb-6 bg-blue-50">
                  <AlertTitle className="font-medium">Our Analysis</AlertTitle>
                  <AlertDescription className="text-sm mt-2">
                    {formState.caseAnalysis.caseSummary}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4 mb-4">
                {formState.recommendedForms.map((form, index) => (
                  <div key={index} className="p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                    <h3 className="font-medium text-lg">{form.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                    <div className="flex justify-end">
                      <Link href={`/template-customization?templateId=${form.id}`}>
                        <Button size="sm">
                          Use This Template
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Don't see what you need? Browse all templates below.
                </p>
                <Link href="/document-selection">
                  <Button variant="outline" size="sm">
                    View All Templates
                  </Button>
                </Link>
              </div>
            </div>
          )}
        
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {categoryFilter ? `${categoryFilter} Document Templates` : (
                showRecommended && formState.recommendedForms?.length ? 'Other Available Templates' : 'Available Document Types'
              )}
            </h2>
            <p className="text-gray-600 mb-6">
              {categoryFilter 
                ? `Browse our collection of templates specifically designed for ${categoryFilter} disputes.`
                : 'Browse our collection of document templates designed for various government agency disputes.'}
            </p>
            
            <DocumentSelectionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
