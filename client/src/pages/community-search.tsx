import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Bookmark, ArrowLeft, Search } from "lucide-react";

interface Post {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  isAnonymous: boolean | null;
  isStory: boolean | null;
  isAdvice: boolean | null;
  isPinnedByModerator: boolean | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

const CommunitySearchPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get search query from URL
  const queryParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = queryParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Fetch search results
  const { 
    data: searchResults, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/community/posts/search', initialQuery],
    queryFn: async () => {
      if (!initialQuery.trim()) return [];
      
      const response = await fetch(`/api/community/posts/search?query=${encodeURIComponent(initialQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search posts');
      }
      return response.json();
    },
    enabled: !!initialQuery.trim(),
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    
    // Update URL with new search query
    setLocation(`/community/search?q=${encodeURIComponent(searchQuery)}`);
    
    // Update results
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => setLocation("/community")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Community
      </Button>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Search Results</h1>
            {initialQuery && (
              <p className="text-gray-600 dark:text-gray-400">
                Results for "{initialQuery}"
              </p>
            )}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Input
                type="text"
                placeholder="Search posts..."
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
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Error loading search results. Please try again.</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
              {searchResults.map((post: Post) => (
                <PostCard key={post.id} post={post} searchTerm={initialQuery} />
              ))}
            </div>
          ) : initialQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-500 max-w-md mb-4">
                We couldn't find any posts matching "{initialQuery}". Try different keywords or check your spelling.
              </p>
              <Button onClick={() => setLocation("/community")}>
                Back to Community
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Search the Community</h3>
              <p className="text-gray-500 max-w-md mb-4">
                Enter keywords to find posts, questions, and stories from other members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Post Card Component with highlighted search terms
const PostCard = ({ post, searchTerm }: { post: Post; searchTerm: string }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Highlight search terms in text
  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };
  
  const highlightedTitle = highlightText(post.title, searchTerm);
  
  // Get a snippet of content around the search term
  const getContentSnippet = (content: string, term: string) => {
    if (!term.trim()) return content.slice(0, 150) + '...';
    
    const lowerContent = content.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerContent.indexOf(lowerTerm);
    
    if (index === -1) return content.slice(0, 150) + '...';
    
    // Get a portion of text around the search term
    const start = Math.max(0, index - 60);
    const end = Math.min(content.length, index + term.length + 60);
    let snippet = content.slice(start, end);
    
    // Add ellipsis if we're not at the beginning/end
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return highlightText(snippet, term);
  };

  const contentSnippet = getContentSnippet(post.content, searchTerm);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {post.isAnonymous ? 'A' : 'U' + post.userId.toString().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                <Link to={`/community/post/${post.id}`} className="hover:underline">
                  <span dangerouslySetInnerHTML={{ __html: highlightedTitle }} />
                </Link>
              </CardTitle>
              <CardDescription>
                {post.isAnonymous ? 'Anonymous' : `User ${post.userId}`} • {formatDate(post.createdAt)}
              </CardDescription>
            </div>
          </div>
          
          {post.isStory && (
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded">
              Story
            </span>
          )}
          {post.isAdvice && (
            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs font-medium px-2.5 py-0.5 rounded">
              Advice
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-600 dark:text-gray-300">
          <span dangerouslySetInnerHTML={{ __html: contentSnippet }} />
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
            <Heart className="h-4 w-4" />
            <span>{post.likeCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
            <MessageSquare className="h-4 w-4" />
            <span>0</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
          <Bookmark className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunitySearchPage;