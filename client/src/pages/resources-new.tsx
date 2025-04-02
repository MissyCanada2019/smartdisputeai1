import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Search } from "lucide-react";
import { provinces } from "@shared/schema";

// Resource interfaces
interface ResourceCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
}

interface ResourceSubcategory {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  province: string;
  categoryId: number;
  subcategoryId: number | null;
  url: string | null;
  contactInfo: string | null;
  tags: string[] | null;
  isPremium: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch resource categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ResourceCategory[]>({
    queryKey: ['/api/resource-categories'],
    refetchOnWindowFocus: false,
  });

  // Fetch subcategories
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<ResourceSubcategory[]>({
    queryKey: ['/api/resource-subcategories'],
    refetchOnWindowFocus: false,
  });

  // Fetch resources with filtering
  const { data: resources = [], isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources', selectedProvince, activeCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (selectedProvince !== "ALL") {
        params.append('province', selectedProvince);
      }
      
      if (activeCategory) {
        const categoryId = categories.find(c => c.id.toString() === activeCategory)?.id;
        if (categoryId) {
          params.append('categoryId', categoryId.toString());
        }
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/resources?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      return response.json();
    },
    enabled: !categoriesLoading,
    refetchOnWindowFocus: false,
  });

  // Helper functions
  const getCategoryName = (categoryId: number): string => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown Category';
  };

  const getSubcategoryName = (subcategoryId: number | null): string | null => {
    if (!subcategoryId) return null;
    return subcategories.find(s => s.id === subcategoryId)?.name || null;
  };

  const getProvinceName = (provinceCode: string): string => {
    return provinces.find(p => p.value === provinceCode)?.label || provinceCode;
  };

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Filter resources by active category for tab content
  const getFilteredResources = (categoryId: number | null) => {
    if (categoryId === null) return resources;
    return resources.filter(r => r.categoryId === categoryId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 inline-block text-transparent bg-clip-text">
            Know Your Rights
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Access free legal resources and information specific to your province and situation.
          </p>
        </div>
        
        {/* Special LTB Resources Banner */}
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-gray-900/50 border border-red-200 dark:border-red-800/30 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Ontario Tenant Rights Resources</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Get help fighting unfair evictions and navigating the LTB process with our specialized tenant advocacy resources.
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                Currently 427-day average wait time for tenant applications at the Landlord and Tenant Board
              </p>
            </div>
            <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
              <a href="/resources/ltb">Access Tenant Resources</a>
            </Button>
          </div>
        </div>
        
        {/* CAS Resources Banner */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900/50 border border-amber-200 dark:border-amber-800/30 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Children's Aid Society Resources</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Navigate the child welfare system with confidence using our comprehensive resources for parents across Canada.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                Protecting your rights and helping you advocate effectively for your family
              </p>
            </div>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700" asChild>
              <a href="/resources/cas">Access CAS Resources</a>
            </Button>
          </div>
        </div>

        {/* Filters section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8 border">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input 
                  placeholder="Search resources..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
            <div className="w-full md:w-56">
              <Select 
                value={selectedProvince} 
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Provinces</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Browse Resources by Category</h2>
          {categoriesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Tabs onValueChange={setActiveCategory} defaultValue="">
              <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="">All Resources</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id.toString()}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* All Resources Tab */}
              <TabsContent value="" className="mt-6">
                {resourcesLoading ? (
                  <ResourcesLoadingSkeleton count={6} />
                ) : resources.length > 0 ? (
                  <ResourceCardGrid resources={resources} getCategoryName={getCategoryName} getSubcategoryName={getSubcategoryName} getProvinceName={getProvinceName} />
                ) : (
                  <NoResourcesFound message="No resources found matching your criteria." suggestion="Try changing your search or filters." />
                )}
              </TabsContent>
              
              {/* Category-specific tabs */}
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id.toString()} className="mt-6">
                  <div className="mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-xl font-semibold mb-3">{category.name}</h3>
                      <p className="text-gray-600">{category.description || `Resources related to ${category.name}`}</p>
                    </div>
                  </div>
                  
                  {resourcesLoading ? (
                    <ResourcesLoadingSkeleton count={3} />
                  ) : (
                    getFilteredResources(category.id).length > 0 ? (
                      <ResourceCardGrid 
                        resources={getFilteredResources(category.id)} 
                        getCategoryName={getCategoryName} 
                        getSubcategoryName={getSubcategoryName} 
                        getProvinceName={getProvinceName} 
                      />
                    ) : (
                      <NoResourcesFound message="No resources found in this category." suggestion="Try changing your province filter or check back later." />
                    )
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
const ResourcesLoadingSkeleton = ({ count }: { count: number }) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="h-64">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const NoResourcesFound = ({ message, suggestion }: { message: string; suggestion: string }) => (
  <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
    <p className="text-gray-500">{message}</p>
    <p className="text-gray-500 text-sm mt-1">{suggestion}</p>
  </div>
);

interface ResourceCardGridProps {
  resources: Resource[];
  getCategoryName: (id: number) => string;
  getSubcategoryName: (id: number | null) => string | null;
  getProvinceName: (code: string) => string;
}

const ResourceCardGrid = ({ resources, getCategoryName, getSubcategoryName, getProvinceName }: ResourceCardGridProps) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {resources.map((resource) => (
      <Card key={resource.id} className="flex flex-col h-full overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            {resource.isPremium && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Premium
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {getProvinceName(resource.province)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getCategoryName(resource.categoryId)}
            </Badge>
            {resource.subcategoryId && (
              <Badge variant="outline" className="text-xs">
                {getSubcategoryName(resource.subcategoryId)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <a href={resource.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Resource
            </a>
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);