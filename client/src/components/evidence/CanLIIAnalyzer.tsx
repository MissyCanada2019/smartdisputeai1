import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, FileText, Search, Info, AlertTriangle, Check, Scale, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EvidenceFile {
  id: number;
  user_id: number | null;
  session_id: string | null;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  analysis: any | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AnalysisResult {
  id: number;
  user_id: number | null;
  session_id: string | null;
  evidence_ids: number[];
  legal_context: string;
  case_strength: number;
  analysis_text: string;
  relevant_precedents: any[];
  recommended_actions: string[];
  procedural_assessment?: string; // Added for court rules integration
  created_at: string;
  updated_at: string;
}

interface CanLIICitation {
  title: string;
  citation: string;
  year: number;
  court: string;
  url: string;
  relevance: number;
  key_points: string[];
}

const CanLIIAnalyzer: React.FC = () => {
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<number[]>([]);
  const [legalContext, setLegalContext] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch evidence files
  const { data: evidenceFiles = [], isLoading, error } = useQuery<EvidenceFile[]>({
    queryKey: ['/api/evidence-files/user'],
    retry: 1,
  });
  
  // Create analysis mutation
  const createAnalysisMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/directEvidence/analyze', 'POST', {
        evidenceIds: selectedEvidenceIds,
        legalContext: legalContext
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Analysis Complete',
        description: 'Your evidence has been analyzed successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/case-analyses/user'] });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze your evidence. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Fetch most recent analysis if available
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<AnalysisResult[]>({
    queryKey: ['/api/case-analyses/user'],
    retry: 1,
  });
  
  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;
  
  const handleEvidenceSelection = (evidenceId: number) => {
    setSelectedEvidenceIds(prev => 
      prev.includes(evidenceId) 
        ? prev.filter(id => id !== evidenceId) 
        : [...prev, evidenceId]
    );
  };
  
  const handleAnalyzeClick = () => {
    if (selectedEvidenceIds.length === 0) {
      toast({
        title: 'No Evidence Selected',
        description: 'Please select at least one evidence file to analyze.',
        variant: 'destructive',
      });
      return;
    }
    
    createAnalysisMutation.mutate();
  };
  
  // Helper function to render precedent citations
  const renderPrecedents = (precedents: CanLIICitation[]) => {
    if (!precedents || precedents.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Precedents Found</AlertTitle>
          <AlertDescription>
            No specific precedents were identified for this case. This could be due to the unique nature of your situation or limited details provided.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-4">
        {precedents.map((precedent, index) => (
          <Card key={index} className="border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{precedent.title}</CardTitle>
                <Badge variant={precedent.relevance > 7 ? "default" : "secondary"} className="text-xs">
                  {precedent.relevance > 7 ? 'Highly Relevant' : 'Relevant'}
                </Badge>
              </div>
              <CardDescription className="text-xs flex items-center mt-1">
                <span>{precedent.citation}</span>
                <span className="mx-1">•</span>
                <span>{precedent.year}</span>
                <span className="mx-1">•</span>
                <span>{precedent.court}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger className="py-1 text-sm">Key Takeaways</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {precedent.key_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" asChild className="p-0 h-auto">
                <a href={precedent.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on CanLII
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Evidence</AlertTitle>
        <AlertDescription>
          We couldn't load your evidence files. Please refresh the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">CanLII Case Analysis</h2>
        <Button 
          onClick={handleAnalyzeClick} 
          disabled={selectedEvidenceIds.length === 0 || createAnalysisMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {createAnalysisMutation.isPending ? 'Analyzing...' : 'Analyze Evidence with CanLII'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Evidence</CardTitle>
              <CardDescription>Choose files to include in your case analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evidenceFiles.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No evidence files uploaded yet</p>
                    <Button variant="link" asChild className="mt-2">
                      <a href="/evidence-upload">Upload Evidence</a>
                    </Button>
                  </div>
                ) : (
                  evidenceFiles.map(file => (
                    <div key={file.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`evidence-${file.id}`} 
                        checked={selectedEvidenceIds.includes(file.id)}
                        onCheckedChange={() => handleEvidenceSelection(file.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={`evidence-${file.id}`} className="font-medium">
                          {file.originalFilename}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {file.fileType} • {(file.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start">
              <Label htmlFor="legal-context" className="mb-2">Legal Context (Optional)</Label>
              <Textarea 
                id="legal-context" 
                placeholder="Describe your situation (e.g., 'Landlord harassment', 'Property maintenance issues', 'Illegal eviction attempt')"
                value={legalContext}
                onChange={(e) => setLegalContext(e.target.value)}
                className="w-full resize-none"
                rows={4}
              />
            </CardFooter>
          </Card>
          
          <div className="mt-4">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 dark:text-blue-400">How This Works</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                We analyze your evidence against CanLII's database of Canadian legal decisions and official Canadian Court Rules to identify relevant precedents, applicable procedures, and build stronger legal arguments for your case.
              </AlertDescription>
            </Alert>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {createAnalysisMutation.isPending ? (
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Your Case</CardTitle>
                <CardDescription>This may take a few minutes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="animate-pulse flex flex-col items-center">
                  <Scale className="h-16 w-16 text-blue-200 mb-4" />
                  <p className="text-gray-500 mb-2">Searching CanLII database for relevant cases</p>
                  <div className="w-64 h-2 bg-gray-200 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ) : latestAnalysis ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Case Analysis Results</CardTitle>
                    <CardDescription>Based on {latestAnalysis.evidence_ids.length} evidence items</CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    latestAnalysis.case_strength > 7 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : latestAnalysis.case_strength > 4 
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {latestAnalysis.case_strength > 7 ? 'Strong Case' : 
                     latestAnalysis.case_strength > 4 ? 'Moderate Case' : 'Weak Case'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="precedents">CanLII Precedents</TabsTrigger>
                    <TabsTrigger value="court-rules">Court Rules</TabsTrigger>
                    <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="pt-4">
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: latestAnalysis.analysis_text.replace(/\n/g, '<br />') }} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="precedents" className="pt-4">
                    {renderPrecedents(latestAnalysis.relevant_precedents || [])}
                  </TabsContent>
                  
                  <TabsContent value="court-rules" className="pt-4">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Applicable Court Rules</CardTitle>
                          <CardDescription className="text-xs">
                            Based on the Canadian Justice Laws Website
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <p>The following court rules may be relevant to your case:</p>
                            <ul className="space-y-2 mt-3">
                              <li className="flex items-start">
                                <div className="mr-2 mt-0.5 rounded-full bg-blue-100 p-1 text-blue-600">
                                  <FileText className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="font-medium">Procedural Requirements</p>
                                  <p className="text-sm text-gray-600">
                                    Based on your evidence, ensure compliance with filing deadlines and procedural requirements specific to your jurisdiction.
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <div className="mr-2 mt-0.5 rounded-full bg-blue-100 p-1 text-blue-600">
                                  <FileText className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="font-medium">Evidence Standards</p>
                                  <p className="text-sm text-gray-600">
                                    Your evidence should meet the admissibility standards outlined in the applicable rules of evidence for your province.
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <div className="mr-2 mt-0.5 rounded-full bg-blue-100 p-1 text-blue-600">
                                  <FileText className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="font-medium">Documentation Format</p>
                                  <p className="text-sm text-gray-600">
                                    Documents submitted to the court must follow specific formatting requirements per your jurisdiction's court rules.
                                  </p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <a href="https://laws-lois.justice.gc.ca/eng/Court/" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Official Canadian Court Rules
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="pt-4">
                    <div className="space-y-4">
                      {latestAnalysis.recommended_actions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                            <Check className="h-4 w-4" />
                          </div>
                          <p className="text-sm">{action}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" asChild size="sm">
                  <a href="/document-selection" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Create Related Documents
                  </a>
                </Button>
                <Button onClick={handleAnalyzeClick} size="sm">
                  Run New Analysis
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Case Analysis</CardTitle>
                <CardDescription>
                  Select evidence files and click "Analyze Evidence with CanLII" to assess your case
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center text-center py-16">
                <Scale className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-medium mb-2">Let Legal AI Evaluate Your Case</h3>
                <p className="text-gray-500 max-w-md mb-4">
                  Our AI will analyze your evidence against Canadian law precedents from CanLII and official Court Rules to help build the strongest possible legal arguments and ensure procedural compliance
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-4">
            <Alert variant="default" className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800/40">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800 dark:text-orange-400">Important Notice</AlertTitle>
              <AlertDescription className="text-orange-700 dark:text-orange-300 text-sm">
                This tool provides analysis based on similar cases, but is not legal advice. Results should be used as a starting point for understanding your legal position.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanLIIAnalyzer;