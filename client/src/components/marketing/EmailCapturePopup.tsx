import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useFunnelTracker } from './FunnelTracker';
import { FUNNEL_STEPS } from './FunnelTracker';

// Schema validation for email capture form
const emailCaptureSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
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

export function EmailCapturePopup({
  title,
  description,
  funnelName,
  resource,
  delay = 5000, // 5 seconds default delay
  showOnce = true,
  showOnExit = false,
  buttonText = 'Subscribe',
  successMessage = 'Thank you for subscribing!',
  children,
  open: controlledOpen,
  onOpenChange,
  triggerButton = false,
  triggerButtonText = 'Subscribe',
  onSuccess,
}: EmailCapturePopupProps) {
  // State for controlled/uncontrolled dialog
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  // We'll use either the controlled state from props, or our internal state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;
  
  // Track if user has closed this popup before
  const [hasClosedBefore, setHasClosedBefore] = useState(false);
  // Track if user has submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Toast notification
  const { toast } = useToast();
  
  // Funnel tracking
  const trackFunnelEvent = useFunnelTracker(funnelName);
  
  // Init form
  const form = useForm<EmailCaptureFormValues>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Check local storage for whether user has seen this popup
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem(`email_popup_${funnelName}`);
    
    if (hasSeenPopup && showOnce) {
      setHasClosedBefore(true);
    }
  }, [funnelName, showOnce]);
  
  // Set up delayed popup
  useEffect(() => {
    if (delay && !triggerButton && !hasClosedBefore && !hasSubmitted && !showOnExit) {
      const timer = setTimeout(() => {
        setOpen(true);
        trackFunnelEvent('popup_shown', {
          title,
          resource,
          trigger: 'delay',
        }, FUNNEL_STEPS.INTEREST);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay, funnelName, hasClosedBefore, hasSubmitted, setOpen, showOnExit, title, trackFunnelEvent, triggerButton, resource]);
  
  // Set up exit intent detection
  useEffect(() => {
    if (showOnExit && !hasClosedBefore && !hasSubmitted) {
      const handleMouseLeave = (e: MouseEvent) => {
        // Only trigger when mouse leaves to the top of the page
        if (e.clientY <= 0) {
          setOpen(true);
          trackFunnelEvent('popup_shown', {
            title,
            resource,
            trigger: 'exit_intent',
          }, FUNNEL_STEPS.INTEREST);
        }
      };
      
      document.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [funnelName, hasClosedBefore, hasSubmitted, setOpen, showOnExit, title, trackFunnelEvent, resource]);
  
  // Handle form submission
  const onSubmit = async (values: EmailCaptureFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Track submission attempt
      trackFunnelEvent('popup_submit_attempt', { 
        email: values.email,
        resource,
        location: window.location.pathname,
      }, FUNNEL_STEPS.CONSIDERATION);
      
      // Submit to API
      const response = await apiRequest('POST', '/api/marketing/leads', {
        email: values.email,
        name: null,
        funnelSource: funnelName,
        resourceRequested: resource || null,
      });
      
      const data = await response.json();
      
      // Track successful submission
      trackFunnelEvent('popup_submit_success', {
        resource,
        leadId: data.id,
        email: values.email,
      }, FUNNEL_STEPS.CONVERSION);
      
      // Show success state
      setIsSuccess(true);
      setHasSubmitted(true);
      
      // Save to localStorage to not show again if showOnce is true
      if (showOnce) {
        localStorage.setItem(`email_popup_${funnelName}`, 'true');
      }
      
      // Show success toast
      toast({
        title: 'Success!',
        description: successMessage,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Close dialog after a delay to let user see success message
      setTimeout(() => {
        setOpen(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting email:', error);
      
      // Track failure
      trackFunnelEvent('popup_submit_failure', {
        email: values.email,
        resource,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, FUNNEL_STEPS.CONSIDERATION);
      
      // Show error toast
      toast({
        title: 'Error',
        description: 'There was a problem submitting your email. Please try again.',
        variant: 'destructive',
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dialog close
  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    
    if (!openState && !hasClosedBefore && !hasSubmitted) {
      setHasClosedBefore(true);
      
      if (showOnce) {
        localStorage.setItem(`email_popup_${funnelName}`, 'true');
      }
      
      // Track close event
      trackFunnelEvent('popup_dismissed', {
        title,
        resource,
      }, FUNNEL_STEPS.INTEREST);
    }
  };
  
  // When triggered via button, we track that separately
  const handleTriggerClick = () => {
    trackFunnelEvent('popup_triggered', {
      title,
      resource,
      trigger: 'button',
    }, FUNNEL_STEPS.INTEREST);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild onClick={handleTriggerClick}>
          <Button variant="default">{triggerButtonText}</Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Thank You!</h3>
              <p className="text-muted-foreground">{successMessage}</p>
            </div>
          ) : (
            <>
              {children}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            type="email"
                            autoFocus
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between items-center">
                    <DialogClose asChild>
                      <Button type="button" variant="ghost" size="sm">
                        No Thanks
                      </Button>
                    </DialogClose>
                    
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : buttonText}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    We respect your privacy and will never share your information.
                  </p>
                </form>
              </Form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// A wrapper for the popup that will show using exit intent
export function ExitIntentPopup(props: Omit<EmailCapturePopupProps, 'showOnExit'>) {
  return <EmailCapturePopup {...props} showOnExit={true} />;
}

// A wrapper for the popup that will show after a delay 
export function DelayedPopup(props: Omit<EmailCapturePopupProps, 'delay'> & { delaySeconds?: number }) {
  const { delaySeconds = 5, ...rest } = props;
  return <EmailCapturePopup {...rest} delay={delaySeconds * 1000} />;
}