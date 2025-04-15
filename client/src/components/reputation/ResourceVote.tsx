import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ResourceVoteProps {
  resourceId: number;
}

type VoteStatus = 'upvote' | 'downvote' | 'none';

export default function ResourceVote({ resourceId }: ResourceVoteProps) {
  const [voteStatus, setVoteStatus] = useState<VoteStatus>('none');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'upvote' | 'downvote'>('upvote');
  const [feedbackText, setFeedbackText] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current vote status for this resource and user
  const { data: currentVote, isLoading } = useQuery({
    queryKey: ['/api/reputation/resources', resourceId, 'vote'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/reputation/resources/${resourceId}/vote/me`);
        if (response.status === 404) {
          return { voteStatus: 'none' };
        }
        if (!response.ok) {
          throw new Error('Failed to fetch vote status');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching vote status:', error);
        return { voteStatus: 'none' };
      }
    },
    onSuccess: (data) => {
      if (data && data.voteStatus) {
        setVoteStatus(data.voteStatus);
      }
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ vote, reason }: { vote: number; reason?: string }) => {
      const response = await fetch(`/api/reputation/resources/${resourceId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to vote on resource');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setVoteStatus(data.voteStatus);
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/resources', resourceId, 'vote'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/resources', resourceId] });
      
      toast({
        title: 'Success',
        description: data.message,
      });
      
      // Reset feedback
      setFeedbackText('');
      setShowFeedbackDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleVote = (vote: number) => {
    // If already voted the same way, this will toggle it off
    if ((vote === 1 && voteStatus === 'upvote') || (vote === -1 && voteStatus === 'downvote')) {
      voteMutation.mutate({ vote });
      return;
    }
    
    // For downvotes, we want to get feedback
    if (vote === -1) {
      setFeedbackType('downvote');
      setShowFeedbackDialog(true);
      return;
    }
    
    // For upvotes, optionally get feedback
    if (vote === 1) {
      // Simplified UX: directly vote for upvotes without feedback
      voteMutation.mutate({ vote });
      /* 
      // Alternative: ask for feedback for upvotes too
      setFeedbackType('upvote');
      setShowFeedbackDialog(true);
      */
    }
  };

  const submitFeedback = () => {
    const vote = feedbackType === 'upvote' ? 1 : -1;
    voteMutation.mutate({ vote, reason: feedbackText });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={voteStatus === 'upvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isLoading || voteMutation.isPending}
        className={`flex items-center gap-1 ${voteStatus === 'upvote' ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>Upvote</span>
      </Button>
      
      <Button
        variant={voteStatus === 'downvote' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isLoading || voteMutation.isPending}
        className={`flex items-center gap-1 ${voteStatus === 'downvote' ? 'bg-red-600 hover:bg-red-700' : ''}`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>Downvote</span>
      </Button>
      
      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackType === 'upvote' ? 'Why is this helpful?' : 'Why isn\'t this helpful?'}
            </DialogTitle>
            <DialogDescription>
              Your feedback helps improve the quality of community resources.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              feedbackType === 'upvote'
                ? 'What makes this resource helpful? (Optional)'
                : 'How could this resource be improved? (Optional)'
            }
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowFeedbackDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant={feedbackType === 'upvote' ? 'default' : 'destructive'}
              onClick={submitFeedback}
              disabled={voteMutation.isPending}
            >
              Submit {feedbackType === 'upvote' ? 'Upvote' : 'Downvote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}