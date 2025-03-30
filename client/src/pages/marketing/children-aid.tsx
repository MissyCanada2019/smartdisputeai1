import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle, FileText, Shield, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailCapturePopup } from '@/components/marketing/EmailCapturePopup';
import { FunnelTracker, usePageViewTracker, FunnelConversion, FUNNEL_STEPS, trackFunnelEvent } from '@/components/marketing/FunnelTracker';
import { TestimonialCarousel } from '@/components/marketing/TestimonialCarousel';

const FUNNEL_NAME = 'children_aid_campaign';

export default function ChildrenAidLandingPage() {
  const [showResourcePopup, setShowResourcePopup] = useState(false);
  const [resourceType, setResourceType] = useState<string>('guide');
  
  // Track page view
  usePageViewTracker(FUNNEL_NAME, 'children_aid_page_view', FUNNEL_STEPS.AWARENESS);
  
  const handleRequestResource = (type: string) => {
    setResourceType(type);
    setShowResourcePopup(true);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-700 to-red-900 text-white">
        <div className="container mx-auto max-w-5xl">
          <FunnelTracker 
            funnelName={FUNNEL_NAME}
            eventName="hero_view"
            stepName="awareness"
            stepNumber={1}
          />

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Stand Up To Children's Aid Society
              </h1>
              <p className="text-xl opacity-90">
                Fight unfair treatment, false allegations, and protect your family with our legal self-help tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <FunnelConversion
                  funnelName={FUNNEL_NAME}
                  conversionType="cta_document_browse"
                  metadata={{ placement: 'hero' }}
                >
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/document-selection-hierarchical?category=childrens-aid">
                      Get Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </FunnelConversion>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  onClick={() => handleRequestResource('guide')}
                >
                  Get Free Parents' Rights Guide
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <Card className="w-full max-w-md bg-white/10 backdrop-blur text-white border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">How We Can Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-white mt-0.5 flex-shrink-0" />
                      <span>Response to CAS/CPS Investigations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-white mt-0.5 flex-shrink-0" />
                      <span>Wrongful Allegations Documentation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-white mt-0.5 flex-shrink-0" />
                      <span>Temporary Care Agreement Review</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-white mt-0.5 flex-shrink-0" />
                      <span>Case Review and Appeal Documents</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-white mt-0.5 flex-shrink-0" />
                      <span>Family Reunification Planning</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Parents Need Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The system is overwhelming for many families. Here's why proper documentation and advocacy tools are essential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-700 text-2xl font-bold">90%</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Unrepresented</h3>
              <p className="text-gray-600">Of parents facing CAS investigations cannot afford legal representation</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-700 text-2xl font-bold">73%</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Reunification</h3>
              <p className="text-gray-600">Higher success rate when parents properly document and advocate for themselves</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-700 text-2xl font-bold">42%</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Investigations</h3>
              <p className="text-gray-600">Of cases could be resolved faster with proper documentation from the start</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-700 text-2xl font-bold">65%</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Indigenous</h3>
              <p className="text-gray-600">Overrepresentation of Indigenous children in the child welfare system</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SmartDispute.ai Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide you with the tools to respond effectively to Children's Aid Society interventions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Select Documents</h3>
              <p className="text-gray-600">
                Choose from our library of legal documents specifically designed for CAS/CPS cases in your province.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Customize Templates</h3>
              <p className="text-gray-600">
                Our AI helps you fill in the details of your specific situation, creating legally sound documents.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Submit & Follow Up</h3>
              <p className="text-gray-600">
                Download your completed documents, submit them to the agency, and track your progress with our guidance.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <FunnelConversion
              funnelName={FUNNEL_NAME}
              conversionType="mid_page_signup"
            >
              <Button size="lg" asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </FunnelConversion>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from parents who successfully advocated for themselves using our tools
            </p>
          </div>
          
          <TestimonialCarousel 
            testimonials={[
              {
                id: 'cas-testimonial1',
                quote: "When Child Services threatened to take my children based on false allegations, I felt helpless. SmartDispute.ai guided me through filing the proper responses and helped me navigate the system to keep my family together.",
                name: "Michael T.",
                title: "Single Parent",
                category: "Children's Aid Society",
                location: "British Columbia",
                rating: 5
              },
              {
                id: 'cas-testimonial2',
                quote: "When my children were taken without proper investigation, I was devastated. The platform helped me file the necessary documents to request a review, and ultimately, I was reunited with my children.",
                name: "David C.",
                title: "Family Advocate",
                category: "Children's Aid Society",
                location: "Nova Scotia",
                rating: 5
              },
              {
                id: 'cas-testimonial3',
                quote: "As an Indigenous mother, I felt the system was biased against me from the start. Using SmartDispute.ai, I was able to document the cultural considerations that were being ignored and successfully advocate for culturally appropriate services.",
                name: "Lisa M.",
                title: "Community Organizer",
                category: "Children's Aid Society",
                location: "Manitoba",
                rating: 5
              }
            ]}
            showControls={true}
            showIndicators={true}
            className="mb-8"
            testimonialCategory="Children's Aid Society"
          />
          
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => handleRequestResource('success-stories')}
            >
              Read More Success Stories
            </Button>
          </div>
        </div>
      </section>
      
      {/* Resources Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Resources for Parents</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Helpful information to understand your rights and the child welfare system
            </p>
          </div>
          
          <Tabs defaultValue="rights" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="rights">Know Your Rights</TabsTrigger>
              <TabsTrigger value="steps">First Steps</TabsTrigger>
              <TabsTrigger value="faq">Common Questions</TabsTrigger>
            </TabsList>
            <TabsContent value="rights" className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4">Parental Rights During CAS Investigations</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-red-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Right to know allegations</span>
                    <p className="text-gray-600 mt-1">You have the right to be informed about the specific concerns that have prompted CAS involvement.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-red-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Right to legal representation</span>
                    <p className="text-gray-600 mt-1">You have the right to consult with a lawyer at any stage of the CAS process.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 text-red-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Right to participate in planning</span>
                    <p className="text-gray-600 mt-1">You have the right to be included in creating service plans and decisions about your children.</p>
                  </div>
                </li>
              </ul>
              <Button 
                className="mt-6"
                onClick={() => handleRequestResource('rights-guide')}
              >
                Download Full Rights Guide
              </Button>
            </TabsContent>
            <TabsContent value="steps" className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4">First Steps When CAS Contacts You</h3>
              <ol className="space-y-4">
                <li className="flex">
                  <span className="font-bold text-red-700 mr-3">1.</span>
                  <div>
                    <span className="font-medium">Remain calm and document everything</span>
                    <p className="text-gray-600 mt-1">Record the name of the worker, date, time, and details of what was discussed.</p>
                  </div>
                </li>
                <li className="flex">
                  <span className="font-bold text-red-700 mr-3">2.</span>
                  <div>
                    <span className="font-medium">Ask for specific allegations in writing</span>
                    <p className="text-gray-600 mt-1">Request written documentation of the concerns that prompted the investigation.</p>
                  </div>
                </li>
                <li className="flex">
                  <span className="font-bold text-red-700 mr-3">3.</span>
                  <div>
                    <span className="font-medium">Create a response plan</span>
                    <p className="text-gray-600 mt-1">Use our documents to formally respond to allegations and document your parenting capability.</p>
                  </div>
                </li>
              </ol>
              <Button 
                className="mt-6"
                onClick={() => handleRequestResource('first-steps-guide')}
              >
                Get First Steps Checklist
              </Button>
            </TabsContent>
            <TabsContent value="faq" className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Can CAS take my children without warning?</h4>
                  <p className="text-gray-600 mt-1">CAS can only remove children without a court order if they believe there is immediate danger. In most cases, they must seek a court order.</p>
                </div>
                <div>
                  <h4 className="font-medium">Do I have to let CAS workers into my home?</h4>
                  <p className="text-gray-600 mt-1">You are not legally required to let CAS workers into your home unless they have a court order or warrant.</p>
                </div>
                <div>
                  <h4 className="font-medium">How can I challenge a CAS assessment?</h4>
                  <p className="text-gray-600 mt-1">You can request an internal review, file a formal complaint, or challenge decisions in court. Our documents can help you with each of these processes.</p>
                </div>
              </div>
              <Button 
                className="mt-6"
                onClick={() => handleRequestResource('faq-guide')}
              >
                Download Complete FAQ Guide
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-800 to-red-900 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Family?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of Canadian parents who have successfully advocated for themselves using SmartDispute.ai
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <FunnelConversion
              funnelName={FUNNEL_NAME}
              conversionType="footer_cta_signup"
            >
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Create Free Account
                </Link>
              </Button>
            </FunnelConversion>
            
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => handleRequestResource('pricing')}
            >
              View Pricing Plans
            </Button>
          </div>
        </div>
      </section>
      
      {/* Resource Request Popup */}
      <EmailCapturePopup
        title={`Get Access to ${
          resourceType === 'guide' ? 'Parents\' Rights Guide' : 
          resourceType === 'rights-guide' ? 'Complete Parents\' Rights Guide' :
          resourceType === 'first-steps-guide' ? 'First Steps Checklist' :
          resourceType === 'faq-guide' ? 'CAS FAQ Guide' :
          resourceType === 'success-stories' ? 'Success Stories Collection' : 
          'Pricing Information'
        }`}
        description="Enter your email to receive immediate access to this resource."
        funnelName={FUNNEL_NAME}
        resource={resourceType}
        buttonText="Send Me The Resource"
        successMessage="Thank you! We've sent the resource to your email."
        open={showResourcePopup}
        onOpenChange={setShowResourcePopup}
        onSuccess={() => {
          // Track resource download conversion
          trackFunnelEvent(
            FUNNEL_NAME,
            `resource_requested_${resourceType}`,
            { resource: resourceType },
            FUNNEL_STEPS.CONSIDERATION
          );
        }}
      />
    </div>
  );
}