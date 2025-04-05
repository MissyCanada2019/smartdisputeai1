import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Scale, 
  Building2, 
  HandHeartIcon, 
  Users, 
  Check, 
  ShieldCheck, 
  FileText, 
  HeartHandshake,
  ArrowRight
} from "lucide-react";

export default function ForAgencies() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-blue-900 inline-block text-transparent bg-clip-text">
            SmartDispute.ai for Public Agencies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partnering with legal aid organizations, community services, and government agencies to improve access to justice for all Canadians.
          </p>
        </div>

        {/* Main value proposition */}
        <div className="bg-blue-50 rounded-lg p-8 shadow-md border border-blue-100">
          <div className="md:flex items-center gap-8">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Bridging the Justice Gap Together</h2>
              <p className="text-gray-700 text-lg mb-6">
                SmartDispute.ai offers scalable, cost-effective solutions for agencies and organizations committed to improving access to justice for underserved communities across Canada.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Reduce administrative burden with intelligent document automation",
                  "Help more clients with existing resources through AI-powered tools",
                  "Improve client outcomes with evidence-based case assessments",
                  "Support self-represented litigants with guided pathways"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center">
                <Scale className="h-20 w-20 text-blue-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Who we serve */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Who We Serve</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-blue-700" />
                </div>
                <CardTitle>Legal Aid Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Extend your reach and maximize limited resources with white-labeled self-help tools for clients with routine legal needs.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <HandHeartIcon className="h-6 w-6 text-blue-700" />
                </div>
                <CardTitle>Community Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Empower your frontline workers with tools to help clients navigate common legal issues without specialized legal training.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
                <CardTitle>Government Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Improve citizen access to your services with user-friendly interface and simplified form generation that reduces errors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Key benefits section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">Why Partner With SmartDispute.ai</h2>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Cost Reduction</h3>
                <p className="text-gray-600">
                  Our solution costs a fraction of traditional legal service delivery, allowing you to serve more clients without increasing budgets.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Improved Accessibility</h3>
                <p className="text-gray-600">
                  Designed with inclusivity at its core, our platform is WCAG compliant and available 24/7 in multiple languages.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Higher Completion Rates</h3>
                <p className="text-gray-600">
                  User-friendly, step-by-step guidance results in higher form completion rates and fewer errors than traditional methods.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HeartHandshake className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Personalized Solutions</h3>
                <p className="text-gray-600">
                  We work with your agency to customize our platform to your specific needs, processes and the communities you serve.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership models */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Partnership Models</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2">White-Label Solution</h3>
              <p className="text-white/90 mb-4">
                Deploy our platform under your organization's branding for a seamless client experience.
              </p>
              <ul className="space-y-2">
                {[
                  "Custom branding and URL",
                  "Tailored to your processes",
                  "Dedicated support",
                  "Usage analytics dashboard"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2">Referral Program</h3>
              <p className="text-white/90 mb-4">
                Offer special rates to your clients while maintaining focus on your core services.
              </p>
              <ul className="space-y-2">
                {[
                  "Discounted client access",
                  "Simplified referral process",
                  "Co-branded materials",
                  "Client progress tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2">Integrated Solution</h3>
              <p className="text-white/90 mb-4">
                Seamlessly integrate our tools into your existing systems and workflows.
              </p>
              <ul className="space-y-2">
                {[
                  "API integration",
                  "Single sign-on",
                  "Custom data workflows",
                  "Secure document sharing"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Data security section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <div className="md:flex items-start gap-8">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-12 w-12 text-blue-700" />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Data Security & Privacy</h2>
              <p className="text-gray-700 mb-4">
                We understand that your agency is entrusted with sensitive client information. Our platform is built from the ground up with security and privacy as foundational principles:
              </p>
              <ul className="space-y-3">
                {[
                  "All data is encrypted in transit and at rest using industry-standard encryption",
                  "Hosted in Canadian data centers to meet data sovereignty requirements",
                  "Regular security audits and penetration testing",
                  "Comprehensive access controls and audit logging",
                  "PIPEDA compliant with detailed data processing agreements",
                  "Transparent privacy policies with no selling or sharing of user data"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-blue-50 rounded-lg p-10 border border-blue-100 shadow-md">
          <h2 className="text-3xl font-bold mb-4">Let's Improve Access to Justice Together</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Schedule a consultation to discuss how SmartDispute.ai can support your organization's mission to provide accessible legal services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-700 hover:bg-blue-800">
              <a href="/contact?agency_inquiry=true">Schedule a Consultation</a>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-blue-700 text-blue-700 hover:bg-blue-50">
              <a href="/contact">
                Download Agency Brief
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}