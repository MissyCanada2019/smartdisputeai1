import { useState } from "react";
import { useNavigate } from "wouter";
import ProgressTracker from "@/components/common/ProgressTracker";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import { useFormState } from "@/lib/formContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2, Check } from "lucide-react";

export default function DocumentReview() {
  const [formState, setFormState] = useFormState();
  const [_, navigate] = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  
  // Check if we have the necessary data
  if (!formState.selectedTemplate || !formState.documentData) {
    navigate("/document-selection");
    return null;
  }
  
  const template = formState.selectedTemplate;
  const documentData = formState.documentData;
  
  // Format the document data for display
  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };
  
  const handleGeneratePdf = async () => {
    if (!formState.documentId) {
      toast({
        title: "Error",
        description: "Document ID is missing. Please go back and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", `/api/generate-pdf/${formState.documentId}`, {});
      const data = await response.json();
      
      if (data.success && data.filePath) {
        setPdfPath(data.filePath);
        setIsPdfReady(true);
        
        toast({
          title: "PDF Generated",
          description: "Your document has been successfully generated.",
        });
        
        // Update form state with the current step
        setFormState({
          ...formState,
          currentStep: 4
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!pdfPath) return;
    
    try {
      window.open(`/api/download-pdf/${pdfPath}`, '_blank');
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleContinueToPayment = () => {
    navigate("/payment");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={4} />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Review Your Document</h1>
        <p className="text-gray-600">Please review the information below before proceeding to payment</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <TemplateSidebar />
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{template.name}</h2>
                  <p className="text-gray-600">{template.description}</p>
                </div>
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                  ${template.basePrice.toFixed(2)}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium mb-4">Document Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(documentData).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <p className="text-sm font-medium text-gray-600">{formatFieldName(key)}</p>
                    <p className="text-sm mt-1">
                      {typeof value === 'string' && value.length > 100 
                        ? value.substring(0, 100) + "..." 
                        : value as string}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  {!isPdfReady ? (
                    <Button
                      onClick={handleGeneratePdf}
                      disabled={isGenerating}
                      className="flex items-center"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate PDF Preview
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDownloadPdf}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={!isPdfReady}
                    className="flex items-center"
                  >
                    {isPdfReady && <Check className="mr-2 h-4 w-4" />}
                    Continue to Payment
                  </Button>
                </div>
                
                {!isPdfReady && (
                  <p className="text-sm text-gray-500 text-center">
                    Generate a preview of your document before proceeding to payment.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Document Submission Guidelines</h3>
              <p className="text-gray-600 mb-4">
                After payment, your document will be ready for submission. Here are some important guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Carefully review all information for accuracy before submitting to the government agency.</li>
                <li>Check the agency's specific submission requirements, including any filing fees.</li>
                <li>Make copies of all documents for your records.</li>
                <li>Consider sending important documents via registered mail for tracking purposes.</li>
                <li>Note any deadlines that may apply to your specific situation.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
