import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Brain, Shield, FileCheck, BarChart, Share2, Users, Search, Mail } from "lucide-react";

export default function Services() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Our AI-Powered Services</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          SmartDispute.ai Canada provides sophisticated AI tools designed to help marginalized Canadians navigate complex legal systems and disputes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Document Creation */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-800">Document Creation</CardTitle>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-gray-600 min-h-[80px]">
              Create legally sound documents tailored to your specific situation with our AI-driven document generator.
            </CardDescription>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Province-specific legal frameworks</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Built-in legal compliance checks</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Plain language explanations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/document-selection-hierarchical">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Evidence Analysis */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Evidence Analysis</CardTitle>
              <Search className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-gray-600 min-h-[80px]">
              Upload your evidence and let our AI analyze it to help strengthen your case and identify key legal points.
            </CardDescription>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Merit assessment scoring</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Document categorization</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Key information extraction</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/evidence-upload">Upload Evidence</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Legal Assistant Chat */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="bg-purple-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-800">Legal Assistant Chat</CardTitle>
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-gray-600 min-h-[80px]">
              Get answers to your legal questions with our specialized Canadian legal AI chatbot.
            </CardDescription>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Province-specific legal guidance</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Plain language answers</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-sm">References to relevant statutes</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/chat">Start Chatting</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Case Outcome Prediction */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="bg-amber-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-800">Case Prediction</CardTitle>
              <Brain className="h-6 w-6 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-gray-600 min-h-[80px]">
              Get insights into potential outcomes for your case based on similar cases and statutes.
            </CardDescription>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-amber-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Statistical analysis</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-amber-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Case strength evaluation</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-amber-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Improvement recommendations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/evidence-upload">Analyze Your Case</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Document Management */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="bg-indigo-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-indigo-800">Document Management</CardTitle>
              <FileCheck className="h-6 w-6 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-gray-600 min-h-[80px]">
              Store, organize, and access all your legal documents in one secure location.
            </CardDescription>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-indigo-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Folder organization system</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-indigo-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Secure document storage</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-indigo-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Easy sharing options</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/document-management">Manage Documents</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Community Support */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-800">Community Support</CardTitle>
              <Users className="h-6 w-6 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-gray-600 min-h-[80px]">
              Connect with others facing similar challenges and share experiences and advice.
            </CardDescription>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-red-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Moderated discussion forums</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-red-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Resource sharing</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-red-600 mt-1 flex-shrink-0" />
                <span className="text-sm">Success stories</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/community">Join Community</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 bg-gray-50 p-8 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Need Personalized Assistance?</h2>
          <p className="text-gray-600">
            If you have specific questions or need customized support, our team is here to help.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <a 
            href="mailto:smartdisputesaicanada@gmail.com" 
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>smartdisputesaicanada@gmail.com</span>
          </a>
          
          <Link href="/subscribe">
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Subscribe to Premium Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}