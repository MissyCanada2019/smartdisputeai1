import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ReputationBadge from './ReputationBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUp, ChevronDown, Award } from 'lucide-react';

interface ReputationHistory {
  id: number;
  userId: number;
  action: string;
  points: number;
  resourceId?: number;
  description: string;
  createdAt: string;
}

interface ReputationData {
  id: number;
  userId: number;
  level: string;
  score: number;
  upvotesReceived: number;
  downvotesReceived: number;
  resourcesShared: number;
  nextLevelRequirement?: number;
}

interface ReputationProfileProps {
  userId: number;
}

export default function ReputationProfile({ userId }: ReputationProfileProps) {
  const { toast } = useToast();

  // Fetch reputation data
  const { 
    data: reputation, 
    isLoading: isLoadingReputation,
    error: reputationError 
  } = useQuery({
    queryKey: ['/api/reputation/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/reputation/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reputation data');
      }
      return response.json() as Promise<ReputationData>;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fetch reputation history
  const { 
    data: history, 
    isLoading: isLoadingHistory,
    error: historyError 
  } = useQuery({
    queryKey: ['/api/reputation/users', userId, 'history'],
    queryFn: async () => {
      const response = await fetch(`/api/reputation/users/${userId}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch reputation history');
      }
      return response.json() as Promise<ReputationHistory[]>;
    },
    onError: (error: Error) => {
      // We don't show toasts for history - it might be forbidden for non-owners
      console.error('Error fetching reputation history:', error);
    },
  });

  // Function to calculate progress to next level
  const calculateProgress = () => {
    if (!reputation || !reputation.nextLevelRequirement) return 0;
    
    return Math.min(
      Math.floor((reputation.score / reputation.nextLevelRequirement) * 100),
      100
    );
  };

  // Format action text
  const formatAction = (action: string): string => {
    switch (action) {
      case 'upvote_received':
        return 'Received an upvote';
      case 'downvote_received':
        return 'Received a downvote';
      case 'upvote_removed':
        return 'Upvote was removed';
      case 'downvote_removed':
        return 'Downvote was removed';
      case 'resource_shared':
        return 'Shared a resource';
      case 'vote_changed':
        return 'Vote was changed';
      case 'level_up':
        return 'Reached a new level';
      default:
        return action.replace(/_/g, ' ');
    }
  };

  if (reputationError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Reputation</CardTitle>
          <CardDescription>Error loading reputation data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributor Profile</CardTitle>
        <CardDescription>Your reputation and contribution history</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingReputation ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : reputation ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <ReputationBadge 
                level={reputation.level} 
                score={reputation.score} 
                size="lg"
              />
              
              {reputation.nextLevelRequirement && (
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{reputation.score} points</span>
                    <span>Next level: {reputation.nextLevelRequirement} points</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{reputation.resourcesShared}</p>
                <p className="text-xs text-muted-foreground">Resources Shared</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">{reputation.upvotesReceived}</p>
                <p className="text-xs text-muted-foreground">Upvotes</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-600">{reputation.downvotesReceived}</p>
                <p className="text-xs text-muted-foreground">Downvotes</p>
              </div>
            </div>
            
            <Tabs defaultValue="activity">
              <TabsList className="w-full">
                <TabsTrigger value="activity" className="flex-1">Recent Activity</TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity" className="pt-4">
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : historyError ? (
                  <p className="text-center text-muted-foreground py-4">
                    You can only view your own reputation history
                  </p>
                ) : history && history.length > 0 ? (
                  <div className="space-y-3">
                    {history.slice(0, 10).map((entry) => (
                      <div 
                        key={entry.id} 
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {entry.points > 0 ? (
                            <ChevronUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{entry.description || formatAction(entry.action)}</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          entry.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No activity yet. Start sharing resources to earn reputation!
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="achievements" className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    reputation.resourcesShared >= 1 ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'
                  }`}>
                    <Award className={`h-8 w-8 ${
                      reputation.resourcesShared >= 1 ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium">First Contribution</p>
                      <p className="text-xs text-muted-foreground">Share your first resource</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    reputation.upvotesReceived >= 5 ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'
                  }`}>
                    <Award className={`h-8 w-8 ${
                      reputation.upvotesReceived >= 5 ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium">Appreciated Helper</p>
                      <p className="text-xs text-muted-foreground">Receive 5 upvotes on your contributions</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                    reputation.resourcesShared >= 10 ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'
                  }`}>
                    <Award className={`h-8 w-8 ${
                      reputation.resourcesShared >= 10 ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium">Dedicated Contributor</p>
                      <p className="text-xs text-muted-foreground">Share 10 resources with the community</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No reputation data found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}