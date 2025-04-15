import { useState } from "react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { ChevronRight, Info, Map } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CanadaMap from "@/components/visualizations/CanadaMap";
import { Separator } from "@/components/ui/separator";

export default function LegalRightsMap() {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/resources">Resources</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Legal Rights Map</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Interactive Legal Rights Map
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore and compare tenant and parental rights across Canadian provinces and territories. Access province-specific resources and legal information.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About Legal Rights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="mt-6">
          <CanadaMap />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Tenant Rights</CardTitle>
                <CardDescription>
                  Legal protections for renters vary significantly across Canada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Tenant rights in Canada are primarily governed by provincial and territorial legislation. 
                  These rights can vary significantly from one region to another, creating different levels 
                  of protection for renters across the country.
                </p>
                
                <h3 className="font-semibold mt-4">Key Elements of Tenant Rights:</h3>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>Rent control and increase limitations</li>
                  <li>Eviction protections and notice periods</li>
                  <li>Maintenance and repair responsibilities</li>
                  <li>Security deposit rules and return timeframes</li>
                  <li>Privacy rights and landlord entry rules</li>
                  <li>Dispute resolution processes</li>
                </ul>

                <p className="text-sm text-gray-600 mt-4">
                  Provinces like Quebec, Ontario, and British Columbia typically offer stronger tenant protections 
                  with rent control measures and robust dispute resolution systems. In contrast, Alberta, Saskatchewan, 
                  and some territories have fewer restrictions on landlords regarding rent increases and evictions.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-800">Note:</strong> Laws change frequently. Always consult the official 
                  provincial/territorial resources for the most current information.
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Understanding Parental Rights</CardTitle>
                <CardDescription>
                  Legal frameworks for child protection and parental authority
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Parental rights in Canada encompass the legal authority of parents to make decisions 
                  about their children's upbringing. These rights are balanced against the state's 
                  responsibility to protect children from harm, which can sometimes lead to conflicts 
                  with child protection agencies.
                </p>
                
                <h3 className="font-semibold mt-4">Key Elements of Parental Rights:</h3>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>Legal decision-making authority for children</li>
                  <li>Right to be informed of child welfare investigations</li>
                  <li>Legal representation during child protection proceedings</li>
                  <li>Due process in child apprehension cases</li>
                  <li>Visitation rights during investigations</li>
                  <li>Cultural considerations, especially for Indigenous families</li>
                </ul>

                <p className="text-sm text-gray-600 mt-4">
                  While all provinces have systems to protect children from harm, they differ in how much 
                  support they provide to families before and during child welfare interventions. Quebec and 
                  British Columbia often emphasize family preservation and support services, while other 
                  regions may have different approaches to balancing child safety and family unity.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-800">Note:</strong> Child protection proceedings can be complex. 
                  It's crucial to seek legal advice if you're involved in such matters.
                </div>
              </CardFooter>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How to Use the Legal Rights Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2 text-blue-800">1. Select a Rights Category</h3>
                    <p className="text-sm">
                      Choose between Tenant Rights and Parental Rights using the tabs at the top of the map to 
                      see different legal frameworks across provinces.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2 text-blue-800">2. Explore the Color Coding</h3>
                    <p className="text-sm">
                      Darker blue indicates stronger legal protections in that province. Hover over any 
                      region to see its rating.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-2 text-blue-800">3. Click for Details</h3>
                    <p className="text-sm">
                      Click on a province to view specific rights information, key legal provisions, 
                      and helpful local resources.
                    </p>
                  </div>
                </div>
                
                <Alert className="mt-6">
                  <AlertTitle className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Disclaimer
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    This map provides general information only and should not be considered legal advice. 
                    Laws and policies may change over time. For specific legal issues, please consult with 
                    a qualified legal professional or the appropriate government agency in your province or territory.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Need Personalized Legal Support?</h2>
        <p className="mb-6 text-gray-600 max-w-3xl mx-auto">
          While our map provides general information, individual cases require personalized attention. 
          SmartDispute.ai offers AI-powered document analysis and legal assistance to help with your specific situation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/ai-document-analysis" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            Try Our AI Document Analysis
          </a>
          <a href="/resources" className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg transition-colors">
            Explore Legal Resources
          </a>
        </div>
      </div>
    </div>
  );
}