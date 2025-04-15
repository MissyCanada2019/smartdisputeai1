import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

export default function FAQ() {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using SmartDispute.ai Canada and navigating the legal self-advocacy process.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="legal">Legal Help</TabsTrigger>
            </TabsList>
            
            {/* General Questions */}
            <TabsContent value="general" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-smartdispute">
                  <AccordionTrigger className="text-left">
                    What is SmartDispute.ai Canada?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      SmartDispute.ai Canada is a platform designed to help marginalized Canadians with legal self-advocacy. 
                      It was founded by Teresa, a Métis mother who personally fought against systemic injustices without legal representation.
                    </p>
                    <p>
                      Our platform provides pre-filled legal documents and emails for filing disputes against government agencies and 
                      organizations, focusing on specific dispute categories such as Children's Aid Societies, Landlord-Tenant issues, 
                      Equifax disputes, and Transition services.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="how-it-works">
                  <AccordionTrigger className="text-left">
                    How does the platform work?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      SmartDispute.ai Canada works in a few simple steps:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Select the type of dispute you're facing (CAS, Landlord-Tenant, etc.)</li>
                      <li>Choose the specific document template that matches your situation</li>
                      <li>Fill out the required information in our guided form</li>
                      <li>Review and customize your document as needed</li>
                      <li>Pay for the document (one-time fee or through subscription)</li>
                      <li>Download, print, and use your professional legal document</li>
                    </ol>
                    <p className="mt-4">
                      Our AI assistant is available throughout the process to help guide you and answer questions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="cost">
                  <AccordionTrigger className="text-left">
                    How much does it cost?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      We offer flexible pricing options to make legal help accessible to everyone:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Standard Plan:</strong> $50/month, $1000/year, or $5.99 per individual form</li>
                      <li><strong>Low-Income Plan:</strong> $25/year or $0.99 per form (income verification required)</li>
                    </ul>
                    <p className="mt-4">
                      Our pricing is designed to be a fraction of the cost of hiring a lawyer while still providing high-quality legal documents.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="legal-advice">
                  <AccordionTrigger className="text-left">
                    Is this legal advice?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      <strong>No, SmartDispute.ai Canada does not provide legal advice.</strong> We are not a law firm, and our platform 
                      is not a substitute for an attorney or law firm.
                    </p>
                    <p className="mb-4">
                      We provide document templates and self-advocacy tools that help you navigate legal processes. Our platform 
                      empowers you with resources to represent yourself, but we always recommend consulting with a qualified legal 
                      professional for specific legal advice whenever possible.
                    </p>
                    <p>
                      For serious legal matters or complex situations, we encourage seeking professional legal counsel.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            {/* Document Questions */}
            <TabsContent value="documents" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="document-types">
                  <AccordionTrigger className="text-left">
                    What types of documents are available?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      We offer documents in four main categories:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Children's Aid Societies:</strong> Response letters, record correction requests, school visit responses, court preparation documents</li>
                      <li><strong>Landlord-Tenant:</strong> Maintenance requests, illegal rent increase disputes, eviction responses</li>
                      <li><strong>Equifax:</strong> Credit report disputes, information correction requests</li>
                      <li><strong>Transition Services:</strong> Service complaints, accommodation requests, appeal letters</li>
                    </ul>
                    <p className="mt-4">
                      Each category contains multiple document templates tailored to specific situations and provinces.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="document-customization">
                  <AccordionTrigger className="text-left">
                    Can I customize the documents?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Yes, all documents can be customized to fit your specific situation. Our templates include:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Fields for your personal information</li>
                      <li>Sections to enter specific details about your case</li>
                      <li>Options to add or remove paragraphs as needed</li>
                      <li>Ability to attach supporting documentation</li>
                    </ul>
                    <p className="mt-4">
                      After completing the guided form, you'll have a chance to review the document and make additional edits before finalizing.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="document-provinces">
                  <AccordionTrigger className="text-left">
                    Are documents specific to my province?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Yes, whenever applicable, our documents are province-specific. Laws and regulations vary across Canada, and our 
                      templates reflect these differences.
                    </p>
                    <p className="mb-4">
                      When selecting a document, you'll be able to choose your province to ensure you get the correct template with:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Proper references to provincial laws and regulations</li>
                      <li>Correct agency names and contact information</li>
                      <li>Appropriate legal terminology for your jurisdiction</li>
                      <li>Correct citation of provincial statutes and legal standards</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="document-storage">
                  <AccordionTrigger className="text-left">
                    How do I access my documents after purchase?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      All your documents are securely stored in your account and can be accessed at any time through the Document Management section.
                    </p>
                    <p className="mb-4">
                      With your documents, you can:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Download them as PDFs for printing or emailing</li>
                      <li>Organize them into folders for easy management</li>
                      <li>Make additional edits if needed</li>
                      <li>Access your document history</li>
                      <li>Share them securely via email</li>
                    </ul>
                    <p className="mt-4">
                      Documents are stored securely and encrypted for your privacy.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            {/* Account Questions */}
            <TabsContent value="accounts" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="create-account">
                  <AccordionTrigger className="text-left">
                    How do I create an account?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Creating an account is simple and takes just a few minutes:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Click "Sign Up" in the top right corner of the homepage</li>
                      <li>Enter your email address and create a password</li>
                      <li>Verify your email address through the confirmation link</li>
                      <li>Complete your profile with basic information</li>
                      <li>You're ready to start using SmartDispute.ai Canada!</li>
                    </ol>
                    <p className="mt-4">
                      All your information is kept private and secure. We never share your personal details with third parties.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="subscription-management">
                  <AccordionTrigger className="text-left">
                    How do I manage my subscription?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      You can manage your subscription through your account settings:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Log in to your account</li>
                      <li>Click on your profile icon in the top right</li>
                      <li>Select "Account Settings"</li>
                      <li>Navigate to the "Subscription" tab</li>
                      <li>From here, you can view your current plan, upgrade, downgrade, or cancel</li>
                    </ol>
                    <p className="mt-4">
                      If you have any issues managing your subscription, please contact our support team.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="income-verification">
                  <AccordionTrigger className="text-left">
                    How does income verification work?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      To qualify for our Low-Income Plan, we require simple income verification:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Visit the "Pricing" page and select the Low-Income option</li>
                      <li>Complete the income verification form</li>
                      <li>Upload a document showing proof of income (pay stub, tax assessment, social assistance statement, etc.)</li>
                      <li>Our team will review your submission within 24-48 hours</li>
                      <li>Once approved, you'll have immediate access to reduced pricing</li>
                    </ol>
                    <p className="mt-4">
                      We keep all verification documents confidential and securely delete them after reviewing.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="account-security">
                  <AccordionTrigger className="text-left">
                    How is my information protected?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      We take data security and privacy very seriously:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>All data is encrypted both in transit and at rest</li>
                      <li>We use secure cloud infrastructure with regular security updates</li>
                      <li>We never sell your personal information to third parties</li>
                      <li>Access to user data is strictly limited and logged</li>
                      <li>Our platform complies with Canadian privacy laws</li>
                    </ul>
                    <p className="mt-4">
                      You can review our full Privacy Policy for more details on how we protect your information.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            {/* Legal Help Questions */}
            <TabsContent value="legal" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="self-advocacy">
                  <AccordionTrigger className="text-left">
                    What is self-advocacy?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Self-advocacy is the act of speaking up for yourself and your rights when dealing with organizations, 
                      government agencies, or other entities. It involves:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Understanding your legal rights and entitlements</li>
                      <li>Communicating your needs effectively</li>
                      <li>Challenging decisions or actions you believe are wrong</li>
                      <li>Navigating bureaucratic processes independently</li>
                      <li>Standing up for yourself in formal and informal settings</li>
                    </ul>
                    <p className="mt-4">
                      SmartDispute.ai Canada empowers your self-advocacy by providing professional-quality documents and 
                      resources that help you navigate complex systems.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="when-lawyer">
                  <AccordionTrigger className="text-left">
                    When should I hire a lawyer?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      While SmartDispute.ai Canada helps with many common legal issues, some situations may require a lawyer:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Complex legal matters with significant consequences (e.g., criminal charges, large financial disputes)</li>
                      <li>Cases involving serious custody issues or potential child removal</li>
                      <li>Situations where the other party has legal representation</li>
                      <li>Appeals to higher courts</li>
                      <li>When you need specific legal advice tailored to your unique circumstances</li>
                    </ul>
                    <p className="mt-4">
                      If you cannot afford a lawyer, consider contacting legal aid or pro bono legal services in your province.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="legal-resources">
                  <AccordionTrigger className="text-left">
                    Where can I find additional legal resources?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Beyond SmartDispute.ai Canada, there are several resources available:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Legal Aid:</strong> Every province has legal aid services for low-income individuals</li>
                      <li><strong>Community Legal Clinics:</strong> Many communities have free legal clinics with specific focus areas</li>
                      <li><strong>Law Libraries:</strong> Public access to legal information at courthouses and universities</li>
                      <li><strong>CanLII:</strong> Free access to Canadian court decisions and legislation</li>
                      <li><strong>JusticeNet:</strong> Reduced-fee services from participating lawyers and paralegals</li>
                    </ul>
                    <p className="mt-4">
                      Our Resources section provides links to province-specific legal resources for more help.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="success-rates">
                  <AccordionTrigger className="text-left">
                    What are the chances my dispute will be successful?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Success rates vary widely depending on your specific situation, the strength of your case, and the 
                      organization you're dealing with. While we cannot guarantee outcomes, we can share:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Many users have successfully challenged incorrect information or unfair treatment</li>
                      <li>Professional, well-written documents increase your chances of being taken seriously</li>
                      <li>Understanding the relevant laws and regulations strengthens your position</li>
                      <li>Persistence is often key - many successful disputes require multiple steps</li>
                    </ul>
                    <p className="mt-4">
                      Our testimonials section includes success stories from users who have used our platform effectively.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="mb-6 text-gray-600">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button className="px-6">Chat with AI Assistant</Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" className="px-6">Browse Resources</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}