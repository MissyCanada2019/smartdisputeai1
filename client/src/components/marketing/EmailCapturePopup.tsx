import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FunnelTracker, trackFunnelEvent, FUNNEL_STEPS } from './FunnelTracker';

// Define form schema
const emailCaptureSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().optional(),
  message: z.string().optional(),
});

type EmailCaptureFormValues = z.infer<typeof emailCaptureSchema>;

type EmailCapturePopupProps = {
  title: string;
  description?: string;
  funnelName: string;
  resource?: string;
  delay?: number; // Delay in milliseconds before showing the popup
  showOnce?: boolean; // Whether to show the popup only once per session
  showOnExit?: boolean; // Whether to show the popup when the user tries to exit
  buttonText?: string;
  successMessage?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
  triggerButtonText?: string;
  onSuccess?: (data: any) => void;
};

/**
 * A popup component that captures emails and integrates with marketing funnels
 */
export function EmailCapturePopup({
  title,
  description,
  funnelName,
  resource,
  delay = 0,
  showOnce = true,
  showOnExit = false,
  buttonText = 'Subscribe',
  successMessage = 'Thank you for subscribing!',
  children,
  open,
  onOpenChange,
  triggerButton = false,
  triggerButtonText = 'Subscribe',
  onSuccess,
}: EmailCapturePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Controlled vs. uncontrolled dialog handling
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const actualOpen = isControlled ? open : isOpen;
  const setActualOpen = isControlled ? onOpenChange : setIsOpen;
  
  // Setup form
  const form = useForm<EmailCaptureFormValues>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      email: '',
      name: '',
      message: '',
    },
  });
  
  // Show popup after delay
  useState(() => {
    if (delay > 0 && !showOnExit && !triggerButton) {
      const timer = setTimeout(() => {
        // Check if we should show this popup (respect showOnce setting)
        if (showOnce && localStorage.getItem(`popup_shown_${funnelName}_${resource || 'default'}`)) {
          return;
        }
        
        setActualOpen(true);
        
        // Track popup display
        trackFunnelEvent(
          funnelName,
          `popup_view_${resource || 'default'}`,
          { autoDisplay: true, delay },
          FUNNEL_STEPS.INTEREST
        );
        
        // Record that we've shown this popup
        if (showOnce) {
          localStorage.setItem(`popup_shown_${funnelName}_${resource || 'default'}`, 'true');
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle exit intent
  useState(() => {
    if (!showOnExit) return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top of the page
      if (e.clientY <= 0) {
        // Check if we should show this popup (respect showOnce setting)
        if (showOnce && localStorage.getItem(`popup_shown_${funnelName}_${resource || 'default'}`)) {
          return;
        }
        
        setActualOpen(true);
        
        // Track popup display
        trackFunnelEvent(
          funnelName,
          `popup_exit_intent_${resource || 'default'}`,
          { exitIntent: true },
          FUNNEL_STEPS.INTEREST
        );
        
        // Record that we've shown this popup
        if (showOnce) {
          localStorage.setItem(`popup_shown_${funnelName}_${resource || 'default'}`, 'true');
        }
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  // Handle form submission
  const onSubmit = async (values: EmailCaptureFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Track form submission
      trackFunnelEvent(
        funnelName,
        `email_capture_${resource || 'default'}`,
        { email: values.email },
        FUNNEL_STEPS.CONSIDERATION
      );
      
      // Submit to API
      const response = await apiRequest('POST', '/api/marketing/leads', {
        ...values,
        funnelSource: funnelName,
        resourceRequested: resource || null,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      const data = await response.json();
      
      // Show success message
      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: successMessage,
      });
      
      // Custom success handler
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Reset form
      form.reset();
      
      // Close after a delay
      setTimeout(() => {
        setActualOpen(false);
        setIsSuccess(false);
      }, 2500);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'There was a problem submitting the form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Track component view */}
      {actualOpen && (
        <FunnelTracker
          funnelName={funnelName}
          eventName={`popup_shown_${resource || 'default'}`}
          stepName="interest"
          stepNumber={2}
        />
      )}
      
      {/* Custom trigger button */}
      {triggerButton && (
        <Button
          onClick={() => {
            setActualOpen(true);
            // Track button click
            trackFunnelEvent(
              funnelName,
              `popup_trigger_${resource || 'default'}`,
              { manualTrigger: true },
              FUNNEL_STEPS.INTEREST
            );
          }}
        >
          {triggerButtonText}
        </Button>
      )}
      
      {/* Dialog popup */}
      <Dialog open={actualOpen} onOpenChange={setActualOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          {!isSuccess ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="email">Email</Label>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="you@example.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Name (Optional)</Label>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Your name"
                          type="text"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : buttonText}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Thank You!</h3>
                <p className="text-muted-foreground">{successMessage}</p>
              </div>
            </div>
          )}
          
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * A variant of EmailCapturePopup that shows when the user attempts to exit the page
 */
export function ExitIntentPopup(props: Omit<EmailCapturePopupProps, 'showOnExit'>) {
  return <EmailCapturePopup {...props} showOnExit={true} />;
}

/**
 * A variant of EmailCapturePopup that shows after a specified delay
 */
export function DelayedPopup(props: Omit<EmailCapturePopupProps, 'delay'> & { delaySeconds?: number }) {
  const { delaySeconds = 5, ...rest } = props;
  return <EmailCapturePopup {...rest} delay={delaySeconds * 1000} />;
}