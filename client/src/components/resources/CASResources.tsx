import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Book, FileText, Library, AlertTriangle, Scale, GraduationCap, Building, Map, Clock } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Define a Resource type (similar to what might be in your schema)
interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  province: string;
  tags: string[];
  category: string;
  subcategory?: string;
}

const CASResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('parent-rights');
  
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/resources'],
    retry: 1,
  });

  // Filter for CAS-related resources
  const filteredResources = (resources as Resource[] || []).filter(
    resource => resource.tags.some(tag => 
      ['CAS', 'children\'s aid', 'child protection', 'child welfare', 'parent rights'].includes(tag)
    )
  );
  
  // Categorize resources
  const parentRights = filteredResources.filter(
    resource => resource.tags.some(tag => 
      ['parent rights', 'rights', 'advocacy'].includes(tag)
    )
  );
  
  const childProtectionProcess = filteredResources.filter(
    resource => resource.tags.some(tag => 
      ['child protection process', 'legal process', 'court'].includes(tag)
    )
  );
  
  const casEncounterGuides = filteredResources.filter(
    resource => resource.tags.some(tag => 
      ['encounters', 'home visits', 'investigation', 'school visit'].includes(tag)
    )
  );

  const provincialResources = filteredResources.filter(
    resource => resource.tags.some(tag => 
      ['provincial resources', 'Ontario', 'Alberta', 'BC', 'New Brunswick'].includes(tag)
    )
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <h2 className="text-3xl font-bold">Children's Aid Society Resources</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading resources</AlertTitle>
        <AlertDescription>
          We couldn't load the CAS resources. Please try again later or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Children's Aid Society Resources</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive resources to help parents navigate the child welfare system across Canada
        </p>
      </div>
      
      <Alert className="mb-8 bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          The resources provided here are for informational purposes only and do not constitute legal advice. 
          If you are currently dealing with a Children's Aid Society case, consider seeking legal counsel.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="parent-rights" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="parent-rights" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Parent Rights
          </TabsTrigger>
          <TabsTrigger value="child-protection-process" className="flex items-center gap-2">
            <Book className="h-4 w-4" /> Protection Process
          </TabsTrigger>
          <TabsTrigger value="cas-encounters" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> CAS Encounters
          </TabsTrigger>
          <TabsTrigger value="provincial-resources" className="flex items-center gap-2">
            <Map className="h-4 w-4" /> Provincial Guides
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="parent-rights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle>Know Your Rights</CardTitle>
                </div>
                <CardDescription>Essential information on your rights as a parent</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Right to understand the concerns and allegations against you</li>
                  <li>Right to be informed about the investigation process</li>
                  <li>Right to be represented by a lawyer</li>
                  <li>Right to participate in developing a plan for your child</li>
                  <li>Right to reasonable access to your child if they are in care</li>
                  <li>Right to review and challenge information in your file</li>
                </ul>
              </CardContent>
              <CardFooter>
                <a 
                  href="https://www2.gov.bc.ca/assets/gov/family-and-social-supports/foster-parenting/know_your_rights.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  BC Know Your Rights Guide <span className="text-xs">(External Link)</span>
                </a>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <CardTitle>Legal Resources</CardTitle>
                </div>
                <CardDescription>Finding and working with legal representation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Navigating the Children's Aid Society system without legal help can be challenging. 
                  Here are some options to find affordable or free legal assistance:
                </p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Legal Aid services in your province</li>
                  <li>Duty counsel at family courts</li>
                  <li>Community legal clinics</li>
                  <li>Law school legal clinics</li>
                  <li>Pro bono law services</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://www.legalaid.on.ca/services/family-legal-issues/child-protection/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Ontario Legal Aid Resources
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <CardTitle>Human Rights Concerns in Child Welfare</CardTitle>
              </div>
              <CardDescription>Understanding discriminatory practices and how to address them</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Research has shown that certain communities are disproportionately affected by child welfare systems across Canada.
                The Ontario Human Rights Commission has documented concerns about racial profiling and discrimination in the child welfare system.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Common Concerns</h4>
                  <ul className="space-y-1 list-disc pl-5">
                    <li>Overrepresentation of Indigenous children in care</li>
                    <li>Racial disparities in reporting and investigations</li>
                    <li>Bias in risk assessments</li>
                    <li>Lack of culturally appropriate services</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Taking Action</h4>
                  <ul className="space-y-1 list-disc pl-5">
                    <li>Document all interactions with CAS workers</li>
                    <li>Request cultural consideration in your case</li>
                    <li>File complaints with provincial human rights commissions</li>
                    <li>Seek support from community advocacy organizations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <a 
                href="https://www3.ohrc.on.ca/en/under-suspicion-concerns-about-child-welfare" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Ontario Human Rights Commission - Concerns About Child Welfare
              </a>
            </CardFooter>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-4">
            {parentRights.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Resource
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="child-protection-process" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle>Understanding the Child Protection Process</CardTitle>
              </div>
              <CardDescription>Timeline and stages of child protection proceedings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Initial Investigation</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    After a report is made to CAS, an investigation typically follows these steps:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Initial contact and assessment (usually within 12-48 hours of a report)</li>
                    <li>Home visits and interviews with family members</li>
                    <li>Collection of information from schools, doctors, and other sources</li>
                    <li>Safety assessment and decision-making</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Court Process</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    If the case proceeds to court, parents should be aware of these key stages:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Temporary care hearing (within 5 days if child is removed)</li>
                    <li>Case conference and possible settlement discussions</li>
                    <li>Protection hearing (to determine if child needs protection)</li>
                    <li>Disposition hearing (to determine plan of care)</li>
                    <li>Status review hearings (to review ongoing situations)</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Time Limits</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Be aware of these important timeframes that may affect your case:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>In many provinces, there are maximum time limits for temporary care before a permanent decision must be made (typically 12-24 months, depending on the child's age)</li>
                    <li>Court dates and filing deadlines must be strictly observed</li>
                    <li>Service plan completion timeframes are often used to evaluate progress</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <a 
                href="https://www.familylawinbc.ca/children/child-protection/child-protection-process" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                BC Child Protection Process Guide
              </a>
            </CardFooter>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle>Court Preparation</CardTitle>
                </div>
                <CardDescription>Essential guidance for court appearances</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li><span className="font-medium">Documentation:</span> Organize all relevant records including communication with CAS, medical records, and proof of completed programs</li>
                  <li><span className="font-medium">Evidence:</span> Collect evidence of your parenting capacity and safe home environment</li>
                  <li><span className="font-medium">Witness preparation:</span> Identify character witnesses who can speak to your parenting abilities</li>
                  <li><span className="font-medium">Personal presentation:</span> Prepare to present yourself professionally and respectfully in court</li>
                  <li><span className="font-medium">Understanding:</span> Learn the terminology and procedures used in child protection hearings</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Court Preparation Checklist
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <CardTitle>Parenting Programs and Resources</CardTitle>
                </div>
                <CardDescription>Services that can help demonstrate parenting capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Participating in appropriate programs can help demonstrate your commitment to addressing concerns:
                </p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Parenting classes and programs</li>
                  <li>Substance abuse treatment and counseling</li>
                  <li>Mental health support services</li>
                  <li>Anger management programs</li>
                  <li>Domestic violence prevention programs</li>
                  <li>Family counseling services</li>
                </ul>
                <p className="mt-4 text-sm text-amber-600">
                  <strong>Tip:</strong> Keep detailed records of all program participation, including certificates, attendance records, and progress reports.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Find Support Programs
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {childProtectionProcess.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Resource
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="cas-encounters" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <CardTitle>Handling CAS Home Visits and Investigations</CardTitle>
              </div>
              <CardDescription>
                Important guidance for interactions with CAS workers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Before the Visit</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>If possible, schedule visits in advance at a time when you're prepared</li>
                    <li>Consider having a support person or advocate present</li>
                    <li>Ensure your home is reasonably clean and has basic necessities</li>
                    <li>Have documentation of children's medical care, school attendance, etc.</li>
                    <li>Understand you can ask for the specific concerns in writing</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">During the Visit</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Stay calm and composed, even if feeling stressed or defensive</li>
                    <li>Take notes or ask permission to record the conversation</li>
                    <li>Ask for clarification if you don't understand something</li>
                    <li>Be cooperative but know your rights regarding home access</li>
                    <li>Document who was present and what areas of your home were inspected</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">After the Visit</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Document everything discussed and any commitments made</li>
                    <li>Follow up in writing to confirm your understanding of next steps</li>
                    <li>Complete any agreed-upon actions promptly</li>
                    <li>Seek legal advice if you have concerns about the visit</li>
                    <li>Request a copy of any report or assessment created</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Home Visit Preparation Guide
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <CardTitle>School Visits and Interviews with Children</CardTitle>
              </div>
              <CardDescription>
                Understanding your rights when CAS interviews your child at school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                In many provinces, Children's Aid Society workers may interview children at school without parental notification or consent.
                Here's what parents should know:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Legal Framework</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Child protection laws generally allow for confidential interviews</li>
                    <li>Schools typically have policies to cooperate with CAS investigations</li>
                    <li>CAS workers should identify themselves to school administrators</li>
                    <li>Interviews should be conducted in a manner that minimizes disruption</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Parent Response</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>If you learn about a school interview, remain calm</li>
                    <li>Contact the CAS worker to ask about concerns</li>
                    <li>Request information about what was discussed</li>
                    <li>Consider informing your child they can ask for your presence</li>
                    <li>Follow up with your child in a supportive, non-leading way</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> While it may feel distressing, responding with hostility to school officials or CAS workers can escalate concerns.
                  Focus on gathering information and seeking legal advice if needed.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                School Interview Response Guide
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-4">
            {casEncounterGuides.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Resource
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="provincial-resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-red-50 dark:bg-red-900/10">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-red-600" />
                  <CardTitle>Ontario Resources</CardTitle>
                </div>
                <CardDescription>Support for families dealing with Ontario CAS</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.ontario.ca/page/child-welfare-and-protection-services" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Child, Youth and Family Services Act Overview
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Official guide to Ontario's child welfare legislation</p>
                  </li>
                  <li>
                    <a 
                      href="https://www3.ohrc.on.ca/en/under-suspicion-concerns-about-child-welfare" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Scale className="h-4 w-4" />
                      Ontario Human Rights Commission - Child Welfare Concerns
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Research on systemic issues in Ontario's child welfare system</p>
                  </li>
                  <li>
                    <a 
                      href="https://www.legalaid.on.ca/services/family-legal-issues/child-protection/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Library className="h-4 w-4" />
                      Legal Aid Ontario - Child Protection
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Access to legal representation for child protection cases</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-600" />
                  <CardTitle>British Columbia Resources</CardTitle>
                </div>
                <CardDescription>Support for families dealing with BC child welfare system</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.familylawinbc.ca/children/child-protection/child-protection-process" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Book className="h-4 w-4" />
                      Child Protection Process in BC
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Comprehensive guide to the child protection process in BC</p>
                  </li>
                  <li>
                    <a 
                      href="https://www2.gov.bc.ca/assets/gov/family-and-social-supports/foster-parenting/know_your_rights.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Know Your Rights Guide (BC)
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Official rights guide for parents dealing with BC's child welfare system</p>
                  </li>
                  <li>
                    <a 
                      href="https://legalaid.bc.ca/publications/pub/parents-rights-child-protection-cases" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Scale className="h-4 w-4" />
                      Legal Aid BC - Parents' Rights
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Information about parents' legal rights in child protection cases</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-900/10">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-amber-600" />
                  <CardTitle>Alberta Resources</CardTitle>
                </div>
                <CardDescription>Support for families dealing with Alberta child intervention</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.alberta.ca/child-intervention-information-for-caregivers.aspx" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Alberta Child Intervention Information
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Official government information on child intervention</p>
                  </li>
                  <li>
                    <a 
                      href="https://www.legalaid.ab.ca/services/family-matters/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Scale className="h-4 w-4" />
                      Legal Aid Alberta - Family Matters
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Legal support for child welfare cases</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-green-600" />
                  <CardTitle>New Brunswick Resources</CardTitle>
                </div>
                <CardDescription>Support for families dealing with New Brunswick child protection</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www2.gnb.ca/content/gnb/en/departments/social_development/protection/content/child_protection.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Book className="h-4 w-4" />
                      NB Child Protection System
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Overview of New Brunswick's child protection services</p>
                  </li>
                  <li>
                    <a 
                      href="https://www.legalaid-aidejuridique-nb.ca/services/family-law/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Scale className="h-4 w-4" />
                      Legal Aid New Brunswick - Family Law
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Legal support for child protection matters</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {provincialResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Resource
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">Additional Legal Resources</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="https://www.canlii.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">CanLII Legal Database</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Free access to Canadian court decisions and legislation, searchable by keyword
            </p>
          </a>
          
          <a 
            href="https://www.justice.gc.ca/eng/fl-df/parent/index.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">Department of Justice - Parenting Resources</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Federal resources on parenting, family law, and child protection
            </p>
          </a>
          
          <a 
            href="https://cwrp.ca/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">Canadian Child Welfare Research Portal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Research and resources on child welfare across Canada
            </p>
          </a>
          
          <a 
            href="https://www.canada.ca/en/public-health/services/publications/healthy-living/canadian-incidence-study-reported-child-abuse-neglect-main.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">Canadian Incidence Study of Reported Child Abuse and Neglect</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              National research on child welfare investigations
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CASResources;