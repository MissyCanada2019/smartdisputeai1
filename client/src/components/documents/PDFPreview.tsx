import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentTemplate } from "@shared/schema";
import { AlertCircle, Download, Eye, LockIcon, Mail } from "lucide-react";
import { useNavigate } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface PDFPreviewProps {
  documentId: number;
  templateData: DocumentTemplate;
  isPreview?: boolean;
}

export default function PDFPreview({ documentId, templateData, isPreview = true }: PDFPreviewProps) {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPreview) {
      // Generate a preview of the PDF
      setIsLoading(true);
      fetch(`/api/preview-pdf/${documentId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to generate preview");
          }
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error generating preview:", error);
          setIsLoading(false);
          setError("Could not generate preview at this time.");
        });
    }
  }, [documentId, isPreview]);

  const handleDownload = () => {
    if (isPreview) {
      // Redirect to payment page
      navigate(`/payment?document_id=${documentId}`);
    } else {
      // Download the full document if user already purchased
      window.open(`/api/download-pdf/${documentId}`, '_blank');
    }
  };

  const handleSendEmail = async () => {
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
          documentId,
          email,
          previewOnly: isPreview
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Preview</span>
          {isPreview && (
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <LockIcon className="h-4 w-4 mr-1" />
              Preview Mode
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
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
            {isPreview && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-5"></div>
                <div className="bg-white/90 px-6 py-4 rounded-lg shadow-lg text-center z-10 max-w-md">
                  <p className="text-lg font-semibold mb-2">Preview Mode</p>
                  <p className="text-gray-600 mb-4">
                    This is a preview of your document. Purchase to unlock the full document with all your information.
                  </p>
                  <Button onClick={handleDownload} className="w-full">
                    Purchase Full Document - ${templateData.price.toFixed(2)} CAD
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No preview available</p>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-2 pt-4">
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
              disabled={isSubmitting}
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          {isPreview ? (
            <>
              Purchase Full Document
              <Download className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              Download Document
              <Download className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}