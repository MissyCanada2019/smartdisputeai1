import ProgressTracker from "@/components/common/ProgressTracker";
import DocumentSelectionForm from "@/components/forms/DocumentSelection";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import { useSearch } from "wouter";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DocumentSelection() {
  // Get URL search params to check for category filter
  const searchParams = new URLSearchParams(useSearch());
  const categoryFilter = searchParams.get('category');

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={2} />
      
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
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {categoryFilter ? `${categoryFilter} Document Templates` : 'Available Document Types'}
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
