import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Gavel, 
  FileText, 
  DollarSign, 
  Shield 
} from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Affordable Legal Documents for
          <span className="block text-primary mt-2">Government Agency Disputes</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Simple, accessible legal solutions designed specifically for low-income and marginalized Canadians.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/user-info">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-lg px-8">
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Features */}
      <div className="py-16 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How LegalAssist Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our simple process makes it easy to create professional legal documents at a fraction of traditional costs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose Your Document</h3>
            <p className="text-gray-600">
              Select from document templates specifically designed for government agency disputes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fill in Your Details</h3>
            <p className="text-gray-600">
              Enter your information using our simple forms with clear instructions.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pay What You Can</h3>
            <p className="text-gray-600">
              Benefit from our sliding scale pricing based on your income level.
            </p>
          </div>
        </div>
      </div>
      
      {/* Document Categories */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Battle</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select from our specialized categories of legal documents tailored to help you with specific agency disputes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/document-selection?category=Children's Aid Society">
              <div className="bg-gray-100 p-4 flex justify-center">
                <FileText className="h-24 w-24 text-primary" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-lg text-gray-800 mb-1">Children's Aid Society</h3>
                <p className="text-sm text-gray-600">Dispute letters and appeals for CAS decisions</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/document-selection?category=Landlord-Tenant">
              <div className="bg-gray-100 p-4 flex justify-center">
                <Shield className="h-24 w-24 text-primary" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-lg text-gray-800 mb-1">Landlord-Tenant</h3>
                <p className="text-sm text-gray-600">Maintenance requests and dispute resolutions</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/document-selection?category=Credit Disputes">
              <div className="bg-gray-100 p-4 flex justify-center">
                <DollarSign className="h-24 w-24 text-primary" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-lg text-gray-800 mb-1">Equifax Disputes</h3>
                <p className="text-sm text-gray-600">Challenge incorrect credit report information</p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/document-selection?category=Appeals">
              <div className="bg-gray-100 p-4 flex justify-center">
                <Gavel className="h-24 w-24 text-primary" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-lg text-gray-800 mb-1">Transition Services</h3>
                <p className="text-sm text-gray-600">Administrative tribunal appeals and FOI requests</p>
              </CardContent>
            </Link>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/document-selection">
            <Button variant="outline">
              View All Document Types
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Featured Document Types */}
      <div className="py-16 bg-gray-50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Document Templates</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most frequently requested document templates to address common disputes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-100 p-4 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Administrative Tribunal Appeal document preview" 
                className="h-32 object-contain" 
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-1">Administrative Tribunal Appeal</h3>
              <p className="text-sm text-gray-600 mb-2">For appealing decisions made by government administrative tribunals.</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 mr-2">All Provinces</span>
                <span>$39.99</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-100 p-4 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="FOI Request document preview" 
                className="h-32 object-contain" 
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-1">Freedom of Information Request</h3>
              <p className="text-sm text-gray-600 mb-2">Request information from government agencies under FOI legislation.</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 mr-2">All Provinces</span>
                <span>$29.99</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-100 p-4 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Tax Assessment Dispute document preview" 
                className="h-32 object-contain" 
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-1">Equifax Dispute Letter</h3>
              <p className="text-sm text-gray-600 mb-2">Challenge incorrect information on your Equifax credit report.</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 mr-2">All Provinces</span>
                <span>$5.99</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Testimonials/Features */}
      <div className="py-16 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LegalAssist</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Created specifically to help low-income and marginalized Canadians navigate legal disputes with government agencies.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Affordable Pricing</h3>
                <p className="text-gray-600">
                  Our sliding scale pricing ensures that legal documents are accessible to everyone regardless of income.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Province-Specific</h3>
                <p className="text-gray-600">
                  Documents tailored to the legal requirements of each Canadian province and territory.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Plain Language</h3>
                <p className="text-gray-600">
                  All forms and instructions are written in clear, simple language without legal jargon.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Mobile Friendly</h3>
                <p className="text-gray-600">
                  Create documents from any device - perfect for users without computer access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="py-16 bg-primary/5 rounded-lg mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Create Your Legal Document?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Start the process now and get the legal documents you need at a price you can afford.
        </p>
        <Link href="/user-info">
          <Button size="lg" className="text-lg px-8">
            Get Started Now
          </Button>
        </Link>
      </div>
      
      {/* Trust Indicators */}
      <div className="py-12">
        <Separator className="mb-12" />
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">Secure & Private</p>
          </div>
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">Legally Valid</p>
          </div>
          <div className="text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">Income-Based Pricing</p>
          </div>
          <div className="text-center">
            <Gavel className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">Province-Specific</p>
          </div>
        </div>
      </div>
    </div>
  );
}
