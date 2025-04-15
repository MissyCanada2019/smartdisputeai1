import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { 
  Heart, 
  Bookmark, 
  Clock,
  MapPin,
  Tag,
  Shield,
  ThumbsUp,
  Share2,
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  ArrowLeft,
  Eye,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type definitions
interface Resource {
  id: number;
  userId: number;
  title: string;
  description: string;
  content: string;
  resourceType: string;
  resourceUrl?: string;
  fileUrl?: string;
  province: string;
  tags: string[];
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  isVerified: boolean;
  isPremium: boolean;
}

interface TagListProps {
  tags: string[];
}

interface Province {
  value: string;
  label: string;
}

const ResourceDetailPage = () => {
  const params = useParams<{ id: string }>();
  const resourceId = parseInt(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

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

  // Fetch resource detail
  const { 
    data: resource, 
    isLoading: isLoadingResource,
    error: resourceError,
  } = useQuery({
    queryKey: ['/api/community/resources', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/community/resources/${resourceId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch resource details');
      }
      return response.json();
    },
    enabled: !isNaN(resourceId),
  });

  // Like a resource
  const likeMutation = useMutation({
    mutationFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ['/api/community/resources', resourceId] });
      toast({
        title: "Success",
        description: "Resource liked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Bookmark a resource
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/community/resources/${resourceId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bookmark resource');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/resources', resourceId] });
      toast({
        title: "Success",
        description: "Resource bookmarked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

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
  const getResourceTypeIcon = (resourceType: string) => {
    switch (resourceType) {
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

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource?.title,
          text: resource?.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing resource:', error);
      }
    } else {
      // Fallback to copying the URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Resource link copied to clipboard",
      });
    }
  };

  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (resourceError || !resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading resource. The resource might not exist or you may not have permission to view it.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => setLocation('/resource-sharing')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => setLocation('/resource-sharing')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
      </div>
      
      <Card className={resource.isVerified ? "border-green-200" : undefined}>
        {resource.isVerified && (
          <div className="bg-green-100 text-green-800 px-4 py-1 text-xs font-medium flex items-center">
            <Shield className="h-3 w-3 mr-1" /> Verified Resource
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gray-100 p-3 rounded-full">
              {getResourceTypeIcon(resource.resourceType)}
            </div>
            <Badge variant="outline" className="capitalize">
              {resource.resourceType}
            </Badge>
            {resource.isPremium && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Premium
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">{resource.title}</CardTitle>
          
          <CardDescription className="mt-2 text-sm flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" /> User {resource.userId}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {getProvinceLabel(resource.province)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" /> {formatDate(resource.createdAt)}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" /> {resource.viewCount} views
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert mb-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{resource.description}</p>
            
            <Separator className="my-4" />
            
            <h3 className="text-lg font-medium mb-2">Content</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border mb-4">
              <p className="whitespace-pre-wrap">{resource.content}</p>
            </div>
            
            {resource.contactInfo && (
              <>
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border mb-4">
                  <p className="whitespace-pre-wrap">{resource.contactInfo}</p>
                </div>
              </>
            )}
            
            {resource.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {resource.resourceUrl && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={resource.resourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Visit Resource
                </a>
              </Button>
            )}
            
            {resource.fileUrl && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${likeMutation.isPending ? 'animate-pulse' : ''}`} />
              <span>{resource.likeCount}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
            >
              <Bookmark className={`h-4 w-4 ${bookmarkMutation.isPending ? 'animate-pulse' : ''}`} />
              <span>Save</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResourceDetailPage;