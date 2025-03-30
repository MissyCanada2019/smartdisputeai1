import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useFunnelTracker, FUNNEL_STEPS } from './FunnelTracker';

// Base lead form schema
const baseLeadFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Extended schema for non-compact forms
const leadFormSchema = baseLeadFormSchema.extend({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  province: z.string().optional(),
  message: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type LeadMagnetFormProps = {
  title: string;
  description?: string;
  funnelName: string;
  resource?: string;
  source?: string;
  interests?: Record<string, any>;
  onSuccess?: (data: any) => void;
  emailLabel?: string;
  showNameFields?: boolean;
  showMessage?: boolean;
  showProvinceField?: boolean;
  showPhoneField?: boolean;
  buttonText?: string;
  className?: string;
  compact?: boolean;
};

// Province options for Canada
const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' }
];

export function LeadMagnetForm({
  title,
  description,
  funnelName,
  resource,
  source,
  interests,
  onSuccess,
  emailLabel = 'Email address',
  showNameFields = true,
  showMessage = false,
  showProvinceField = true,
  showPhoneField = true,
  buttonText = 'Get Access',
  className,
  compact = false,
}: LeadMagnetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const trackFunnelEvent = useFunnelTracker(funnelName);
  
  // Initialize react-hook-form
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      province: '',
      message: '',
      termsAccepted: false,
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Track form submission attempt
      trackFunnelEvent('lead_form_submit_attempt', {
        email: values.email,
        resource,
        source,
      }, FUNNEL_STEPS.CONSIDERATION);
      
      // Send data to API
      const response = await apiRequest('POST', '/api/marketing/leads', {
        email: values.email,
        name: showNameFields ? `${values.firstName} ${values.lastName}`.trim() : null,
        message: showMessage ? values.message : null,
        resourceRequested: resource || null,
        funnelSource: funnelName,
        interests,
        source,
        // Extended fields for more detailed lead info
        firstName: values.firstName || null,
        lastName: values.lastName || null,
        phone: showPhoneField ? values.phone : null,
        province: showProvinceField ? values.province : null,
      });
      
      const data = await response.json();
      
      // Track successful submission
      trackFunnelEvent('lead_form_submit_success', {
        leadId: data.id,
        email: values.email,
        resource,
        source,
      }, FUNNEL_STEPS.CONVERSION);
      
      // Show success state
      setIsSuccess(true);
      
      // Success notification
      toast({
        title: 'Success!',
        description: 'Thank you for your submission. We\'ll be in touch shortly.',
        variant: 'default',
      });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Track failure
      trackFunnelEvent('lead_form_submit_failure', {
        email: values.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        resource,
        source,
      }, FUNNEL_STEPS.CONSIDERATION);
      
      // Show error notification
      toast({
        title: 'Error',
        description: 'There was a problem submitting your information. Please try again.',
        variant: 'destructive',
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Success message component
  const SuccessMessage = () => (
    <div className="text-center p-4">
      <div className="mb-4 h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
      <h3 className="text-lg font-medium mb-2">Thank you!</h3>
      <p className="text-muted-foreground mb-4">
        We've received your information and will be in touch shortly.
      </p>
      {resource && (
        <Button
          onClick={() => {
            trackFunnelEvent('lead_magnet_accessed', {
              resource,
              source,
            }, FUNNEL_STEPS.CONVERSION);
            
            // Here you could also add logic to download a resource or redirect
          }}
        >
          {compact ? 'Access Resource' : `Access Your ${resource}`}
        </Button>
      )}
    </div>
  );
  
  // Show success message if form was successfully submitted
  if (isSuccess) {
    return <SuccessMessage />;
  }
  
  // Show compact form for inline/sidebar usage
  if (compact) {
    return (
      <div className={className}>
        {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder={emailLabel}
              {...form.register('email')}
              className={form.formState.errors.email ? 'border-red-500' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms-compact"
              {...form.register('termsAccepted')}
              className={form.formState.errors.termsAccepted ? 'border-red-500' : ''}
            />
            <label htmlFor="terms-compact" className="text-xs">
              I agree to receive communications from SmartDispute.ai
            </label>
          </div>
          {form.formState.errors.termsAccepted && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.termsAccepted.message}
            </p>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : buttonText}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We respect your privacy and will never share your information.
          </p>
        </form>
      </div>
    );
  }
  
  // Show full form for standalone usage
  return (
    <div className={className}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {showNameFields && (
              <>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{emailLabel}</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-4 md:grid-cols-2">
            {showPhoneField && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {showProvinceField && (
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province (optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province.value} value={province.value}>
                            {province.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          {showMessage && (
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us what specific legal assistance you need..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to receive communications from SmartDispute.ai Canada
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    We'll use your information to provide the requested resources and keep you updated
                    about our services. You can unsubscribe at any time.
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : buttonText}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Your information is secure and we will never share it with third parties.
          </p>
        </form>
      </Form>
    </div>
  );
}

// Helper functions
export function getProvinceFullName(province: string): string {
  const found = PROVINCES.find(p => p.value === province);
  return found ? found.label : province;
}