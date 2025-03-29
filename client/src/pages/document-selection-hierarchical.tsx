import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import type { DocumentTemplate } from '@shared/schema';
import { provinces } from '@shared/schema';
import { useFormState } from '@/lib/formContext';
import { ChevronRight, Search, FileText, MapPin, Building, ScrollText } from 'lucide-react';

// Define our category structure
const categories = [
  {
    id: 'cas',
    name: "Children's Aid Societies",
    description: "Documents for dealing with Children's Aid Society situations",
    icon: <FileText className="h-5 w-5 text-primary" />
  },
  {
    id: 'landlord-tenant',
    name: "Landlord-Tenant",
    description: "Rental disputes, repairs, evictions, and related issues",
    icon: <Building className="h-5 w-5 text-primary" />
  },
  {
    id: 'equifax',
    name: "Equifax",
    description: "Credit report corrections and disputes",
    icon: <ScrollText className="h-5 w-5 text-primary" />
  },
  {
    id: 'transition',
    name: "Transition Services",
    description: "Assistance with transition-related services and disputes",
    icon: <FileText className="h-5 w-5 text-primary" />
  }
];

// Define agencies for each category
const agencies = {
  'cas': [
    { id: 'cas-general', name: "Children's Aid Society General" },
    { id: 'cas-school', name: "CAS School Interactions" },
    { id: 'cas-records', name: "CAS Record Corrections" },
    { id: 'cas-court', name: "CAS Court Proceedings" }
  ],
  'landlord-tenant': [
    { id: 'ltb', name: "Landlord and Tenant Board (LTB)" },
    { id: 'rental-authority', name: "Provincial Rental Authority" },
    { id: 'property-management', name: "Property Management Companies" }
  ],
  'equifax': [
    { id: 'equifax-general', name: "Equifax Credit Bureau" },
    { id: 'credit-disputes', name: "Credit Reporting Disputes" }
  ],
  'transition': [
    { id: 'govt-services', name: "Government Transition Services" },
    { id: 'healthcare', name: "Healthcare Providers" },
    { id: 'support-services', name: "Support Service Organizations" }
  ]
};

export default function DocumentSelectionHierarchical() {
  const [formState, setFormState] = useFormState();
  const [, navigate] = useLocation();
  
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all document templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/document-templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/document-templates');
      return await response.json() as DocumentTemplate[];
    }
  });
  
  // Filter templates based on selections
  const filteredTemplates = templates?.filter(template => {
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    let matches = true;
    
    // Province filter
    if (selectedProvince) {
      matches = matches && template.applicableProvinces.includes(selectedProvince);
    }
    
    // Category filter
    if (selectedCategory) {
      matches = matches && template.category.toLowerCase().includes(selectedCategory.toLowerCase());
    }
    
    // We would need to add agency info to templates to filter by agency
    // For now, this is a simplification
    if (selectedAgency) {
      // This is a simplified approach - in a real implementation,
      // templates would have an agency field or a more specific subcategory
      const agencyNameLower = agencies[selectedCategory as keyof typeof agencies]
        .find(a => a.id === selectedAgency)?.name.toLowerCase() || '';
      
      matches = matches && (
        template.description.toLowerCase().includes(agencyNameLower) ||
        template.name.toLowerCase().includes(agencyNameLower)
      );
    }
    
    return matches;
  });
  
  const handleTemplateSelect = (template: DocumentTemplate) => {
    setFormState({
      ...formState,
      selectedTemplate: template,
      currentStep: 1 
    });
    navigate('/user-info');
  };
  
  // Reset filters function
  const resetFilters = () => {
    setSelectedProvince(null);
    setSelectedCategory(null);
    setSelectedAgency(null);
    setSearchQuery('');
  };
  
  // Reset agency when category changes
  useEffect(() => {
    setSelectedAgency(null);
  }, [selectedCategory]);
  
  // Create breadcrumb items based on selection state
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Documents', href: '#', onClick: resetFilters }
    ];
    
    if (selectedProvince) {
      const province = provinces.find(p => p.value === selectedProvince);
      items.push({ 
        label: province?.label || selectedProvince, 
        href: '#', 
        onClick: () => {
          setSelectedCategory(null);
          setSelectedAgency(null);
        } 
      });
    }
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      items.push({ 
        label: category?.name || selectedCategory, 
        href: '#', 
        onClick: () => setSelectedAgency(null) 
      });
    }
    
    if (selectedAgency) {
      const agency = agencies[selectedCategory as keyof typeof agencies]?.find(a => a.id === selectedAgency);
      items.push({ 
        label: agency?.name || selectedAgency, 
        href: '#',
        onClick: () => {} 
      });
    }
    
    return items;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Document Selection</h1>
          <p className="text-gray-500 mt-2">
            Find the right legal document for your situation
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbItems().map((item, index) => (
                index === getBreadcrumbItems().length - 1 ? (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink href={item.href} onClick={item.onClick}>
                      {item.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  </BreadcrumbItem>
                )
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <Select 
                value={selectedProvince || ""} 
                onValueChange={(value) => value ? setSelectedProvince(value) : setSelectedProvince(null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Provinces</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select 
                value={selectedCategory || ""} 
                onValueChange={(value) => value ? setSelectedCategory(value) : setSelectedCategory(null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
              <Select 
                value={selectedAgency || ""}
                onValueChange={(value) => value ? setSelectedAgency(value) : setSelectedAgency(null)}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory ? "Select Agency" : "Select Category First"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Agencies</SelectItem>
                  {selectedCategory && agencies[selectedCategory as keyof typeof agencies]?.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Reset filters button */}
        {(selectedProvince || selectedCategory || selectedAgency || searchQuery) && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
        
        {/* Document Templates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredTemplates && filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                      {template.category && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {template.category}
                        </span>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {template.applicableProvinces.join(', ')}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <p className="text-sm text-gray-700">
                      {template.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <span className="text-sm font-medium">${template.basePrice.toFixed(2)}</span>
                    <Button onClick={() => handleTemplateSelect(template)}>
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or search query.
              </p>
              <Button className="mt-4" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}