import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  ChevronRight,
  FileText,
  ArrowDown,
  ArrowRight,
  Star,
  Shield,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ChildrenAidFunnel = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Information Received",
      description: "We'll send your free guide to your email shortly.",
    });
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white text-primary hover:bg-white">For Parents & Guardians</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Navigate Children's Aid Society Disputes with Confidence
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Get professional-quality legal documents and guidance without the cost of a lawyer. 
                We help you understand your rights and represent yourself effectively.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="#free-guide">
                    Get Free Guide <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/document-selection-hierarchical?category=children-aid">
                    See Legal Documents <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-yellow-400 opacity-20 rounded-full"></div>
              <div className="bg-white p-8 rounded-lg shadow-lg relative z-10">
                <h3 className="text-primary text-xl font-bold mb-4">Why Parents Choose SmartDispute.ai</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Professional legal documents without lawyer fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Step-by-step guidance for fighting CAS cases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Created by a mother who fought the system and won</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Plain language explanations of complex legal terms</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">You're Not Alone in This Fight</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Every year, thousands of Canadian families face CAS investigations. Many succeed in representing themselves.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">78%</div>
              <p className="text-gray-600">Of families have better outcomes when they understand their legal rights</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">$5,000+</div>
              <p className="text-gray-600">Average savings compared to hiring a lawyer for basic document preparation</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
              <p className="text-gray-600">Average user rating from parents who've used our document templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How SmartDispute.ai Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it easy to create professional legal documents and understand the CAS process
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
              Choose from our library of professionally drafted legal documents specific to Children's Aid Society disputes
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
              Our guided process asks straightforward questions to customize your documents to your specific situation
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
          <Button size="lg" className="mx-auto" asChild>
            <Link to="/document-selection-hierarchical?category=children-aid">
              Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Document Categories */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Essential Documents for CAS Cases</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access the specific legal forms you need, customized for your province
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Response to CAS Allegations</CardTitle>
                <CardDescription>Formally address and respond to allegations made against you</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Point-by-point rebuttal template</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Evidence organization framework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Legal standard references</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link to="/document-selection-hierarchical?category=children-aid&document=response">
                    View Template
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Temporary Care Agreement</CardTitle>
                <CardDescription>Establish clear boundaries and conditions for temporary arrangements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Detailed visitation schedules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Parental involvement provisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Termination conditions</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link to="/document-selection-hierarchical?category=children-aid&document=care-agreement">
                    View Template
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Service Plan Proposal</CardTitle>
                <CardDescription>Propose your own plan to address concerns raised by CAS</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Realistic goal framework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Progress measurement metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Support network documentation</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link to="/document-selection-hierarchical?category=children-aid&document=service-plan">
                    View Template
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Motion for Return of Child</CardTitle>
                <CardDescription>Formally request the return of your child to your care</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Court-ready formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Evidence presentation structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                    <span>Legal argument framework</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link to="/document-selection-hierarchical?category=children-aid&document=return-motion">
                    View Template
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/document-selection-hierarchical?category=children-aid">
                View All CAS Documents <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories from Parents Like You</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from real Canadians who successfully navigated CAS cases
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow border relative">
            <div className="absolute -top-4 left-8 bg-yellow-400 text-white p-2 rounded">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-gray-700 mb-6">
              "After 6 months of getting nowhere, I used SmartDispute's templates to create a formal response to allegations. The social worker's supervisor called me the next day, and within 3 weeks, my daughter was back home. The structure of the documents made all the difference."
            </blockquote>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                MM
              </div>
              <div className="ml-3">
                <div className="font-semibold">Maria M.</div>
                <div className="text-sm text-gray-500">Ontario</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow border relative">
            <div className="absolute -top-4 left-8 bg-yellow-400 text-white p-2 rounded">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-gray-700 mb-6">
              "I couldn't afford a lawyer after being laid off, and CAS was threatening to take my kids. The service plan template from SmartDispute helped me create a proper plan with clear goals. The case worker actually complimented me on how organized and thorough it was."
            </blockquote>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                JT
              </div>
              <div className="ml-3">
                <div className="font-semibold">James T.</div>
                <div className="text-sm text-gray-500">British Columbia</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow border relative">
            <div className="absolute -top-4 left-8 bg-yellow-400 text-white p-2 rounded">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-gray-700 mb-6">
              "As an Indigenous mother, I felt like the system was stacked against me. Using the motion templates from SmartDispute, I was able to challenge CAS's cultural competency and get my children placed with family instead of strangers while we worked through the case."
            </blockquote>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                SB
              </div>
              <div className="ml-3">
                <div className="font-semibold">Sarah B.</div>
                <div className="text-sm text-gray-500">Manitoba</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow border relative">
            <div className="absolute -top-4 left-8 bg-yellow-400 text-white p-2 rounded">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-gray-700 mb-6">
              "After a false report from a vindictive ex, CAS wouldn't listen to anything I said. Once I submitted the formal response document from SmartDispute, suddenly they started taking me seriously. The case was closed within weeks. These templates literally saved my family."
            </blockquote>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                DK
              </div>
              <div className="ml-3">
                <div className="font-semibold">Daniel K.</div>
                <div className="text-sm text-gray-500">Alberta</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Common questions about fighting Children's Aid Society cases
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="bg-white p-6 rounded-lg shadow-sm">
              <AccordionItem value="item-1">
                <AccordionTrigger>Do I need a lawyer for a CAS case?</AccordionTrigger>
                <AccordionContent>
                  While having legal representation can be beneficial, many parents successfully navigate CAS cases without lawyers. With proper documentation, organization, and understanding of your rights, you can effectively represent yourself. Our templates are designed to help you present your case professionally.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Can CAS take my children without warning?</AccordionTrigger>
                <AccordionContent>
                  CAS can only remove children without notice in emergency situations where they believe there is immediate danger. In most cases, they must follow legal procedures including obtaining court orders. Our documents help you understand and respond to these processes appropriately.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Are your documents legally valid?</AccordionTrigger>
                <AccordionContent>
                  Yes, our documents are designed based on provincial legal standards and regulations. They are regularly reviewed to ensure compliance with current laws. However, please note that SmartDispute.ai is not a law firm and does not provide legal advice - we provide document templates and self-help resources.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How quickly can I get my documents?</AccordionTrigger>
                <AccordionContent>
                  After completing our guided interview process, your documents are generated immediately and available for download. The time needed to complete the process depends on your case's complexity, but most users finish within 30-60 minutes per document.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How much does it cost to use SmartDispute.ai?</AccordionTrigger>
                <AccordionContent>
                  SmartDispute.ai offers flexible pricing options. You can purchase individual documents starting at $5.99 per form, or subscribe to our service at $50/month for standard users or $25/year for qualifying low-income users. Subscribers get unlimited document access and additional support resources.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>What if CAS refuses to accept my documents?</AccordionTrigger>
                <AccordionContent>
                  CAS must accept properly filed legal documents. If you encounter resistance, our resources include escalation procedures and templates for communicating with supervisors and oversight bodies. We also provide guidance on filing documents with courts when necessary.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Free Guide Section */}
      <div id="free-guide" className="py-20 container mx-auto px-4 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary text-white">FREE RESOURCE</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get Your Free Guide: "Parents' Rights When Dealing with CAS"
              </h2>
              <p className="text-gray-600 mb-6">
                Download our comprehensive guide to understand your rights and the proper steps to take when facing a Children's Aid Society investigation.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Legal rights during home visits and interviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">How to respond to allegations professionally</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Documentation checklist to strengthen your case</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Key phrases to use (and avoid) when talking to workers</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border">
              {currentStep === 1 ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Get Instant Access
                  </h3>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Situation (Optional)
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Briefly describe your situation so we can provide more relevant information"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Me The Free Guide
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. We'll never share your information.
                    You can unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your guide has been sent to your email. Please check your inbox (and spam folder) shortly.
                  </p>
                  <div className="space-y-4">
                    <Button className="w-full" asChild>
                      <Link to="/document-selection-hierarchical?category=children-aid">
                        Browse Legal Documents
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/faq">
                        View More Resources
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Take Control of Your CAS Case?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get started today with professional-quality legal documents designed specifically for Children's Aid Society disputes in Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/document-selection-hierarchical?category=children-aid">
                Get Started Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white hover:bg-white/10" asChild>
              <Link to="#free-guide">
                Download Free Guide
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with Trust Elements */}
      <div className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Trusted by Canadians Nationwide</h3>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="text-gray-700">256-bit Secure Encryption</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-primary mr-2" />
                <span className="text-gray-700">Same-Day Document Access</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-primary mr-2" />
                <span className="text-gray-700">Community Support</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="pt-8 text-center text-gray-600 text-sm">
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

export default ChildrenAidFunnel;