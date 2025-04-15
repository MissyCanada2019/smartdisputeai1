import { Link } from 'wouter';
import { ArrowRight, FileText, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageViewTracker } from '@/components/marketing/FunnelTracker';

export default function MarketingIndex() {
  // Track page view
  usePageViewTracker('marketing_index', 'page_view_marketing');
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-700 to-red-900 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Self-Advocacy Tools for All Canadians
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-10">
            SmartDispute.ai provides specialized resources for each of your legal challenges. Choose your situation below to find tailored assistance.
          </p>
        </div>
      </section>
      
      {/* Funnel Selection Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Choose Your Challenge
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="transition hover:shadow-lg">
              <CardHeader className="bg-red-50 rounded-t-lg">
                <CardTitle className="text-red-800">Children's Aid Society Disputes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Fight false allegations, understand your rights, and advocate effectively against CAS/CPS with our specialized tools.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-sm">Response to investigations</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-sm">Documentation of violations</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-sm">Parents' rights guides</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/marketing/children-aid">
                    View Resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="transition hover:shadow-lg">
              <CardHeader className="bg-blue-50 rounded-t-lg">
                <CardTitle className="text-blue-800">Landlord-Tenant Issues</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Address rental disputes, wrongful evictions, and repair issues with documents customized for your province.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Repair and maintenance requests</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Eviction dispute documents</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Tenant rights guides</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/document-selection-hierarchical?category=landlord-tenant">
                    View Resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="transition hover:shadow-lg">
              <CardHeader className="bg-green-50 rounded-t-lg">
                <CardTitle className="text-green-800">Equifax Disputes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Challenge credit report errors, fix inaccuracies, and restore your financial reputation with professional templates.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Credit report error corrections</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Identity theft documentation</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Follow-up response templates</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/document-selection-hierarchical?category=equifax">
                    View Resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="transition hover:shadow-lg">
              <CardHeader className="bg-purple-50 rounded-t-lg">
                <CardTitle className="text-purple-800">Transition Services</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Navigate social service challenges, appeal benefit denials, and secure the support you need during life transitions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm">Benefit appeal documents</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm">Service access requests</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm">Disability accommodation letters</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/document-selection-hierarchical?category=transition">
                    View Resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Client Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
            Read how SmartDispute.ai has helped Canadians navigate complex legal challenges without expensive legal representation
          </p>
          
          <TestimonialCarousel 
            testimonials={legalAdvocacyTestimonials}
            showControls={true}
            showIndicators={true}
            className="mb-10"
          />
          
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/community">
                Join Our Community
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Stand Up For Your Rights?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Create a free account to access our document templates and resources.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Create Free Account
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/faq">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}