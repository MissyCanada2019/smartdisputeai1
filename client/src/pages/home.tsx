import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Gavel, 
  FileText, 
  DollarSign, 
  Shield,
  Play,
  Star,
  User 
} from "lucide-react";

import { useState } from 'react';

export default function Home() {
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsVideoLoaded(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Quick Guide Section */}
      <div className="bg-white py-8 px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How SmartDispute.ai Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Start Your Journey</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Choose your dispute type (CAS, Landlord, Credit)</li>
                <li>Upload relevant documents and evidence</li>
                <li>Get AI-powered analysis of your case</li>
                <li>Receive customized legal documents</li>
              </ol>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Our Services</h3>
              <ul className="space-y-3">
                <li>✓ Document Analysis ($4.99)</li>
                <li>✓ Custom Legal Letters</li>
                <li>✓ Province-Specific Templates</li>
                <li>✓ AI-Powered Legal Guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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
          <Link href="/evidence-upload">
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
      
      {/* Dispute Assistant Section */}
      <div className="py-16 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dispute Assistant</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our guided process makes it easy to create powerful legal documents that get results.
          </p>
        </div>
        
        {/* Video explainer placeholder - can be replaced with actual video later */}
        <div className="max-w-3xl mx-auto mb-12 bg-gray-100 rounded-lg overflow-hidden relative">
          <div className="aspect-w-16 aspect-h-9">
            <div className="w-full h-full flex items-center justify-center p-4 text-center">
              <div>
                <Play className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                <p className="text-lg font-medium">Explainer Video Coming Soon</p>
                <p className="text-sm text-gray-500">Learn how SmartDispute.ai helps you fight back in just 30 seconds</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step by step process with numbers */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-primary/20 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Issue</h3>
                <p className="text-gray-600 text-center">
                  Select the dispute type that matches your situation from our specialized categories.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Answer Questions</h3>
                <p className="text-gray-600 text-center">
                  Our AI guides you through a few simple questions to customize your document.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Download Your Letter</h3>
                <p className="text-gray-600 text-center">
                  Get your professional-quality document ready to send to agencies and organizations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/evidence-upload">
              <Button size="lg" className="text-lg px-8">
                Start Your Dispute Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Testimonials / Real Stories Section */}
      <div className="py-16 bg-gray-50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how SmartDispute.ai has helped everyday Canadians stand up to systemic challenges.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-start mb-4">
                <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Sarah M., Toronto</h3>
                  <p className="text-sm text-gray-500">Landlord-Tenant Dispute</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="italic text-gray-700">
                  "After months of ignored maintenance requests and a broken heating system, my landlord finally took action when I sent the T6 application letter from SmartDispute. The step-by-step guidance gave me the confidence to stand up for my rights."
                </p>
              </div>
              <div className="flex items-center text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-start mb-4">
                <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Marcus T., Ottawa</h3>
                  <p className="text-sm text-gray-500">CAS Interaction</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="italic text-gray-700">
                  "When CAS showed up at our door, I was terrified. The documents I got from SmartDispute helped me understand my rights and communicate effectively. Instead of feeling powerless, I was prepared and confident during what could have been a traumatic process."
                </p>
              </div>
              <div className="flex items-center text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
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
        <Link href="/evidence-upload">
          <Button size="lg" className="text-lg px-8">
            Get Started Now
          </Button>
        </Link>
      </div>
      
      {/* How It Works Section - Enhanced for SEO */}
      <section className="py-12 border-t border-gray-200 mt-16" id="how-it-works">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How SmartDispute.ai Works</h2>
          <p className="text-gray-700 mb-8 text-center">
            Our AI-powered platform simplifies legal self-advocacy for Canadians dealing with tenant disputes, Children's Aid Society interactions, and more.
          </p>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Our Step-by-Step Process:</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li className="text-gray-700">
                <span className="font-medium">Describe your situation</span> — Whether it's a landlord-tenant issue or a CAS investigation, answer a few specific questions about your circumstances
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Upload supporting evidence</span> — Submit documents, communications, or photos that strengthen your case
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Review AI analysis</span> — Our system examines Canadian legal precedents and regulations applicable to your situation
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Generate tailored documents</span> — Receive professionally formatted, legally appropriate documents customized to your specific needs
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Follow guided submission</span> — Get clear instructions on how to file your documents with the right authorities
              </li>
            </ol>
            <p className="mt-6 text-gray-700">
              Our unique AI analysis helps identify the strongest arguments and most relevant legal precedents specific to your province, whether you're dealing with the Landlord and Tenant Board, Children's Aid Society, or other agencies.
            </p>
          </div>
        </div>
      </section>
      
      {/* Why Self-Advocate Section - Enhanced for SEO */}
      <section className="py-12 bg-gray-50" id="why-self-advocate">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Self-Advocate in Canada?</h2>
          <p className="text-gray-700 mb-8 text-center">
            SmartDispute.ai empowers marginalized Canadians to stand up for their rights — affordably, independently, and with dignity.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Financial Barriers to Justice</h3>
              <p className="text-gray-600">
                With legal aid limited and private attorneys costing $300+ per hour, self-advocacy tools make justice accessible regardless of income. Our affordable platform helps low-income Canadians assert their rights.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Power Imbalance in Housing</h3>
              <p className="text-gray-600">
                When facing corporate landlords with legal teams, tenants are at a severe disadvantage. Our tools help level the playing field by providing professional-quality documents and strategic guidance for Landlord and Tenant Board proceedings.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Navigation of Complex Systems</h3>
              <p className="text-gray-600">
                The Children's Aid Society and legal systems can be overwhelming. We provide educational resources to help you understand your rights, the process ahead, and how to effectively represent yourself and protect your family.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Canadian-Specific Resources</h3>
              <p className="text-gray-600">
                Our resources are tailored to Canadian law, with province-specific guidance for Ontario, British Columbia, Alberta, and other provinces. We focus on Canadian legislation, court procedures, and administrative tribunals.
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">The Reality of Self-Representation in Canada</h3>
            <p className="text-gray-700 mb-4">
              Over 50% of Canadians in family court and administrative tribunals represent themselves due to financial constraints. Without adequate support, many face significant disadvantages:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Limited understanding of legal procedures and requirements</li>
              <li>Difficulty articulating arguments in legally relevant terms</li>
              <li>Inadequate documentation and evidence presentation</li>
              <li>Overwhelm when facing experienced opposing counsel</li>
            </ul>
            <p className="mt-4 text-gray-700">
              SmartDispute.ai addresses these gaps by providing accessible, technology-driven tools that empower self-represented individuals to present their cases effectively and confidently.
            </p>
          </div>
        </div>
      </section>
      
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
<section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-red-700 text-center mb-6">
            Why I Created SmartDispute.ai
          </h2>
          <div className="relative aspect-video">
            {!videoError ? (
              <video 
                className="w-full rounded-lg shadow-lg"
                controls
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                style={{ display: isVideoLoaded ? 'block' : 'none' }}
              >
                <source src="/videos/SmartDispute_Intro_Teresa_Video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Video could not be loaded</p>
              </div>
            )}
          </div>
        </div>
      </section>
