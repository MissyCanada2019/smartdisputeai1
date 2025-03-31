import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { hubSpotChatbotControls } from './HubSpotChatbot';
import { useHubSpotTracking } from '@/hooks/use-hubspot-tracking';

interface HubSpotChatButtonProps extends ButtonProps {
  buttonText?: string;
  showIcon?: boolean;
  trackInteraction?: boolean;
}

/**
 * Button component that opens the HubSpot chatbot when clicked
 */
export function HubSpotChatButton({
  buttonText = 'Chat with Us',
  showIcon = true,
  trackInteraction = true,
  className,
  ...props
}: HubSpotChatButtonProps) {
  const { trackButtonClick } = useHubSpotTracking();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Open the chatbot
    hubSpotChatbotControls.open();
    
    // Track the interaction if enabled
    if (trackInteraction) {
      trackButtonClick('open_chatbot', {
        location: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Call the original onClick handler if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return (
    <Button
      variant="default"
      className={`flex items-center space-x-2 ${className || ''}`}
      {...props}
      onClick={handleClick}
    >
      {showIcon && <MessageSquare className="h-4 w-4" />}
      {buttonText && <span>{buttonText}</span>}
    </Button>
  );
}