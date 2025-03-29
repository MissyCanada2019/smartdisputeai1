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
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
          <span className="text-primary">Fighting Back Starts Here</span>
          <span className="block mt-2">AI-Powered Legal Help for Canadians Who've Had Enough.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Simple, accessible legal solutions designed specifically for low-income and marginalized Canadians.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <Link href="/user-info">
            <Button size="lg" className="text-lg px-10 py-6 font-semibold">
              Start Your Dispute
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 font-semibold">
              Read Our Story
            </Button>
          </Link>
        </div>
        
        {/* Fast blurbs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center flex flex-col items-center">
            <DollarSign className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-bold">Fix Credit Reports</p>
            <p className="text-gray-600 mt-2">Challenge incorrect Equifax information and repair your financial standing.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center flex flex-col items-center">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-bold">Hold Landlords Accountable</p>
            <p className="text-gray-600 mt-2">Assert your tenant rights with powerful LTB applications and dispute tools.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center flex flex-col items-center">
            <Gavel className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-bold">Push Back Against CAS & Police Overreach</p>
            <p className="text-gray-600 mt-2">Protect your family and rights with legal documents that demand respect.</p>
          </div>
        </div>
      </div>
      
      {/* Smart Question Section */}
      <div className="py-8 max-w-4xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Find The Right Forms & Resources</h2>
          <p className="text-gray-600 mb-6">Tell us what you're looking for, and we'll guide you to the appropriate forms, templates, and resources.</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dispute-question" className="block text-sm font-medium text-gray-700 mb-1">
                What issue are you facing? (Be as specific as possible)
              </label>
              <textarea 
                id="dispute-question" 
                rows={3} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Example: My landlord hasn't fixed my leaking roof for 3 months despite multiple requests"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dispute-agency" className="block text-sm font-medium text-gray-700 mb-1">
                  Which agency or organization are you dealing with? (Optional)
                </label>
                <select 
                  id="dispute-agency" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">Select an agency (optional)</option>
                  <option value="landlord">Landlord or Property Management</option>
                  <option value="ltb">Landlord and Tenant Board</option>
                  <option value="cas">Children's Aid Society</option>
                  <option value="equifax">Equifax or Credit Bureau</option>
                  <option value="shelter">Shelter or Housing Service</option>
                  <option value="other">Other (please specify in your question)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="dispute-province" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Province or Territory (Optional)
                </label>
                <select 
                  id="dispute-province" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">Select your location (optional)</option>
                  <option value="AB">Alberta</option>
                  <option value="BC">British Columbia</option>
                  <option value="MB">Manitoba</option>
                  <option value="NB">New Brunswick</option>
                  <option value="NL">Newfoundland and Labrador</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="NT">Northwest Territories</option>
                  <option value="NU">Nunavut</option>
                  <option value="ON">Ontario</option>
                  <option value="PE">Prince Edward Island</option>
                  <option value="QC">Quebec</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="YT">Yukon</option>
                </select>
              </div>
            </div>
            
            <Link href="/chat">
              <Button 
                className="w-full md:w-auto px-6 py-3 text-lg"
              >
                Get Personalized Help
              </Button>
            </Link>
          </div>
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
