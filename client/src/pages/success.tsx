import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Download, FileText } from "lucide-react";
import { useFormState } from "@/lib/formContext";
import { queryClient } from "@/lib/queryClient";
import { UserDocument } from "@shared/schema";

export default function Success() {
  const [_, navigate] = useNavigate();
  const [location] = useLocation();
  const [formState, setFormState] = useFormState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<UserDocument | null>(null);

  // Extract document_id from URL query parameters
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const documentId = urlParams.get("document_id");

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) {
        toast({
          title: "Error",
          description: "Document ID not found in URL. Please try again.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/user-documents/${documentId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch document details");
        }
        
        const documentData = await response.json();
        setDocument(documentData);
        
        // Update form state to mark completion
        setFormState({
          ...formState,
          currentStep: 5,
          documentId: parseInt(documentId)
        });
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Error",
          description: "Could not load document details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
    
    // Clear any cached payment data
    queryClient.invalidateQueries({ queryKey: ['/api/user-documents'] });
  }, [documentId, toast, navigate]);

  const handleDownloadPdf = () => {
    if (!document?.documentPath) {
      toast({
        title: "Document Not Available",
        description: "The document file is not yet available for download.",
        variant: "destructive",
      });
      return;
    }

    window.open(`/api/download-pdf/${document.documentPath}`, '_blank');
  };

  const handleCreateNew = () => {
    // Reset form state for a new document
    setFormState({
      currentStep: 1
    });
    navigate("/user-info");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Payment Successful!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your document details...</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-lg mb-2">
                    Thank you for your purchase. Your document is ready!
                  </p>
                  <p className="text-gray-600">
                    You can download your document using the button below.
                  </p>
                </div>

                {document && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <h3 className="font-medium mb-2">Document Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Reference Number:</div>
                      <div>{document.id}</div>
                      <div className="text-gray-600">Created Date:</div>
                      <div>{new Date(document.createdAt).toLocaleDateString()}</div>
                      <div className="text-gray-600">Amount Paid:</div>
                      <div>${document.finalPrice.toFixed(2)} CAD</div>
                      <div className="text-gray-600">Payment Status:</div>
                      <div className="text-green-600 font-medium capitalize">{document.paymentStatus}</div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-blue-700">
                  <p className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Next Steps
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Download and save your document</li>
                    <li>Review all information for accuracy</li>
                    <li>Submit to the appropriate government agency</li>
                    <li>Keep a copy of all documents for your records</li>
                    <li>Follow up with the agency as needed</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={handleDownloadPdf} 
              disabled={isLoading || !document?.documentPath}
              className="flex items-center w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Document
            </Button>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleCreateNew}
                className="flex-1"
              >
                Create New Document
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="flex-1"
              >
                Return Home
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
