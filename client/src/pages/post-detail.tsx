import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Spinner from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, Bookmark, Share, MessageSquare, Flag, ArrowLeft, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  isAnonymous: boolean | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const PostDetailPage = () => {
  const { id } = useParams();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const postId = parseInt(id as string);

  // Fetch post
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
  } = useQuery({
    queryKey: ['/api/community/posts', postId],
    queryFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      return response.json();
    },
    enabled: !isNaN(postId),
  });

  // Fetch category
  const {
    data: category,
    isLoading: isLoadingCategory,
  } = useQuery({
    queryKey: ['/api/community/categories', post?.categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/community/categories/${post.categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return response.json();
    },
    enabled: !!post?.categoryId,
  });

  // Fetch comments
  const {
    data: comments,
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['/api/community/posts', postId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    enabled: !isNaN(postId),
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
      setComment("");
      setIsSubmitting(false);
      refetchComments();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle like');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts', postId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle bookmark');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked);
      toast({
        title: data.bookmarked ? "Post bookmarked" : "Bookmark removed",
        description: data.bookmarked 
          ? "This post has been added to your bookmarks." 
          : "This post has been removed from your bookmarks.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const commentData = {
      content: comment,
      isAnonymous: false,
    };
    
    createCommentMutation.mutate(commentData);
  };

  const handleToggleLike = () => {
    toggleLikeMutation.mutate();
  };

  const handleToggleBookmark = () => {
    toggleBookmarkMutation.mutate();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Post link has been copied to your clipboard.",
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  if (isLoadingPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load post. It may have been deleted or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate("/community")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/community")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {post.isAnonymous ? 'A' : 'U' + post.userId.toString().charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {post.isAnonymous ? 'Anonymous' : `User ${post.userId}`}
                    </span>
                    {category && (
                      <>
                        <span className="text-gray-500">•</span>
                        <Link to={`/community?category=${category.id}`} className="text-sm text-blue-600 hover:underline">
                          {category.name}
                        </Link>
                      </>
                    )}
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                  </div>
                  <CardTitle className="text-2xl mt-2">{post.title}</CardTitle>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShare}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                onClick={handleToggleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.likeCount || 0}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-gray-500"
                onClick={() => {
                  document.getElementById('comment-input')?.focus();
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{comments?.length || 0}</span>
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 ${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
              onClick={handleToggleBookmark}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>Save</span>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comments ({comments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="space-y-4">
                <Textarea
                  id="comment-input"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !comment.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            </form>
            
            <Separator className="my-6" />
            
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment: Comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No comments yet</h3>
                <p className="text-gray-500 mt-1">Be the first to comment on this post.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Comment Card Component
const CommentCard = ({ comment }: { comment: Comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const handleToggleLike = () => {
    // In a real app, call the API to toggle like
    setIsLiked(!isLiked);
    toast({
      title: !isLiked ? "Comment liked" : "Like removed",
      description: "Comment like status updated.",
    });
  };

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {comment.isAnonymous ? 'A' : 'U' + comment.userId.toString().charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {comment.isAnonymous ? 'Anonymous' : `User ${comment.userId}`}
          </span>
          <span className="text-gray-500 text-sm">•</span>
          <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
        </div>
        <div className="text-gray-800 dark:text-gray-200">
          {comment.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2">{paragraph}</p>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 text-xs ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            onClick={handleToggleLike}
          >
            <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? (comment.likeCount || 0) + 1 : comment.likeCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs text-gray-500">
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;