import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useOnboarding, JourneyType } from '@/context/onboardingContext';
import { HelpCircle, Play } from 'lucide-react';

interface TutorialButtonProps extends Omit<ButtonProps, 'onClick'> {
  journeyId?: string;
  journeyType?: JourneyType;
  showLabel?: boolean;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const TutorialButton: React.FC<TutorialButtonProps> = ({
  journeyId,
  journeyType,
  showLabel = true,
  label = 'Take Tutorial',
  icon,
  variant = 'outline',
  size = 'sm',
  className,
  ...props
}) => {
  const { availableJourneys, startOnboarding } = useOnboarding();

  const handleClick = () => {
    if (journeyId) {
      startOnboarding(journeyId);
    } else if (journeyType) {
      const journey = availableJourneys.find(j => j.type === journeyType);
      if (journey) {
        startOnboarding(journey.id);
      }
    } else {
      // Default to general journey if no specific journey is specified
      const generalJourney = availableJourneys.find(j => j.type === 'general');
      if (generalJourney) {
        startOnboarding(generalJourney.id);
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {icon ? (
        icon
      ) : (
        <HelpCircle size={size === 'icon' ? 18 : 14} className={showLabel ? 'mr-1' : ''} />
      )}
      {showLabel && label}
    </Button>
  );
};

export default TutorialButton;