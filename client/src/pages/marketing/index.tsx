import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailCapturePopup, ExitIntentPopup, DelayedPopup } from '@/components/marketing/EmailCapturePopup';
import { FunnelTracker, usePageViewTracker, FunnelConversion, FUNNEL_STEPS } from '@/components/marketing/FunnelTracker';
import { TestimonialCarousel, legalAdvocacyTestimonials } from '@/components/marketing/TestimonialCarousel';

const FUNNEL_NAME = 'main_website';

export default function MarketingHomePage() {
  const [showResourcePopup, setShowResourcePopup] = useState(false);
  const [resourceType, setResourceType] = useState<string>('');
  
  // Track page view
  usePageViewTracker(FUNNEL_NAME, 'home_page_view', FUNNEL_STEPS.AWARENESS);
  
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

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Empowering Canadians in Legal Self-Advocacy
              </h1>
              <p className="text-xl opacity-90">
                SmartDispute.ai Canada provides affordable tools to help you navigate complex legal systems and stand up for your rights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <FunnelConversion
                  funnelName={FUNNEL_NAME}
                  conversionType="cta_document_browse"
                  metadata={{ placement: 'hero' }}
                >
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/document-selection-hierarchical">
                      Browse Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </FunnelConversion>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  onClick={() => handleRequestResource('guide')}
                >
                  Get Free Guide
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md h-64 md:h-80 bg-white/10 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-5xl font-bold mb-2">4</div>
                    <div className="text-xl">Specialized Legal Focus Areas</div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/20 p-2 rounded">Children's Aid</div>
                      <div className="bg-white/20 p-2 rounded">Landlord-Tenant</div>
                      <div className="bg-white/20 p-2 rounded">Equifax Disputes</div>
                      <div className="bg-white/20 p-2 rounded">Transition Services</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SmartDispute.ai Helps You</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides everything you need to effectively represent yourself and navigate complex legal systems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>Professional legal documents made easy</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access province-specific templates designed by legal experts to help you file effective disputes and claims.
                </p>
              </CardContent>
              <CardFooter>
                <FunnelConversion
                  funnelName={FUNNEL_NAME}
                  conversionType="feature_documents"
                >
                  <Button variant="outline" asChild>
                    <Link href="/document-selection-hierarchical">
                      View Templates
                    </Link>
                  </Button>
                </FunnelConversion>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI Assistance</CardTitle>
                <CardDescription>Guided support every step of the way</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI chatbot helps you understand your rights, choose the right documents, and complete them correctly.
                </p>
              </CardContent>
              <CardFooter>
                <FunnelConversion
                  funnelName={FUNNEL_NAME}
                  conversionType="feature_chatbot"
                >
                  <Button variant="outline" asChild>
                    <Link href="/chatbot">
                      Try Chatbot
                    </Link>
                  </Button>
                </FunnelConversion>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>Connect with others facing similar challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join our community to share experiences, get advice, and find emotional support from people who understand.
                </p>
              </CardContent>
              <CardFooter>
                <FunnelConversion
                  funnelName={FUNNEL_NAME}
                  conversionType="feature_community"
                >
                  <Button variant="outline" asChild>
                    <Link href="/community">
                      Join Community
                    </Link>
                  </Button>
                </FunnelConversion>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Read how SmartDispute.ai has helped Canadians effectively advocate for themselves.
            </p>
          </div>
          
          <TestimonialCarousel 
            testimonials={legalAdvocacyTestimonials}
            showControls={true}
            showIndicators={true}
            className="mb-8"
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
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-800 to-red-900 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Stand Up For Your Rights?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of Canadians who have successfully advocated for themselves using SmartDispute.ai
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
              View Pricing
            </Button>
          </div>
        </div>
      </section>
      
      {/* Resource Request Popup */}
      <EmailCapturePopup
        title={`Get Access to ${resourceType === 'guide' ? 'Free Self-Advocacy Guide' : 
                resourceType === 'success-stories' ? 'Success Stories Collection' : 
                'Pricing Information'}`}
        description="Enter your email to receive immediate access to this resource."
        funnelName={FUNNEL_NAME}
        resource={resourceType}
        buttonText="Send Me The Resource"
        successMessage="Thank you! We've sent the resource to your email."
        open={showResourcePopup}
        onOpenChange={setShowResourcePopup}
        onSuccess={() => {
          // Could add additional tracking or actions here
        }}
      />
      
      {/* Exit Intent Popup */}
      <ExitIntentPopup
        title="Wait! Don't Miss This Resource"
        description="Get our free guide to effectively advocating for yourself against powerful institutions."
        funnelName={FUNNEL_NAME}
        resource="exit_intent_guide"
        buttonText="Get Free Guide"
      />
      
      {/* Delayed Popup */}
      <DelayedPopup
        title="Ready to Fight Back?"
        description="Join our newsletter for latest legal self-advocacy tips and resources."
        funnelName={FUNNEL_NAME}
        resource="newsletter_subscription"
        buttonText="Subscribe"
        delaySeconds={30}
      />
    </div>
  );
}