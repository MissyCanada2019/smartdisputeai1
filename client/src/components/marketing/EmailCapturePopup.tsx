import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FunnelTracker, FUNNEL_STEPS } from './FunnelTracker';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Please enter your name' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmailCapturePopupProps {
  title: string;
  description: string;
  funnelName: string;
  resource: string;
  buttonText?: string;
  showNameField?: boolean;
  successMessage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EmailCapturePopup({
  title,
  description,
  funnelName,
  resource,
  buttonText = 'Submit',
  showNameField = true,
  successMessage = 'Thank you for subscribing!',
  open,
  onOpenChange,
  onSuccess
}: EmailCapturePopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Track the lead with the marketing funnel
      await apiRequest('POST', '/api/marketing/leads', {
        email: data.email,
        name: data.name || undefined,
        resourceRequested: resource,
        funnelSource: funnelName,
      });
      
      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: successMessage,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset the form
      form.reset();
      
      // Close the popup after a delay
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'There was a problem submitting your information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <FunnelTracker 
            funnelName={funnelName}
            eventName={`popup_view_${resource}`}
            stepName="interest"
            stepNumber={2}
          />
        )}
        
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {showNameField && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        {...field} 
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : buttonText}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-6 text-center">
            <div className="mb-4 text-green-500">
              <svg 
                className="w-16 h-16 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <p className="text-lg font-medium">{successMessage}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}