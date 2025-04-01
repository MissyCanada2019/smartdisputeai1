import React, { useState } from 'react';
import { X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Define form schema
const leadCaptureSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
});

type LeadCaptureFormValues = z.infer<typeof leadCaptureSchema>;

interface LeadCapturePopupProps {
  title: string;
  description: string;
  resourceName: string;
  funnelSource: string;
  onClose: () => void;
}

export default function LeadCapturePopup({
  title,
  description,
  resourceName,
  funnelSource,
  onClose,
}: LeadCapturePopupProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<LeadCaptureFormValues>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (data: LeadCaptureFormValues & { 
      resourceRequested: string; 
      funnelSource: string;
      funnelName: string; 
    }) => {
      return apiRequest('POST', '/api/marketing/leads', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      
      // Track lead capture event in analytics
      // This could be expanded with your preferred analytics tool
      try {
        // Safe check for Google Tag Manager dataLayer
        const w = window as any;
        if (w.dataLayer) {
          w.dataLayer.push({
            event: 'lead_capture',
            funnelSource: funnelSource,
            resourceRequested: resourceName
          });
        }
      } catch (e) {
        console.log('Analytics tracking not available');
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was a problem submitting your information. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: LeadCaptureFormValues) => {
    createLeadMutation.mutate({
      ...data,
      resourceRequested: resourceName,
      funnelSource: funnelSource,
      funnelName: 'resource_download'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative bg-white dark:bg-slate-900 shadow-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {submitted ? (
          // Success state
          <CardContent className="pt-6 pb-8 text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Thank You!</CardTitle>
            <CardDescription className="mb-6 text-base">
              Your free resource has been sent to your email. Please check your inbox (including spam folder) in the next few minutes.
            </CardDescription>
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            required 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Alert className="bg-slate-100 dark:bg-slate-800 mt-4">
                    <AlertDescription className="text-sm text-muted-foreground">
                      By submitting, you'll receive the requested resource and occasional emails with valuable legal guidance. We respect your privacy and you can unsubscribe anytime.
                    </AlertDescription>
                  </Alert>
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createLeadMutation.isPending}
                    >
                      {createLeadMutation.isPending ? 'Sending...' : 'Get Your Free Resource'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <Separator />
            <CardFooter className="py-3">
              <p className="text-xs text-center w-full text-muted-foreground">
                Your information is secure and will never be shared with third parties.
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}