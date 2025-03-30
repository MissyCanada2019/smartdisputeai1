import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { LeadMagnetForm } from '@/components/marketing/LeadMagnetForm';
import { childrenAidTestimonials, TestimonialCarousel } from '@/components/marketing/TestimonialCarousel';
import { FunnelConversion, usePageViewTracker, FUNNEL_STEPS } from '@/components/marketing/FunnelTracker';
import { ExitIntentPopup } from '@/components/marketing/EmailCapturePopup';

const FUNNEL_NAME = 'children_aid_society';

export default function ChildrenAidFunnel() {
  // Track page view for this funnel
  usePageViewTracker(FUNNEL_NAME, 'children_aid_landing_page', FUNNEL_STEPS.AWARENESS);
  
  // Show exit intent popup
  useEffect(() => {
    // We can add any additional initialization logic here
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Exit Intent Popup */}
      <ExitIntentPopup
        title="Before you go..."
        description="Get our free guide on protecting your rights when dealing with Children's Aid Society cases."
        funnelName={FUNNEL_NAME}
        resource="cas_rights_guide"
        buttonText="Get Free Guide"
        successMessage="Your guide is on its way! Check your email inbox."
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-700 to-red-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Stand Up To The Children's Aid Society
              </h1>
              <p className="text-xl mb-6 text-white/90">
                Protect your rights and your family with our specialized legal document templates and AI assistance.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-white mr-2 mt-1 flex-shrink-0" />
                  <p>Ready-to-use legal documents tailored for CAS disputes</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-white mr-2 mt-1 flex-shrink-0" />
                  <p>Expert guidance on preparing for hearings and meetings</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-white mr-2 mt-1 flex-shrink-0" />
                  <p>Affordable alternatives to costly legal representation</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button size="lg" asChild className="bg-white text-red-900 hover:bg-white/90">
                  <Link href="/document-selection-hierarchical?category=children-aid">
                    View Documents
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/faq#children-aid">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Get Your Free Rights Guide</h2>
              <p className="mb-4">
                Download our comprehensive guide to understand your rights when dealing with Children's Aid Society.
              </p>
              <LeadMagnetForm
                title="Download Free Guide"
                funnelName={FUNNEL_NAME}
                resource="cas_rights_guide"
                source="landing_page_form"
                showNameFields
                buttonText="Send Me The Guide"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Problem & Solution Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The System Is Stacked Against Families</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Children's Aid Societies have significant power and resources, but you don't have to face them alone or unprepared.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">The Challenges You Face</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-red-800 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Overwhelming Power Imbalance</h3>
                    <p className="text-muted-foreground">CAS has lawyers, resources, and authority on their side while families often struggle alone.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-red-800 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Confusing Legal Procedures</h3>
                    <p className="text-muted-foreground">Complex legal processes that most people don't understand without expensive legal help.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3 mt-1">
                    <span className="text-red-800 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Limited Accountability</h3>
                    <p className="text-muted-foreground">CAS decisions can be difficult to challenge when you don't know your rights or proper procedures.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">How SmartDispute.ai Helps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ready-to-Use Legal Documents</h3>
                    <p className="text-muted-foreground">Professional-quality templates specifically designed for CAS cases, tailored to your situation.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Step-by-Step Guidance</h3>
                    <p className="text-muted-foreground">Clear instructions on filing documents, preparing for hearings, and understanding the process.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Affordable Support</h3>
                    <p className="text-muted-foreground">A fraction of the cost of hiring a lawyer, with AI assistance to help you every step of the way.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real families have successfully used our platform to navigate Children's Aid Society cases.
            </p>
          </div>
          
          <TestimonialCarousel 
            testimonials={childrenAidTestimonials}
            showControls
            showIndicators
            className="mb-8"
          />
        </div>
      </section>
      
      {/* Document Categories Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Essential Documents For Your Case</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our platform provides all the documents you need at each stage of your case.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Documents</CardTitle>
                <CardDescription>
                  Documents to file when you've been contacted by CAS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Initial Response Letters</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Meeting Preparation Forms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Rights Acknowledgment Forms</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/document-selection-hierarchical?category=children-aid&subcategory=response">
                    View Response Documents
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hearing Documents</CardTitle>
                <CardDescription>
                  Documents for court hearings and legal proceedings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Affidavits and Statements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Motion Documents</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Hearing Preparation Guides</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/document-selection-hierarchical?category=children-aid&subcategory=hearing">
                    View Hearing Documents
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Plan of Care</CardTitle>
                <CardDescription>
                  Documents to demonstrate parental capability and care
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Care Plan Templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Progress Documentation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>Resource Inventory Forms</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/document-selection-hierarchical?category=children-aid&subcategory=care-plan">
                    View Care Plan Documents
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <FunnelConversion
              funnelName={FUNNEL_NAME}
              conversionType="document_selection"
              value={0}
              metadata={{ resource: "document_view_children_aid" }}
            >
              <Button size="lg" className="bg-red-800 hover:bg-red-900" asChild>
                <Link href="/document-selection-hierarchical?category=children-aid">
                  Browse All Documents <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </FunnelConversion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-red-800 to-red-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Don't Fight This Battle Alone
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of Canadian families who have successfully navigated Children's Aid Society cases using our platform.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Button size="lg" className="bg-white text-red-900 hover:bg-white/90" asChild>
              <Link href="/signup">
                Create Free Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/pricing">
                View Pricing Plans
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* FAQs Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about using our platform for Children's Aid Society cases.
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Can SmartDispute.ai replace a lawyer?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  While our platform provides valuable legal documents and guidance, it doesn't replace legal advice from a licensed lawyer. However, many families successfully represent themselves using our platform, especially when they can't afford traditional legal representation. In complex cases, we recommend using our platform alongside professional legal counsel when possible.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How quickly can I access documents?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Documents are available instantly after purchase. You can preview document templates before buying, and once purchased, you can customize them with your information and download them immediately. For subscribers, all documents in your plan are available without additional charges.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Are the documents legally valid in my province?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Yes, our documents are designed to comply with legal requirements across Canadian provinces. When you select your province during document creation, the templates automatically adjust to incorporate province-specific requirements. We regularly update our templates to reflect changes in provincial regulations.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What if CAS has already taken my children?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Our platform includes documents specifically designed for reunification cases, including temporary care agreements, visitation requests, and progress documentation. While the process may be more complex in these situations, many families have successfully used our documents to work toward reunification. We recommend starting with our "Reunification Roadmap" document for guidance.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="link" asChild>
              <Link href="/faq#children-aid">
                View All FAQs <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-6">
            Ready to take the first step?
          </h2>
          <LeadMagnetForm
            title="Get Started with a Free Resource"
            description="Sign up to receive our comprehensive guide to Children's Aid Society cases"
            funnelName={FUNNEL_NAME}
            resource="cas_getting_started_guide"
            source="landing_page_bottom"
            buttonText="Send Me The Guide"
            showNameFields
            compact
            className="max-w-md mx-auto"
          />
        </div>
      </section>
    </div>
  );
}