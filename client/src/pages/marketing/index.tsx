import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Users, Scale, FileText, ArrowRight, Shield, Heart, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import EmailCapturePopup from "@/components/marketing/EmailCapturePopup";
import FunnelTracker, { FUNNEL_STEPS } from "@/components/marketing/FunnelTracker";
import TestimonialCarousel, { Testimonial } from "@/components/marketing/TestimonialCarousel";

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "SmartDispute.ai helped me understand my rights and file the correct documents with Children's Aid. I won my case and got my children back.",
    author: "Sarah B.",
    location: "Manitoba",
    rating: 5,
    avatarFallback: "SB",
  },
  {
    id: "2",
    quote: "After months of fighting with Equifax over errors on my report, I used SmartDispute's templates and got results in just 3 weeks. I couldn't believe how simple it was.",
    author: "Michael T.",
    location: "Alberta",
    rating: 5,
    avatarFallback: "MT",
  },
  {
    id: "3",
    quote: "As a low-income single parent, I couldn't afford a lawyer when my landlord tried to evict me illegally. SmartDispute gave me the tools to fight back and win.",
    author: "Jessica P.",
    location: "Ontario",
    rating: 5,
    avatarFallback: "JP",
  },
];

const MarketingIndex = () => {
  return (
    <div className="min-h-screen">
      {/* Track page view in marketing funnel */}
      <FunnelTracker 
        funnelName="main_website"
        currentStep={FUNNEL_STEPS.VISIT}
        stepNumber={1}
      />
      
      {/* Email Capture Popup */}
      <EmailCapturePopup 
        title="Get Your Free Legal Rights Guide"
        description="Download our comprehensive guide to understanding your legal rights in Canada."
        resourceName="Legal Rights Guide"
        showPopupTrigger="timer"
        timing={10000}
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Self-Advocacy Made Simple for Canadians
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Expert legal documents & guidance for disputes with government agencies without the cost of a lawyer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/document-selection-hierarchical">
                    Browse Documents <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="#dispute-categories">
                    Explore Dispute Categories
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-yellow-400 opacity-20 rounded-full"></div>
              <div className="bg-white p-8 rounded-lg shadow-lg relative z-10">
                <h3 className="text-primary text-xl font-bold mb-4">Why Canadians Choose Us</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Professional legal documents without lawyer fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Created by advocates who fought the system and won</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Province-specific forms and guidance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Plain language explanations of complex legal terms</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <p className="text-gray-600">Documents Generated</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">78%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">13</div>
              <p className="text-gray-600">Canadian Provinces Covered</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$2M+</div>
              <p className="text-gray-600">Saved in Legal Fees</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dispute Categories Section */}
      <div id="dispute-categories" className="py-20 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Battle</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in helping Canadians navigate these specific dispute categories
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Children's Aid Society
                </CardTitle>
                <CardDescription>
                  Navigate CAS investigations & proceedings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Professional documents to respond to allegations, file motions, and protect your parental rights.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/marketing/funnels/children-aid">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Landlord-Tenant Issues
                </CardTitle>
                <CardDescription>
                  Fight unfair landlord practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Templates for addressing illegal evictions, maintenance issues, and tenant rights violations.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/document-selection-hierarchical?category=landlord-tenant">
                    Browse Documents <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Equifax Disputes
                </CardTitle>
                <CardDescription>
                  Correct credit report errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Tools to identify and dispute inaccuracies on your credit report and demand corrections.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/document-selection-hierarchical?category=equifax">
                    Browse Documents <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Transition Services
                </CardTitle>
                <CardDescription>
                  Support for life transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Assistance for those navigating housing, healthcare, employment, and government benefits.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/document-selection-hierarchical?category=transition">
                    Browse Documents <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How SmartDispute.ai Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it easy to create professional legal documents in just a few steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Select Your Documents</h3>
            <p className="text-gray-600">
              Choose from our library of professionally drafted legal documents for your specific situation
            </p>
          </div>
          
          <div className="text-center relative">
            <div className="hidden md:block absolute left-0 top-8 w-full h-1 bg-primary/20">
              <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Answer Simple Questions</h3>
            <p className="text-gray-600">
              Our guided process asks straightforward questions to customize your documents
            </p>
          </div>
          
          <div className="text-center relative">
            <div className="hidden md:block absolute left-0 top-8 w-full h-1 bg-primary/20">
              <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Download & File</h3>
            <p className="text-gray-600">
              Get your completed documents immediately, with clear filing instructions for your province
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Button size="lg" asChild>
            <Link to="/document-selection-hierarchical">
              Browse Documents Now
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Affordable Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the option that works best for your needs and budget
            </p>
          </div>
          
          <Tabs defaultValue="standard" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
              <TabsTrigger value="low-income">Low-Income Program</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Single Document</CardTitle>
                    <CardDescription>Pay only for what you need</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$5.99</span>
                      <span className="text-gray-500 ml-1">per document</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Access to one document template</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Customized for your situation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Filing instructions included</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/document-selection-hierarchical">
                        Browse Documents
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow relative border-primary">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                  <CardHeader>
                    <CardTitle>Monthly Subscription</CardTitle>
                    <CardDescription>Ongoing support for your case</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$50</span>
                      <span className="text-gray-500 ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Unlimited document access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>AI document assistant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Document storage & management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Access to community support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link to="/register?plan=monthly">
                        Subscribe Now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>Annual Subscription</CardTitle>
                    <CardDescription>Best value for ongoing cases</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$1000</span>
                      <span className="text-gray-500 ml-1">/year</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>All monthly features included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Priority document review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Email notifications for deadlines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                        <span>Save over $500 vs. monthly plan</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/register?plan=annual">
                        Subscribe Annually
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="low-income">
              <Card className="max-w-lg mx-auto hover:shadow-lg transition-shadow border-primary">
                <CardHeader className="text-center">
                  <CardTitle>Low-Income Assistance Plan</CardTitle>
                  <CardDescription>Affordable access for qualified low-income Canadians</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$25</span>
                    <span className="text-gray-500 ml-1">/year</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                      <span>$0.99 per document (reduced rate)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                      <span>Access to all document templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                      <span>Full access to community support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                      <span>Qualification verification required</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Available to Canadians who qualify for low-income assistance.
                      Income verification required during registration.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to="/register?plan=low-income">
                      Apply Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from real Canadians who used our platform
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <TestimonialCarousel 
            testimonials={testimonials}
            variant="featured"
          />
        </div>
      </div>
      
      {/* Founder Story Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Founder's Story</h2>
              <p className="text-gray-700 mb-4">
                SmartDispute.ai was founded by Teresa, a Métis mother who found herself fighting against unsafe housing, health threats, and systemic neglect without legal representation.
              </p>
              <p className="text-gray-700 mb-4">
                After successfully navigating complex legal battles on her own, Teresa created this platform to help other marginalized Canadians access the tools they need to advocate for themselves.
              </p>
              <p className="text-gray-700 mb-6">
                Today, SmartDispute.ai helps thousands of Canadians stand up for their rights and navigate a system that often favors those with wealth over those with legitimate claims.
              </p>
              <Button variant="outline" asChild>
                <Link to="/about">
                  Read Full Story
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-4 shadow-lg rounded-lg">
                <blockquote className="italic text-gray-700 mb-4">
                  "I created SmartDispute because I believe everyone deserves access to justice, regardless of their income or background. These tools represent what I wish I had during my own legal battles."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                    TM
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">Teresa M.</div>
                    <div className="text-sm text-gray-500">Founder, SmartDispute.ai</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Take Control of Your Legal Dispute?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get started today with professional-quality legal documents designed specifically for Canadian legal disputes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/document-selection-hierarchical">
                Browse Documents
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white hover:bg-white/10" asChild>
              <Link to="/register">
                Create Free Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Trust Elements */}
      <div className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 items-center text-center">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <span className="text-gray-700">Data Security</span>
            </div>
            <div className="flex items-center">
              <Check className="h-6 w-6 text-primary mr-2" />
              <span className="text-gray-700">Expert-Reviewed Templates</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary mr-2" />
              <span className="text-gray-700">Community Support</span>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-4">
              &copy; {new Date().getFullYear()} SmartDispute.ai Canada. All rights reserved.
            </p>
            <p className="text-xs max-w-3xl mx-auto">
              Disclaimer: SmartDispute.ai is not a law firm and does not provide legal advice. 
              We provide self-help services at your specific direction. We cannot select forms for you or tell you how to respond to legal questions.
              Please consult with a lawyer if you need legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingIndex;