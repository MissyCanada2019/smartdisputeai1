import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useFunnelTracker } from './FunnelTracker';
import { FUNNEL_STEPS } from './FunnelTracker';

// Schema for the lead form
const leadFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  province: z.string().optional(),
  message: z.string().optional(),
  interests: z.record(z.boolean()).optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

// Canadian provinces
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
  { value: 'YT', label: 'Yukon' },
];

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

export function LeadMagnetForm({
  title,
  description,
  funnelName,
  resource,
  source = 'website',
  interests = {},
  onSuccess,
  emailLabel = 'Email Address',
  showNameFields = true,
  showMessage = false,
  showProvinceField = true,
  showPhoneField = false,
  buttonText = 'Get Access',
  className = '',
  compact = false,
}: LeadMagnetFormProps) {
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Track funnel events
  const trackFunnelEvent = useFunnelTracker(funnelName);
  
  // Checkbox interests from props
  const interestOptions = Object.entries(interests).map(([key, label]) => ({
    id: key,
    label: label as string,
  }));

  // Initialize form
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      province: '',
      message: '',
      interests: interestOptions.reduce((acc, option) => {
        acc[option.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      acceptTerms: false,
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Track submission attempt
      trackFunnelEvent('lead_form_submit_attempt', { 
        resource,
        source,
        email: values.email,
        location: window.location.pathname,
      }, FUNNEL_STEPS.CONSIDERATION);
      
      // Transform selected interests into an array
      const selectedInterests = values.interests 
        ? Object.entries(values.interests)
            .filter(([_, selected]) => selected)
            .map(([key]) => key)
        : [];
      
      // Submit the data to the leads API
      const response = await apiRequest('POST', '/api/marketing/leads', {
        email: values.email,
        name: showNameFields 
          ? `${values.firstName || ''} ${values.lastName || ''}`.trim() 
          : null,
        message: showMessage ? values.message : null,
        funnelSource: funnelName,
        resourceRequested: resource || null,
        // These fields might not be in the DB schema, but including them in metadata
        firstName: values.firstName || null,
        lastName: values.lastName || null,
        phone: showPhoneField ? values.phone : null,
        province: showProvinceField ? values.province : null,
        interests: selectedInterests.length > 0 ? selectedInterests : null,
        source,
      });
      
      const data = await response.json();
      
      // Track successful submission 
      trackFunnelEvent('lead_form_submit_success', {
        resource,
        leadId: data.id,
        email: values.email,
        source,
      }, FUNNEL_STEPS.CONVERSION);
      
      // Show success state
      setIsSuccess(true);
      
      // Show toast
      toast({
        title: 'Success!',
        description: resource 
          ? `Thank you! We've sent the ${resource} to your email.` 
          : 'Thank you for your submission!',
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Error submitting lead form:', error);
      
      // Track failure
      trackFunnelEvent('lead_form_submit_failure', {
        resource,
        email: values.email,
        source,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, FUNNEL_STEPS.CONSIDERATION);
      
      // Show error toast
      toast({
        title: 'Error',
        description: 'There was a problem submitting your information. Please try again.',
        variant: 'destructive',
      });
      
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
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
          <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
          <p className="text-muted-foreground">
            {resource 
              ? `We've sent the ${resource} to your email.`
              : 'Your submission has been received.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your inbox (and spam folder) for further instructions.
          </p>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className={`bg-white rounded-lg shadow-sm ${compact ? 'p-4' : 'p-6'} ${className}`}>
      {title && <h2 className={`font-semibold ${compact ? 'text-lg mb-2' : 'text-xl mb-4'}`}>{title}</h2>}
      {description && <p className={`text-muted-foreground ${compact ? 'text-sm mb-3' : 'mb-4'}`}>{description}</p>}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields (conditional) */}
          {showNameFields && (
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          )}
          
          {/* Email field (always shown) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{emailLabel}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your@email.com" 
                    type="email"
                    autoComplete="email"
                    required
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Phone field (conditional) */}
          {showPhoneField && (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(123) 456-7890" 
                      type="tel"
                      autoComplete="tel"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Province field (conditional) */}
          {showProvinceField && (
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
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
          
          {/* Message field (conditional) */}
          {showMessage && (
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Let us know any specific questions or details..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Interest checkboxes (conditional) */}
          {interestOptions.length > 0 && (
            <div className="space-y-3">
              <FormLabel>Interests (optional)</FormLabel>
              <div className="grid grid-cols-1 gap-2">
                {interestOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name={`interests.${option.id}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-sm cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Terms checkbox (always shown) */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    required
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm cursor-pointer">
                    I agree to receive emails from SmartDispute.ai, including the{' '}
                    {resource ? `${resource} and ` : ''}
                    promotional content. You can unsubscribe anytime.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : buttonText}
          </Button>
          
          {/* Privacy note */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            We respect your privacy and will never share your information.
          </p>
        </form>
      </Form>
    </div>
  );
}