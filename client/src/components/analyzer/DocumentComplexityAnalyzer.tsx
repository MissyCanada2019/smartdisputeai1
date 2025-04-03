import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type AnalysisResult = {
  analysis: string;
  filename?: string;
  success: boolean;
};

export default function DocumentComplexityAnalyzer() {
  const [activeTab, setActiveTab] = useState("file");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset state when changing tabs
    setResult(null);
    setError(null);
    if (value === "file") {
      setText("");
    } else {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const analyzeDocument = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      if (activeTab === "file") {
        if (!file) {
          throw new Error("Please select a document to analyze.");
        }
        
        // File size validation (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File size exceeds 10MB limit.");
        }

        const formData = new FormData();
        formData.append("document", file);

        const response = await fetch("/api/document-analyzer/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze document.");
        }

        const data = await response.json();
        setResult(data);
      } else {
        if (!text.trim()) {
          throw new Error("Please enter text to analyze.");
        }

        const response = await fetch("/api/document-analyzer/analyze-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze text.");
        }

        const data = await response.json();
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to parse and format the AI analysis
  const formatAnalysis = (analysis: string) => {
    // Extract complexity score (assumes format like "complexity score: 8/10" or similar)
    const complexityMatch = analysis.match(/complexity score:?\s*(\d+)[\/\s]*10|complexity:?\s*(\d+)[\/\s]*10|score:?\s*(\d+)[\/\s]*10|rating:?\s*(\d+)[\/\s]*10/i);
    const complexityScore = complexityMatch ? parseInt(complexityMatch[1] || complexityMatch[2] || complexityMatch[3] || complexityMatch[4]) : null;
    
    // Extract readability assessment
    const readabilityMatch = analysis.match(/readability:?\s*(easy|moderate|difficult)/i);
    const readability = readabilityMatch ? readabilityMatch[1].toLowerCase() : null;
    
    // Split by numbered sections or double line breaks for the rest of the content
    const sections = analysis.split(/\d+\.\s+|\n\n+/);
    
    return (
      <div className="space-y-4">
        {complexityScore !== null && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Complexity Score:</p>
            <div className="flex items-center gap-4">
              <Progress 
                value={complexityScore * 10} 
                className="h-2" 
                indicatorClassName={
                  complexityScore <= 3 ? "bg-green-500" : 
                  complexityScore <= 7 ? "bg-yellow-500" : 
                  "bg-red-500"
                }
              />
              <Badge 
                className={
                  complexityScore <= 3 ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                  complexityScore <= 7 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : 
                  "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {complexityScore}/10
              </Badge>
            </div>
          </div>
        )}
        
        {readability && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Readability:</p>
            <Badge 
              className={
                readability === "easy" ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                readability === "moderate" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : 
                "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {readability.charAt(0).toUpperCase() + readability.slice(1)}
            </Badge>
          </div>
        )}
        
        {/* Display the full analysis with formatting */}
        <div className="prose prose-sm max-w-none">
          {sections.map((section, index) => {
            const trimmedSection = section.trim();
            if (!trimmedSection) return null;
            
            // Check if this section looks like a header
            if (trimmedSection.toLowerCase().includes("jargon") || 
                trimmedSection.toLowerCase().includes("summary") || 
                trimmedSection.toLowerCase().includes("concern") || 
                trimmedSection.toLowerCase().includes("issue") || 
                trimmedSection.toLowerCase().includes("explanation")) {
              return <h3 key={index} className="font-bold mt-4 mb-2">{trimmedSection}</h3>;
            }
            
            return <p key={index} className="mb-2">{trimmedSection}</p>;
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Document Complexity Analyzer</CardTitle>
        <CardDescription>
          Instantly analyze any legal document or text to understand its complexity, readability, and potential issues.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="file" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Upload Document</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Paste Text</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="document">Upload Document (PDF, DOC, DOCX, TXT)</Label>
              <Input 
                id="document" 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
            </div>
            
            {file && (
              <p className="text-sm flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" /> 
                Selected file: {file.name}
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="legal-text">Paste Legal Text</Label>
              <Textarea
                id="legal-text"
                placeholder="Paste legal text to analyze here..."
                value={text}
                onChange={handleTextChange}
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-lg mb-3">Analysis Results</h3>
            {result.filename && (
              <p className="text-sm text-gray-500 mb-4">Document: {result.filename}</p>
            )}
            {formatAnalysis(result.analysis)}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={analyzeDocument} 
          disabled={isAnalyzing || (activeTab === "file" && !file) || (activeTab === "text" && !text.trim())}
          className="bg-red-600 hover:bg-red-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze {activeTab === "file" ? "Document" : "Text"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}