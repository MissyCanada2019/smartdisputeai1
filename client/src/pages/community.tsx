import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Bookmark, Search, PlusCircle } from "lucide-react";

// Type definitions
interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

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

const CommunityPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery({
    queryKey: ['/api/community/categories'],
    queryFn: async () => {
      const response = await fetch('/api/community/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  // Fetch posts based on selected category
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['/api/community/posts', selectedCategoryId],
    queryFn: async () => {
      const url = selectedCategoryId 
        ? `/api/community/posts?categoryId=${selectedCategoryId}` 
        : '/api/community/posts';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    enabled: true,
  });

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      refetchPosts();
      return;
    }
    
    // Redirect to search page with query parameter
    setLocation(`/community/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId);
  };

  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading community content. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Community</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with others, share your experiences, and find support from people who understand.
            </p>
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
            <Button asChild>
              <Link to="/community/new-post">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategoryId === null ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategoryId(null)}
                  >
                    All Categories
                  </Button>
                  
                  {categories?.map((category: Category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategoryId === category.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
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
                    <Link to="/community/my-posts">My Posts</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/community/bookmarks">Bookmarked</Link>
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
                  {selectedCategoryId && (
                    <TabsTrigger value="pinned">Pinned</TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <TabsContent value="recent" className="mt-0">
                {isLoadingPosts ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : posts && posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post: Post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <h3 className="text-lg font-medium">No posts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      {selectedCategoryId 
                        ? "Be the first to post in this category!" 
                        : "No posts have been created yet."}
                    </p>
                    <Button className="mt-4" asChild>
                      <Link to="/community/new-post">Create a post</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0">
                {isLoadingPosts ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : posts && posts.length > 0 ? (
                  <div className="space-y-4">
                    {[...posts]
                      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
                      .map((post: Post) => (
                        <PostCard key={post.id} post={post} />
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <h3 className="text-lg font-medium">No popular posts yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Posts with the most likes will appear here.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              {selectedCategoryId && (
                <TabsContent value="pinned" className="mt-0">
                  {isLoadingPosts ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : posts && posts.filter(p => p.isPinnedByModerator).length > 0 ? (
                    <div className="space-y-4">
                      {posts
                        .filter((post: Post) => post.isPinnedByModerator)
                        .map((post: Post) => (
                          <PostCard key={post.id} post={post} isPinned />
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <h3 className="text-lg font-medium">No pinned posts</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Important posts pinned by moderators will appear here.
                      </p>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, isPinned = false }: { post: Post; isPinned?: boolean }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className={isPinned ? "border-primary" : undefined}>
      {isPinned && (
        <div className="bg-primary text-primary-foreground px-4 py-1 text-xs font-medium">
          Pinned Post
        </div>
      )}
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
                  {post.title}
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
        <p className="line-clamp-3 text-gray-600 dark:text-gray-300">
          {post.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500 hover:text-red-500">
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

export default CommunityPage;