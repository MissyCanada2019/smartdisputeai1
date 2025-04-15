import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { compareAnalyses } from "@/lib/aiService";
import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AIDocumentComparisonProps {
  openaiAnalysis: string;
  claudeAnalysis: string;
  filename: string;
}

export default function AIDocumentComparison({
  openaiAnalysis,
  claudeAnalysis,
  filename
}: AIDocumentComparisonProps) {
  const [activeTab, setActiveTab] = useState<string>("openai");
  const comparison = compareAnalyses({ openai: openaiAnalysis, claude: claudeAnalysis });

  // Function to format the analysis text with better spacing and formatting
  const formatAnalysisText = (text: string) => {
    // Add line breaks before headings and list items
    const formattedText = text
      .replace(/(\d+\.\s+[A-Z\s]+:)/g, '\n\n$1')  // Section headings (1. SECTION NAME:)
      .replace(/(-\s+)/g, '\n$1')  // List items
      .replace(/(•\s+)/g, '\n$1');  // Bullet points
    
    return formattedText;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Analysis Comparison</h2>
          <p className="text-gray-600">
            Compare analysis between our trusted AI models for comprehensive insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">{filename}</span>
        </div>
      </div>

      <Tabs defaultValue="openai" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="openai">Primary Analysis</TabsTrigger>
          <TabsTrigger value="claude">Secondary Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Compare Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Primary AI Analysis
                <Badge variant="outline" className="ml-2 bg-teal-50 text-teal-700 border-teal-200">
                  Premium
                </Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive legal document analysis by our primary AI engine
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {formatAnalysisText(openaiAnalysis)}
                </pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("claude")}>
                View Secondary Analysis
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("comparison")}>
                Compare Analyses
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="claude">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Secondary AI Analysis
                <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                  Premium
                </Badge>
              </CardTitle>
              <CardDescription>
                Alternative legal document analysis by our secondary AI engine
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {formatAnalysisText(claudeAnalysis)}
                </pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("openai")}>
                View Primary Analysis
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("comparison")}>
                Compare Analyses
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Comparison</CardTitle>
              <CardDescription>
                Compare different AI perspectives side-by-side for deeper insights
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {/* Side-by-side comparison view */}
              <div className="space-y-6">
                <Tabs defaultValue="side-by-side">
                  <TabsList className="mb-4">
                    <TabsTrigger value="side-by-side">Side-by-Side View</TabsTrigger>
                    <TabsTrigger value="differences">Key Differences</TabsTrigger>
                    <TabsTrigger value="similarities">Similarities</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="side-by-side">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 bg-teal-50">
                        <h3 className="text-md font-semibold mb-2 text-teal-700 flex items-center">
                          <span className="inline-block w-3 h-3 bg-teal-600 rounded-full mr-2"></span>
                          Primary Analysis
                        </h3>
                        <div className="h-[400px] overflow-y-auto prose prose-sm max-w-none p-2 bg-white rounded border">
                          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {formatAnalysisText(openaiAnalysis)}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-purple-50">
                        <h3 className="text-md font-semibold mb-2 text-purple-700 flex items-center">
                          <span className="inline-block w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
                          Secondary Analysis
                        </h3>
                        <div className="h-[400px] overflow-y-auto prose prose-sm max-w-none p-2 bg-white rounded border">
                          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {formatAnalysisText(claudeAnalysis)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="differences">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 text-amber-700">Key Differences</h3>
                      <ul className="space-y-2">
                        {comparison.differences.length > 0 ? (
                          comparison.differences.map((difference, index) => (
                            <li key={index} className="flex gap-2 items-start text-sm p-2 border-b last:border-0">
                              <span className="text-amber-600 font-medium mt-0.5">•</span>
                              <span>{difference}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-600 p-2">No significant differences found in the analyses</li>
                        )}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="similarities">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 text-green-700">Key Similarities</h3>
                      <ul className="space-y-2">
                        {comparison.similarities.length > 0 ? (
                          comparison.similarities.map((similarity, index) => (
                            <li key={index} className="flex gap-2 items-start text-sm p-2 border-b last:border-0">
                              <span className="text-green-600 font-medium mt-0.5">✓</span>
                              <span>{similarity}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-600 p-2">No significant similarities found in the analyses</li>
                        )}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-8 p-4 border rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Expert Recommendation</h3>
                <p className="text-sm text-gray-700">
                  For legal documents, we recommend reviewing both analyses as they may highlight different aspects of your case. 
                  Our secondary analysis tends to be more conservative in legal assessments, while our primary analysis may provide more creative strategic approaches.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-teal-700 mb-1">Primary AI Strengths:</h4>
                    <ul className="list-disc pl-4 text-gray-700 space-y-1">
                      <li>More creative problem-solving</li>
                      <li>Stronger at analyzing complex language</li>
                      <li>Better at identifying persuasive arguments</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-purple-700 mb-1">Secondary AI Strengths:</h4>
                    <ul className="list-disc pl-4 text-gray-700 space-y-1">
                      <li>More thorough legal assessment</li>
                      <li>Better at identifying risks and weaknesses</li>
                      <li>More detailed procedural explanations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("openai")}>
                View Primary Analysis
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("claude")}>
                View Secondary Analysis
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}