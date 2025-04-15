import React, { useState } from 'react';
import { Upload, X, FileText, AlertTriangle, Clock, ChevronDown, ChevronUp, Send, CheckCircle, User, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import {
  DocumentAnalysisResult,
  uploadAndAnalyzeDocument,
  analyzeDocumentText,
  getEntityTypeIcon,
  getEntityTypeColor,
  getEntityTypeLabel,
  formatComplexityScore,
  formatMeritWeight
} from '@/lib/documentAnalysisService';

/**
 * Document Analyzer Component
 * Allows users to upload documents or enter text for AI-powered analysis
 */
export default function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Ontario');
  const [documentType, setDocumentType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'upload' | 'text'>('upload');
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
  };

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  // Handle document type input change
  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentType(e.target.value);
  };

  // Handle province selection change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
  };

  // Submit for analysis
  const handleAnalyze = async () => {
    if (analysisMode === 'upload' && !file) {
      toast({
        title: "No file selected",
        description: "Please select a document to analyze",
        variant: "destructive"
      });
      return;
    }

    if (analysisMode === 'text' && (!textInput || textInput.trim().length < 10)) {
      toast({
        title: "Text too short",
        description: "Please enter more text for meaningful analysis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      let result: DocumentAnalysisResult;
      
      if (analysisMode === 'upload' && file) {
        const response = await uploadAndAnalyzeDocument(
          file,
          documentType || undefined,
          selectedProvince
        );
        result = response.result;
      } else {
        result = await analyzeDocumentText(
          textInput,
          documentType || undefined,
          selectedProvince
        );
      }
      
      setAnalysisResult(result);
      toast({
        title: "Analysis complete",
        description: "Your document has been successfully analyzed",
        variant: "default"
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset the form and analysis
  const resetAnalysis = () => {
    setFile(null);
    setTextInput('');
    setDocumentType('');
    setAnalysisResult(null);
  };

  // Get a Lucide icon component based on entity type
  const getEntityIcon = (type: string) => {
    const iconName = getEntityTypeIcon(type as any);
    switch (iconName) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'building':
        return <Building className="h-4 w-4" />;
      case 'map-pin':
        return <MapPin className="h-4 w-4" />;
      // Add more icon mappings as needed
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">AI-Powered Document Analysis</CardTitle>
          <CardDescription>
            Upload a legal document or enter text to get an in-depth analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={analysisMode} onValueChange={(v) => setAnalysisMode(v as 'upload' | 'text')} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="upload">Upload Document</TabsTrigger>
              <TabsTrigger value="text">Enter Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {!file ? (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm">
                      <label htmlFor="file-upload" className="cursor-pointer text-primary font-medium">
                        Upload a document
                      </label>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <p className="text-gray-500 mt-1">PDF, DOC, DOCX, or TXT up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-500 mr-2" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFile}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="text-input">Document Text</Label>
                <Textarea 
                  id="text-input"
                  placeholder="Enter the document text you want to analyze..." 
                  value={textInput}
                  onChange={handleTextChange}
                  className="min-h-[200px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  For best results, enter at least a few paragraphs of text
                </p>
              </div>
            </TabsContent>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="document-type">Document Type (Optional)</Label>
                <input
                  id="document-type"
                  type="text"
                  placeholder="E.g., Lease Agreement, Court Notice"
                  value={documentType}
                  onChange={handleDocumentTypeChange}
                  className="w-full p-2 mt-1 border rounded"
                />
              </div>
              
              <div>
                <Label htmlFor="province">Jurisdiction</Label>
                <select 
                  id="province"
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="w-full p-2 mt-1 border rounded"
                >
                  <option value="Ontario">Ontario</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Quebec">Quebec</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                  <option value="New Brunswick">New Brunswick</option>
                  <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                  <option value="Prince Edward Island">Prince Edward Island</option>
                  <option value="Northwest Territories">Northwest Territories</option>
                  <option value="Yukon">Yukon</option>
                  <option value="Nunavut">Nunavut</option>
                  <option value="Federal">Federal</option>
                </select>
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetAnalysis} disabled={isAnalyzing}>
            Reset
          </Button>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Analyze Document
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Analysis Results</CardTitle>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  AI: {analysisResult.sourceModel}
                </Badge>
              </div>
              <CardDescription>
                Document Type: {analysisResult.documentType || "Unknown"} • Jurisdiction: {analysisResult.legalJurisdiction || selectedProvince}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Complexity</div>
                  <div className="flex items-center justify-between">
                    <div className={`text-xl font-semibold ${formatComplexityScore(analysisResult.complexityScore).color}`}>
                      {formatComplexityScore(analysisResult.complexityScore).text}
                    </div>
                    <div className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                      {analysisResult.complexityScore}/10
                    </div>
                  </div>
                  <Progress value={analysisResult.complexityScore * 10} className="h-2 mt-2" />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Merit Weight</div>
                  <div className="flex items-center justify-between">
                    <div className={`text-xl font-semibold ${formatMeritWeight(analysisResult.meritWeight || 5).color}`}>
                      {formatMeritWeight(analysisResult.meritWeight || 5).text}
                    </div>
                    <div className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                      {analysisResult.meritWeight || 5}/10
                    </div>
                  </div>
                  <Progress value={(analysisResult.meritWeight || 5) * 10} className="h-2 mt-2" />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Key Entities</div>
                  <div className="text-xl font-semibold">{analysisResult.keyEntities.length}</div>
                  <div className="flex mt-2 flex-wrap gap-1">
                    {analysisResult.keyEntities.slice(0, 3).map((entity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {entity.text}
                      </Badge>
                    ))}
                    {analysisResult.keyEntities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{analysisResult.keyEntities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Deadlines</div>
                  <div className="text-xl font-semibold">{analysisResult.deadlines.length}</div>
                  <div className="flex mt-2 items-center">
                    {analysisResult.deadlines.length > 0 ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Time-sensitive information
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No deadlines found
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {analysisResult.summary}
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {analysisResult.keyEntities.length > 0 && (
                  <AccordionItem value="entities">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Key Entities
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {analysisResult.keyEntities.map((entity, index) => (
                          <div key={index} className="border rounded p-2 flex items-start">
                            <div className={`p-1 rounded mr-2 ${getEntityTypeColor(entity.type as any)}`}>
                              {getEntityIcon(entity.type)}
                            </div>
                            <div>
                              <div className="font-medium truncate">{entity.text}</div>
                              <div className="text-xs text-gray-500">{getEntityTypeLabel(entity.type as any)}</div>
                              {entity.context && (
                                <div className="text-xs text-gray-600 mt-1 italic">"{entity.context}"</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {analysisResult.keyConcepts.length > 0 && (
                  <AccordionItem value="concepts">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Key Concepts
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {analysisResult.keyConcepts.map((concept, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="font-medium">{concept.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{concept.description}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {analysisResult.deadlines.length > 0 && (
                  <AccordionItem value="deadlines">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Important Deadlines
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {analysisResult.deadlines.map((deadline, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="font-medium">{deadline.description}</div>
                            <div className="flex items-center mt-1">
                              <Badge variant={deadline.isAbsolute ? "default" : "outline"} className="text-xs mr-2">
                                {deadline.isAbsolute ? "Fixed Date" : "Relative"}
                              </Badge>
                              <div className="text-sm">{deadline.date}</div>
                            </div>
                            {deadline.consequence && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium text-amber-600">If missed: </span> 
                                {deadline.consequence}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {analysisResult.obligations.length > 0 && (
                  <AccordionItem value="obligations">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Legal Obligations
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {analysisResult.obligations.map((obligation, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="font-medium">{obligation.description}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-gray-500">Who: </span>
                                {obligation.obligated}
                              </div>
                              <div>
                                <span className="text-gray-500">When: </span>
                                {obligation.timeframe}
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">Must: </span>
                                {obligation.to}
                              </div>
                              {obligation.consequence && (
                                <div className="col-span-2">
                                  <span className="text-gray-500 text-amber-600">If not: </span>
                                  {obligation.consequence}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {analysisResult.risksAndWarnings.length > 0 && (
                  <AccordionItem value="risks">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Risks & Warnings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {analysisResult.risksAndWarnings.map((risk, index) => (
                          <div key={index} className="flex border rounded p-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>{risk}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {analysisResult.nextSteps.length > 0 && (
                  <AccordionItem value="next-steps">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Recommended Next Steps
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {analysisResult.nextSteps.map((step, index) => (
                          <div key={index} className="flex border rounded p-3">
                            <div className="flex-shrink-0 mr-3 mt-0.5">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700">
                                {index + 1}
                              </div>
                            </div>
                            <div>{step}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                <AccordionItem value="raw">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Full Analysis
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-mono text-sm">
                      {analysisResult.rawAnalysis}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={resetAnalysis}>
                Start New Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}