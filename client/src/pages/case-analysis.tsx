import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileCheck, FileWarning, AlertCircle, CheckCircle, Loader2, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import CanLIIAnalyzer from "@/components/evidence/CanLIIAnalyzer";

interface Evidence {
  id: number;
  userId: number;
  filename: string;
  fileType: string;
  uploadDate: string;
  fileSize: number;
  status: 'pending' | 'analyzed' | 'failed';
  analyzedContent?: string;
}

interface CaseAnalysis {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  caseSummary: string;
  recommendedForms: number[];
  isPremiumAssessment: boolean;
  evidenceIds: number[];
}

export default function CaseAnalysis() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedEvidence, setSelectedEvidence] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CaseAnalysis | null>(null);

  // Fetch user's evidence files
  const { data: evidenceFiles, isLoading, error } = useQuery<Evidence[]>({
    queryKey: ['/api/evidence-files/user/current'],
    retry: 1,
  });

  interface DocumentTemplate {
    id: number;
    name: string;
    description: string;
    category: string;
    province?: string;
    content: string;
  }
  
  // Fetch recommended document templates if analysis exists
  const { data: recommendedDocuments } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/document-templates'],
    enabled: !!analysisResult?.recommendedForms,
  });

  const handleSelectEvidence = (id: number) => {
    if (selectedEvidence.includes(id)) {
      setSelectedEvidence(selectedEvidence.filter(evidId => evidId !== id));
    } else {
      setSelectedEvidence([...selectedEvidence, id]);
    }
  };

  const handleAnalyzeCase = async () => {
    if (selectedEvidence.length === 0) {
      toast({
        title: "No Evidence Selected",
        description: "Please select at least one piece of evidence to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // First check if analysis for these evidence files already exists
      const existingResponse = await apiRequest("POST", "/api/case-analyses/by-evidence", {
        evidenceIds: selectedEvidence
      });

      if (existingResponse.ok) {
        const existingAnalysis = await existingResponse.json();
        setAnalysisResult(existingAnalysis);
        setIsAnalyzing(false);
        return;
      }

      // If no existing analysis, create a new one
      const response = await apiRequest("POST", "/api/case-analyses", {
        evidenceIds: selectedEvidence,
        isPremiumAssessment: false,
      });

      if (response.ok) {
        const newAnalysis = await response.json();
        setAnalysisResult(newAnalysis);
        toast({
          title: "Analysis Complete",
          description: "Your case has been analyzed successfully.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze your case. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error analyzing case:", error);
      toast({
        title: "Analysis Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed":
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case "failed":
        return <FileWarning className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="ml-3 text-lg">Loading your evidence files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-12 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="mr-2 h-6 w-6" />
              Error Loading Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              We couldn't load your evidence files. Please try refreshing the page or check if you're logged in.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button className="ml-2" onClick={() => navigate("/evidence-upload")}>
              Upload Evidence
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Analyze Your Case</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the evidence files you want to include in your analysis. Our AI will review them and provide recommendations based on Canadian law.
        </p>
      </div>

      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="evidence">Select Evidence</TabsTrigger>
          <TabsTrigger value="canlii">CanLII Analysis</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult}>Analysis Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="evidence">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {evidenceFiles && evidenceFiles.length > 0 ? (
              evidenceFiles.map((file) => (
                <Card 
                  key={file.id} 
                  className={`cursor-pointer transition-all ${selectedEvidence.includes(file.id) ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleSelectEvidence(file.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium truncate">{file.filename}</CardTitle>
                      {getFileStatusIcon(file.status)}
                    </div>
                    <CardDescription>
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500">
                      {file.fileType.toUpperCase()} • {Math.round(file.fileSize / 1024)} KB
                    </p>
                    {file.status === "analyzed" && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Ready for analysis
                      </div>
                    )}
                    {file.status === "pending" && (
                      <div className="mt-2 text-sm text-amber-600 flex items-center">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Processing...
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 p-12 text-center border rounded-lg bg-gray-50">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Evidence Found</h3>
                <p className="text-gray-600 mb-4">
                  Upload your evidence files to get started with your case analysis.
                </p>
                <Button onClick={() => navigate("/evidence-upload")}>
                  Upload Evidence
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleAnalyzeCase} 
              disabled={selectedEvidence.length === 0 || isAnalyzing}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Selected Evidence"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="canlii">
          <div className="mb-2">
            <Card className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900/50 border border-blue-200 dark:border-blue-800/30 shadow-sm mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-1">CanLII Legal Precedent Analysis</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Analyze your evidence against Canadian legal precedents from CanLII to strengthen your case arguments and build a more compelling legal position.
                </p>
              </CardContent>
            </Card>
            <CanLIIAnalyzer />
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          {analysisResult && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Case Summary</CardTitle>
                  <CardDescription>
                    AI-generated summary based on your evidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{analysisResult.caseSummary}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Documents</CardTitle>
                  <CardDescription>
                    Based on your evidence, these documents may help you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendedDocuments && recommendedDocuments.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedDocuments
                        .filter(doc => analysisResult.recommendedForms.includes(doc.id))
                        .map(doc => (
                          <div key={doc.id} className="p-4 border rounded-lg bg-white">
                            <h3 className="font-medium text-lg">{doc.name}</h3>
                            <p className="text-gray-600 mt-1">{doc.description}</p>
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                onClick={() => navigate(`/template-customization?templateId=${doc.id}`)}
                              >
                                Use This Document
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specific document recommendations are available.</p>
                  )}
                </CardContent>
              </Card>
              
              <div className="text-center">
                <Button onClick={() => navigate("/document-selection")} className="mr-3">
                  Browse All Documents
                </Button>
                <Button variant="outline" onClick={() => navigate("/evidence-upload")}>
                  Upload More Evidence
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}