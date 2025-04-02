import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ReputationBadge from './ReputationBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface TopContributor {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  reputationScore: number;
  reputationLevel: string;
  contributionCount: number;
}

export default function ReputationLeaderboard({ limit = 5 }: { limit?: number }) {
  const { data: contributors, isLoading, error } = useQuery({
    queryKey: ['/api/reputation/top-contributors', limit],
    queryFn: async () => {
      const response = await fetch(`/api/reputation/top-contributors?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top contributors');
      }
      return response.json() as Promise<TopContributor[]>;
    },
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Error loading leaderboard</CardDescription>
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
        <CardTitle>Top Contributors</CardTitle>
        <CardDescription>Community members helping others</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : contributors && contributors.length > 0 ? (
          <div className="space-y-4">
            {contributors.map((contributor, index) => (
              <div 
                key={contributor.id} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-muted">
                    <AvatarImage 
                      src={contributor.profileImage || ''} 
                      alt={contributor.username} 
                    />
                    <AvatarFallback>
                      {contributor.firstName?.charAt(0) || contributor.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {contributor.firstName && contributor.lastName 
                          ? `${contributor.firstName} ${contributor.lastName}`
                          : contributor.username
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contributor.contributionCount} contribution{contributor.contributionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ReputationBadge 
                      level={contributor.reputationLevel} 
                      score={contributor.reputationScore} 
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-muted-foreground">
              No contributors found. Be the first to share resources and earn reputation points!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}