import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useHubSpotTracking } from '@/hooks/use-hubspot-tracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Define form schema with validation
const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  province: z.string().min(1, 'Province is required'),
  legalIssueType: z.string().min(1, 'Legal issue type is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consentToContact: z.boolean().refine(value => value === true, {
    message: 'You must consent to be contacted',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Canadian provinces
const provinces = [
  { value: 'alberta', label: 'Alberta' },
  { value: 'british_columbia', label: 'British Columbia' },
  { value: 'manitoba', label: 'Manitoba' },
  { value: 'new_brunswick', label: 'New Brunswick' },
  { value: 'newfoundland', label: 'Newfoundland and Labrador' },
  { value: 'northwest_territories', label: 'Northwest Territories' },
  { value: 'nova_scotia', label: 'Nova Scotia' },
  { value: 'nunavut', label: 'Nunavut' },
  { value: 'ontario', label: 'Ontario' },
  { value: 'pei', label: 'Prince Edward Island' },
  { value: 'quebec', label: 'Quebec' },
  { value: 'saskatchewan', label: 'Saskatchewan' },
  { value: 'yukon', label: 'Yukon' },
];

// Legal issue types
const legalIssueTypes = [
  { value: 'family_law', label: 'Family Law' },
  { value: 'housing', label: 'Housing & Tenancy' },
  { value: 'employment', label: 'Employment Law' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'consumer_protection', label: 'Consumer Protection' },
  { value: 'human_rights', label: 'Human Rights' },
  { value: 'criminal', label: 'Criminal Law' },
  { value: 'other', label: 'Other Legal Issue' },
];

interface HubSpotContactFormProps {
  formTitle?: string;
  formDescription?: string;
  onSubmitSuccess?: (data: FormValues) => void;
}

export function HubSpotContactForm({
  formTitle = 'Contact Us',
  formDescription = 'Fill out this form and our team will get back to you shortly.',
  onSubmitSuccess,
}: HubSpotContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const { trackFormSubmission } = useHubSpotTracking();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      province: '',
      legalIssueType: '',
      message: '',
      consentToContact: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Submit form data to HubSpot via their tracking code
      if (typeof window !== 'undefined' && (window as any)._hsq) {
        // Track the form submission in our custom event tracking
        trackFormSubmission('contact_form', data);
        
        // Use HubSpot's identify API to associate this submission with a contact
        (window as any)._hsq.push(['identify', {
          email: data.email,
          firstname: data.firstName,
          lastname: data.lastName,
          phone: data.phoneNumber || '',
          province: data.province,
          legal_issue_type: data.legalIssueType,
        }]);
        
        // Submit the form data to HubSpot
        (window as any)._hsq.push(['submitForm', {
          formId: 'contact_form',
          formInstanceId: 'contact_form_instance',
          fields: [
            { name: 'email', value: data.email },
            { name: 'firstname', value: data.firstName },
            { name: 'lastname', value: data.lastName },
            { name: 'phone', value: data.phoneNumber || '' },
            { name: 'province', value: data.province },
            { name: 'legal_issue_type', value: data.legalIssueType },
            { name: 'message', value: data.message },
          ],
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: 'I agree to allow SmartDispute.ai to store and process my personal data.',
              communications: [
                {
                  value: data.consentToContact,
                  subscriptionTypeId: 999,
                  text: 'I agree to receive marketing communications from SmartDispute.ai',
                },
              ],
            },
          },
        }]);
        
        setSubmissionStatus('success');
        
        // Call the onSubmitSuccess callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(data);
        }
      } else {
        console.error('HubSpot tracking code not loaded');
        setSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form to HubSpot:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and status when user wants to try again
  const handleReset = () => {
    form.reset();
    setSubmissionStatus(null);
  };

  // Show success message if form was submitted successfully
  if (submissionStatus === 'success') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <CardTitle>Thank You!</CardTitle>
            <CardDescription className="text-base">
              Your message has been submitted successfully. Our team will get back to you shortly.
            </CardDescription>
            <Button onClick={handleReset} className="mt-4">
              Submit Another Message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {submissionStatus === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error submitting your form. Please try again or contact us directly.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
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

              <FormField
                control={form.control}
                name="legalIssueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Issue Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {legalIssueTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe your legal issue or question..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consentToContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I consent to be contacted by SmartDispute.ai about my legal issue
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}