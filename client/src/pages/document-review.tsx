import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProgressTracker from "@/components/common/ProgressTracker";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import { useFormState } from "@/lib/formContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Download, Loader2, Check, Mail, ShoppingCart, 
  Eye, Lock as LockIcon, AlertCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentReview() {
  const [formState, setFormState] = useFormState();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  
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
  
  // Generate PDF and get document preview
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
    setError(null);
    
    try {
      // First generate the PDF
      const response = await apiRequest("POST", `/api/generate-pdf/${formState.documentId}`, {});
      const data = await response.json();
      
      if (data.success && data.filePath) {
        setPdfPath(data.filePath);
        setIsPdfReady(true);
        
        // Now get the preview for display
        try {
          const previewResponse = await fetch(`/api/preview-pdf/${formState.documentId}`);
          if (!previewResponse.ok) {
            throw new Error("Failed to generate preview");
          }
          const blob = await previewResponse.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setActiveTab("preview"); // Switch to preview tab once ready
          
          toast({
            title: "PDF Generated",
            description: "Your document has been successfully generated. You can now preview, email, or purchase it.",
          });
        } catch (previewError) {
          console.error("Error generating preview:", previewError);
          // We'll still continue if preview fails
        }
        
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
      setError("There was an error generating your PDF. Please try again.");
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
  
  const handleSendEmail = async () => {
    if (!formState.documentId) return;
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/email-document-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: formState.documentId,
          email,
          previewOnly: true
        }),
      });

      if (!response.ok) {
        throw new Error("Error sending email");
      }

      toast({
        title: "Email Sent",
        description: "Document preview has been sent to your email",
      });
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Could not send email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddToCart = () => {
    if (!formState.documentId) return;
    
    // In a real app, we would add this to a cart in local storage or session
    // For now, we'll simulate this
    try {
      // Store in localstorage as a simple cart
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if item is already in cart
      if (!cartItems.some((item: { id: number }) => item.id === formState.documentId)) {
        cartItems.push({
          id: formState.documentId,
          name: template.name,
          price: template.basePrice,
          date: new Date().toISOString()
        });
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
      
      setAddedToCart(true);
      
      toast({
        title: "Added to Cart",
        description: "Document has been added to your cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Could not add document to cart. Please try again.",
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
        <p className="text-gray-600">Please review your document before proceeding</p>
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
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="preview" disabled={!isPdfReady}>Document Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="mt-6">
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
                </TabsContent>
                
                <TabsContent value="preview" className="mt-6">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isGenerating ? (
                    <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Generating document preview...</p>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative">
                      <iframe 
                        src={previewUrl} 
                        className="w-full h-[500px] border rounded-md"
                        title="Document Preview"
                      />
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        <div className="bg-white/90 px-6 py-4 rounded-lg shadow-lg text-center z-10 max-w-md">
                          <p className="text-lg font-semibold mb-2">Preview Mode</p>
                          <p className="text-gray-600 mb-4">
                            This is a preview of your document. Purchase to unlock the full document with all your information.
                          </p>
                          <Button onClick={handleContinueToPayment} className="w-full">
                            Purchase Full Document - ${template.basePrice.toFixed(2)} CAD
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No preview available</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2 pt-4 mt-6 border-t">
                    <p className="text-sm font-medium">Get this document sent to your email:</p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendEmail}
                        disabled={isSubmitting || !isPdfReady}
                        variant="outline"
                        className="flex gap-2 items-center"
                      >
                        {isSubmitting ? "Sending..." : (
                          <>
                            <Mail className="h-4 w-4" />
                            Send to Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 space-y-4 pt-4 border-t">
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleDownloadPdf}
                        variant="outline"
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Preview
                      </Button>
                      
                      <Button
                        onClick={handleAddToCart}
                        variant={addedToCart ? "outline" : "secondary"}
                        className="flex items-center"
                        disabled={addedToCart}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {addedToCart ? "Added to Cart" : "Add to Cart"}
                      </Button>
                    </div>
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
