import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/ui/container";
import { Helmet } from "react-helmet";
import DocumentAnalyzer from "@/components/documents/DocumentAnalyzer";

export default function AiDocumentAnalysis() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>AI-Powered Document Analysis | SmartDispute.ai</title>
        <meta name="description" content="Use advanced AI models to analyze your legal documents for case merit, evidence strength, and court strategy recommendations." />
      </Helmet>
      
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Document Analysis</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Use our advanced AI technology to analyze legal documents and get strategic insights. 
              Compare analyses from multiple AI models.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <DocumentAnalyzer
              title="Analyze Your Legal Document"
              description="Upload a legal document to analyze. Our AI will identify key points, assess merit weight, and provide strategic recommendations to help with your case."
              onAnalysisComplete={(analysis) => {
                console.log("Analysis completed:", analysis);
              }}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-primary font-medium">1</span>
                </div>
                <h3 className="font-medium">Upload Your Document</h3>
                <p className="text-sm text-gray-600">
                  Select a legal document in PDF, DOC, DOCX, or TXT format. Choose which AI model(s) to use for analysis.
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-primary font-medium">2</span>
                </div>
                <h3 className="font-medium">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI reads and analyzes your document, identifying key legal points, evidence weight, and strategic considerations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-primary font-medium">3</span>
                </div>
                <h3 className="font-medium">Review Insights</h3>
                <p className="text-sm text-gray-600">
                  Get comprehensive analysis with actionable recommendations to help strengthen your legal position.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Comparing AI Models</h2>
            <p className="mb-4">
              Our platform offers analyses from multiple advanced AI models, each with its own strengths:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">OpenAI GPT-4o</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                  <li>Exceptional at identifying legal complexity and nuance</li>
                  <li>Strong at identifying potential evidence weaknesses</li>
                  <li>Provides detailed court strategy recommendations</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Anthropic Claude 3.7 Sonnet</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                  <li>Excellent at identifying key legal principles</li>
                  <li>Strong reasoning for case merit weighting</li>
                  <li>Clear, actionable strategic next steps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}