import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Search, 
  PlusCircle, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink,
  Clock,
  Globe,
  MapPin,
  Tag,
  Shield,
  ThumbsUp,
  Share2,
  Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Type definitions
interface Resource {
  id: number;
  userId: number;
  title: string;
  description: string;
  resourceType: string;
  resourceUrl?: string;
  fileUrl?: string;
  province: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  isVerified: boolean;
}

interface Province {
  value: string;
  label: string;
}

// Main component
const ResourceSharingPage = () => {
  const [selectedResourceType, setSelectedResourceType] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // List of provinces
  const provinces: Province[] = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" }
  ];

  // Resource types
  const resourceTypes = [
    { id: "document", name: "Document", icon: <FileText className="h-4 w-4" /> },
    { id: "link", name: "Website Link", icon: <LinkIcon className="h-4 w-4" /> },
    { id: "template", name: "Template", icon: <FileText className="h-4 w-4" /> },
    { id: "guide", name: "Guide", icon: <FileText className="h-4 w-4" /> },
    { id: "contact", name: "Contact Information", icon: <FileText className="h-4 w-4" /> },
  ];

  // Fetch resources
  const { 
    data: resources, 
    isLoading: isLoadingResources,
    error: resourcesError,
    refetch: refetchResources
  } = useQuery({
    queryKey: ['/api/community/resources', selectedResourceType, selectedProvince],
    queryFn: async () => {
      let url = '/api/community/resources';
      const params = new URLSearchParams();
      
      if (selectedResourceType) {
        params.append('type', selectedResourceType);
      }
      
      if (selectedProvince) {
        params.append('province', selectedProvince);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      
      return response.json();
    },
    enabled: true,
  });

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      refetchResources();
      return;
    }
    
    // Redirect to search page with query parameter
    setLocation(`/resource-sharing/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Like a resource
  const likeMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      const response = await fetch(`/api/community/resources/${resourceId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to like resource');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/resources'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle resource type selection
  const handleResourceTypeSelect = (typeId: string) => {
    setSelectedResourceType(typeId === selectedResourceType ? null : typeId);
  };
  
  // Handle province selection
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value === selectedProvince ? null : value);
  };

  if (isLoadingResources) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (resourcesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading resources. Please try again later.</p>
        </div>
      </div>
    );
  }

  const mockResources: Resource[] = [
    {
      id: 1,
      userId: 1,
      title: "Ontario Tenant Rights Guide",
      description: "A comprehensive guide to tenant rights in Ontario including eviction processes and rent increase rules.",
      resourceType: "document",
      fileUrl: "/uploads/tenant-rights-guide.pdf",
      province: "ON",
      tags: ["housing", "tenant-rights", "eviction"],
      createdAt: "2024-02-15T14:32:00Z",
      updatedAt: "2024-02-15T14:32:00Z",
      likeCount: 24,
      viewCount: 156,
      isVerified: true
    },
    {
      id: 2,
      userId: 3,
      title: "Legal Aid Ontario Resources",
      description: "Directory of free legal resources and clinics available through Legal Aid Ontario.",
      resourceType: "link",
      resourceUrl: "https://www.legalaid.on.ca/services/",
      province: "ON",
      tags: ["legal-aid", "free-resources", "clinic"],
      createdAt: "2024-01-28T09:15:00Z",
      updatedAt: "2024-01-28T09:15:00Z",
      likeCount: 18,
      viewCount: 89,
      isVerified: true
    },
    {
      id: 3,
      userId: 5,
      title: "Children's Aid Society Complaint Template",
      description: "Template letter for filing a formal complaint against a Children's Aid Society in Ontario.",
      resourceType: "template",
      fileUrl: "/uploads/cas-complaint-template.docx",
      province: "ON",
      tags: ["cas", "children", "complaint"],
      createdAt: "2024-03-05T16:45:00Z",
      updatedAt: "2024-03-05T16:45:00Z",
      likeCount: 42,
      viewCount: 210,
      isVerified: true
    },
    {
      id: 4,
      userId: 2,
      title: "BC Tenancy Dispute Resolution Guide",
      description: "Step-by-step guide for resolving tenancy disputes in British Columbia.",
      resourceType: "guide",
      fileUrl: "/uploads/bc-tenancy-dispute-guide.pdf",
      province: "BC",
      tags: ["housing", "dispute-resolution", "tenancy"],
      createdAt: "2024-02-20T11:22:00Z",
      updatedAt: "2024-02-20T11:22:00Z",
      likeCount: 15,
      viewCount: 78,
      isVerified: false
    },
    {
      id: 5,
      userId: 4,
      title: "Alberta Legal Clinic Network",
      description: "Contact information for free legal clinics across Alberta.",
      resourceType: "contact",
      province: "AB",
      tags: ["legal-aid", "clinics", "pro-bono"],
      createdAt: "2024-01-10T13:40:00Z",
      updatedAt: "2024-01-10T13:40:00Z",
      likeCount: 29,
      viewCount: 132,
      isVerified: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Resource Sharing Network</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find and share valuable resources to help with your legal and advocacy journey.
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-8"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full" 
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild>
              <Link to="/resource-sharing/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Share Resource
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filter Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <div className="space-y-2">
                      {resourceTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={selectedResourceType === type.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleResourceTypeSelect(type.id)}
                        >
                          <span className="mr-2">{type.icon}</span>
                          {type.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select
                      value={selectedProvince || ""}
                      onValueChange={handleProvinceChange}
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
                  
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedResourceType(null);
                        setSelectedProvince(null);
                        setSearchQuery("");
                        refetchResources();
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/resource-sharing/my-resources">My Shared Resources</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/resource-sharing/saved">Saved Resources</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/resource-sharing/verified">Verified Resources</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="recent">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="recent" className="mt-0">
                <div className="space-y-4">
                  {mockResources.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  ).map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      resource={resource}
                      onLike={() => likeMutation.mutate(resource.id)}
                      provinces={provinces}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0">
                <div className="space-y-4">
                  {mockResources.sort((a, b) => b.likeCount - a.likeCount).map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      resource={resource}
                      onLike={() => likeMutation.mutate(resource.id)}
                      provinces={provinces}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="verified" className="mt-0">
                <div className="space-y-4">
                  {mockResources.filter(r => r.isVerified).map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      resource={resource}
                      onLike={() => likeMutation.mutate(resource.id)}
                      provinces={provinces}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({ 
  resource, 
  onLike,
  provinces
}: { 
  resource: Resource; 
  onLike: () => void;
  provinces: Province[];
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Get province label
  const getProvinceLabel = (code: string) => {
    return provinces.find(p => p.value === code)?.label || code;
  };

  // Get resource type icon
  const getResourceTypeIcon = () => {
    switch (resource.resourceType) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      case 'template':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'guide':
        return <FileText className="h-5 w-5 text-amber-600" />;
      case 'contact':
        return <FileText className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card className={resource.isVerified ? "border-green-200" : undefined}>
      {resource.isVerified && (
        <div className="bg-green-100 text-green-800 px-4 py-1 text-xs font-medium flex items-center">
          <Shield className="h-3 w-3 mr-1" /> Verified Resource
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-full">
              {getResourceTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">
                <Link to={`/resource-sharing/${resource.id}`} className="hover:underline">
                  {resource.title}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>User {resource.userId}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" /> {getProvinceLabel(resource.province)}
                <span>•</span>
                <Clock className="h-3 w-3" /> {formatDate(resource.createdAt)}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="capitalize">
              {resource.resourceType}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-2 text-gray-600 dark:text-gray-300 mb-3">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {resource.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 text-gray-500 hover:text-red-500"
            onClick={onLike}
          >
            <Heart className="h-4 w-4" />
            <span>{resource.likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
            <Download className="h-4 w-4" />
            <span>{resource.viewCount}</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
            <Bookmark className="h-4 w-4" />
          </Button>
          {resource.resourceUrl && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-blue-600"
              asChild
            >
              <a href={resource.resourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          {resource.fileUrl && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-blue-600"
              asChild
            >
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResourceSharingPage;