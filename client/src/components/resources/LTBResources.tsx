import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, FileText, BookOpen, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  resource_type: string;
  province: string;
  category_id: number;
  subcategory_id: number;
  resource_url: string;
  tags: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

const LTBResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tenant-forms');
  
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/resources'],
    retry: 1,
  });

  const filteredResources = (resources as Resource[] || []).filter(
    resource => resource.tags.some(tag => 
      ['LTB', 'tenant rights', 'eviction', 'case law', 'delays'].includes(tag)
    )
  );

  const tenantForms = filteredResources.filter(
    resource => resource.tags.includes('tenant') && resource.tags.includes('forms')
  );
  
  const landlordForms = filteredResources.filter(
    resource => resource.tags.includes('landlord') && resource.tags.includes('forms')
  );
  
  const tenantResourceGuides = filteredResources.filter(
    resource => resource.tags.some(tag => 
      ['tenant rights', 'CanLII', 'eviction', 'defense'].includes(tag)
    )
  );

  const ltbStatistics = filteredResources.filter(
    resource => resource.tags.some(tag => 
      ['delays', 'statistics', 'wait times', 'backlog'].includes(tag)
    )
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <h2 className="text-3xl font-bold">Ontario Landlord and Tenant Board Resources</h2>
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
          We couldn't load the LTB resources. Please try again later or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ontario Landlord and Tenant Board Resources</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access forms, guides, and statistics to help with your tenant rights and disputes
        </p>
      </div>

      <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-400">Critical Information</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          The LTB currently has a <strong>427-day average wait time</strong> for tenant applications.
          Scroll down to Statistics tab for more information on delays.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tenant-forms" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenant-forms">Tenant Forms</TabsTrigger>
          <TabsTrigger value="landlord-forms">Landlord Forms</TabsTrigger>
          <TabsTrigger value="guides">Self-Advocacy Guides</TabsTrigger>
          <TabsTrigger value="statistics">LTB Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="tenant-forms" className="space-y-4 mt-4">
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-md mb-6">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-400">Tenant-Focused Resources</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  These forms help you protect your rights as a tenant. Our platform focuses on tenant 
                  advocacy to help level the playing field against landlords who often have more resources.
                </p>
              </div>
            </div>
          </div>
          
          {tenantForms.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </TabsContent>

        <TabsContent value="landlord-forms" className="space-y-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md mb-6">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-400">Understanding Landlord Forms</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  As a tenant, it's important to understand what forms landlords may file against you.
                  Knowing these processes helps you prepare better defenses.
                </p>
              </div>
            </div>
          </div>
          
          {landlordForms.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </TabsContent>

        <TabsContent value="guides" className="space-y-4 mt-4">
          <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-md mb-6">
            <div className="flex items-start space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-800 dark:text-purple-400">Self-Advocacy Guides</h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  These comprehensive guides will help you effectively represent yourself in LTB proceedings
                  and understand your legal rights as a tenant in Ontario.
                </p>
              </div>
            </div>
          </div>
          
          {tenantResourceGuides.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4 mt-4">
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-400">Current LTB Crisis</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  The LTB is experiencing unprecedented backlogs and delays. These statistics will help you 
                  understand the situation and plan your case strategy accordingly.
                </p>
              </div>
            </div>
          </div>
          
          {ltbStatistics.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
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
            href="https://www.canlii.org/en/on/onltb/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">CanLII LTB Decisions Database</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Free searchable database of past LTB decisions to help with your case
            </p>
          </a>
          
          <a 
            href="https://www.acto.ca/for-tenants/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">Advocacy Centre for Tenants Ontario</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Legal resources, tip sheets, and advocacy support for Ontario tenants
            </p>
          </a>
          
          <a 
            href="https://tribunalsontario.ca/ltb/contact/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">LTB Contact Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Official contact information for the Landlord and Tenant Board
            </p>
          </a>
          
          <a 
            href="https://stepstojustice.ca/legal-topic/housing-law/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
          >
            <h3 className="font-bold">Steps to Justice: Housing Law</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practical step-by-step guides for common tenant legal issues
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </div>
          {resource.is_verified && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
              Verified
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {resource.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!expanded ? (
          <div className="prose dark:prose-invert prose-sm max-w-none line-clamp-3">
            <div dangerouslySetInnerHTML={{ __html: resource.content.split('\n').slice(0, 3).join('\n') }} />
          </div>
        ) : (
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: resource.content.replace(/\n/g, '<br />') 
            }} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show Less' : 'Read More'}
        </Button>
        {resource.resource_url && (
          <Button variant="secondary" asChild>
            <a href={resource.resource_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Official Source
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LTBResources;