import React from 'react';
import { Medal, Award, Star, Trophy, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReputationBadgeProps {
  level: string;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ReputationBadge({ 
  level, 
  score, 
  size = 'md',
  showLabel = true 
}: ReputationBadgeProps) {
  // Map reputation level to appropriate icon and color
  const getBadgeDetails = () => {
    switch (level) {
      case 'Newcomer':
        return {
          icon: Star,
          color: 'text-gray-500 bg-gray-100',
          tooltip: 'Newcomer: Just getting started'
        };
      case 'Contributor':
        return {
          icon: Medal,
          color: 'text-blue-500 bg-blue-100',
          tooltip: 'Contributor: Has shared helpful resources'
        };
      case 'Expert':
        return {
          icon: Award,
          color: 'text-purple-500 bg-purple-100',
          tooltip: 'Expert: Highly rated contributions'
        };
      case 'Master':
        return {
          icon: Trophy,
          color: 'text-yellow-500 bg-yellow-100',
          tooltip: 'Master: Top-tier community member'
        };
      case 'Verified':
        return {
          icon: Shield,
          color: 'text-green-500 bg-green-100',
          tooltip: 'Verified: Approved by administrators'
        };
      default:
        return {
          icon: Star,
          color: 'text-gray-500 bg-gray-100',
          tooltip: 'Community Member'
        };
    }
  };

  const { icon: Icon, color, tooltip } = getBadgeDetails();
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  // Icon sizes
  const iconSizes = {
    sm: { width: 12, height: 12 },
    md: { width: 14, height: 14 },
    lg: { width: 16, height: 16 }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 font-medium ${color} ${sizeClasses[size]}`}
          >
            <Icon {...iconSizes[size]} />
            {showLabel && level}
            {showLabel && score > 0 && <span className="ml-1">({score})</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
          {score > 0 && <p className="text-xs mt-1">Reputation Score: {score}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}