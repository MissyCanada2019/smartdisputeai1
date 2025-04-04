import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUpload from "@/components/forms/FileUpload";

interface DocumentAnalyzerProps {
  title?: string;
  description?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function DocumentAnalyzer({
  title = "AI-Powered Document Analysis",
  description = "Upload a document to analyze with AI. We'll identify key points, evidence weight, and provide strategic recommendations.",
  onAnalysisComplete
}: DocumentAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    analysis?: string;
    openai?: string;
    claude?: string;
    filename?: string;
    model?: string;
    success?: boolean;
    error?: string;
  } | null>(null);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'claude' | 'dual'>('openai');
  const [activeTab, setActiveTab] = useState<'document' | 'analysis' | 'openai' | 'claude'>('document');
  const { toast } = useToast();

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    } else {
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      let response;
      let data;

      if (selectedModel === 'dual') {
        // Use dual analysis endpoint
        response = await apiRequest("POST", "/api/document-analyzer/analyze-dual", formData);
        data = await response.json();
        
        if (response.ok && data.success) {
          setResult({
            openai: data.openai,
            claude: data.claude,
            filename: data.filename,
            success: true
          });
          setActiveTab('openai'); // Default to OpenAI tab for results
        } else {
          throw new Error(data.error || "Failed to analyze the document");
        }
      } else {
        // Use single model analysis with model parameter
        const url = `/api/document-analyzer/analyze?model=${selectedModel}`;
        response = await apiRequest("POST", url, formData);
        data = await response.json();
        
        if (response.ok && data.success) {
          setResult({
            analysis: data.analysis,
            filename: data.filename,
            model: data.model,
            success: true
          });
          setActiveTab('analysis');
        } else {
          throw new Error(data.error || "Failed to analyze the document");
        }
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${file.name}`,
        variant: "default",
      });
    } catch (error: any) {
      setResult({
        error: error.message,
        success: false
      });
      
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the document",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="document" className="flex-1">Document</TabsTrigger>
            {selectedModel !== 'dual' && result?.success && (
              <TabsTrigger value="analysis" className="flex-1">Analysis</TabsTrigger>
            )}
            {selectedModel === 'dual' && result?.success && (
              <>
                <TabsTrigger value="openai" className="flex-1">OpenAI Analysis</TabsTrigger>
                <TabsTrigger value="claude" className="flex-1">Claude Analysis</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="document" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">Select AI Model:</Label>
              <Select 
                value={selectedModel} 
                onValueChange={(value) => setSelectedModel(value as 'openai' | 'claude' | 'dual')}
              >
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="claude">Claude (Claude 3.7 Sonnet)</SelectItem>
                  <SelectItem value="dual">Dual Analysis (Both Models)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedModel === 'openai' && "Using OpenAI's GPT-4o model for analysis."}
                {selectedModel === 'claude' && "Using Anthropic's Claude 3.7 Sonnet model for analysis."}
                {selectedModel === 'dual' && "Compare analysis from both OpenAI's GPT-4o and Anthropic's Claude 3.7 Sonnet."}
              </p>
            </div>

            <FileUpload 
              onUpload={handleFileSelected}
              multiple={false}
              acceptedFileTypes=".pdf,.doc,.docx,.txt"
              maxFileSizeMB={20}
              label="Document for Analysis"
              helpText="Upload a legal document to analyze. We support PDF, DOC, DOCX, and TXT files up to 20MB."
            />
            
            <Button 
              onClick={handleAnalyze} 
              disabled={!file || isAnalyzing}
              className="w-full mt-4"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Document
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            {result?.success && result.analysis && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Analysis of {result.filename}
                    </h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Using {result.model === 'claude' ? 'Claude 3.7 Sonnet' : 'GPT-4o'}
                    </div>
                  </div>
                  <div className="prose max-w-none overflow-auto max-h-[600px] p-2">
                    {result.analysis.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="openai" className="mt-4">
            {result?.success && result.openai && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      OpenAI Analysis of {result.filename}
                    </h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Using GPT-4o
                    </div>
                  </div>
                  <div className="prose max-w-none overflow-auto max-h-[600px] p-2">
                    {result.openai.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="claude" className="mt-4">
            {result?.success && result.claude && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Claude Analysis of {result.filename}
                    </h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Using Claude 3.7 Sonnet
                    </div>
                  </div>
                  <div className="prose max-w-none overflow-auto max-h-[600px] p-2">
                    {result.claude.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {result?.error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
            <h4 className="font-medium text-sm mb-2 text-red-700">Analysis Error:</h4>
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        )}
      </CardContent>
      {result?.success && (
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setFile(null);
              setResult(null);
              setActiveTab('document');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Analyze Another Document
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}