import { useState } from "react";
import DocumentAnalyzer from "@/components/documents/DocumentAnalyzer";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { ChevronRight, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AiDocumentAnalysis() {
  const [hasPurchased, setHasPurchased] = useState(true);
  const [analysisCount, setAnalysisCount] = useState(2);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/services">Services</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Document Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          AI-Powered Document Analysis
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get comprehensive analysis of your legal documents using advanced AI technology. 
          Understand complexity, identify strengths and weaknesses, and get strategic recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <DocumentAnalyzer
            title="Analyze Your Document"
            description="Upload a document to analyze with our dual AI system. We'll identify key points, assess evidence weight, and provide strategic recommendations."
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Analysis Credits</span>
                <Badge variant="outline" className="text-lg">{analysisCount}</Badge>
              </CardTitle>
              <CardDescription>
                Remaining document analyses for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">Analysis Features:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Document complexity assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Legal terminology simplification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Case merit weight calculation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Court strategy recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Dual AI model analysis (GPT-4o & Claude)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Supported File Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <span>Lease agreements, court notices, legal documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">DOCX</Badge>
                  <span>Applications, forms, letters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">DOC</Badge>
                  <span>Older Microsoft Word documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">TXT</Badge>
                  <span>Plain text documents and transcripts</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-gray-500">
                Files are processed securely and are not stored after analysis. Maximum file size: 20MB.
              </p>
            </CardContent>
          </Card>

          <Alert>
            <AlertTitle className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Privacy Notice
            </AlertTitle>
            <AlertDescription className="text-sm">
              All document analysis is performed securely. We don't store the content of your documents after analysis 
              is complete. Your privacy is our priority.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}