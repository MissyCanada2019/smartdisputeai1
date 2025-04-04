import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

// Form schema definition
const requestSchema = z.object({
  fullName: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  incomeType: z.enum(["government", "lowIncome", "student", "other"], {
    required_error: "Please select an income type",
  }),
  reasonForAccess: z.string().min(10, { message: "Please provide a brief explanation" }),
  agreeToVerify: z.boolean().refine((val) => val === true, {
    message: "You must agree to provide verification documentation",
  }),
});

type RequestValues = z.infer<typeof requestSchema>;

interface RequestAccessFormProps {
  onSuccess: () => void;
}

export default function RequestAccessForm({ onSuccess }: RequestAccessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      incomeType: "lowIncome",
      reasonForAccess: "",
      agreeToVerify: false,
    },
  });

  const onSubmit = async (data: RequestValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would send the form data to your backend
      // For now we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Access Request Submitted!",
        description: "We'll review your request and get back to you via email within 1-2 business days.",
      });
      
      // Call the success callback
      onSuccess();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your request couldn't be submitted. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
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
        
        <FormField
          control={form.control}
          name="incomeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Income Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="government">Government Assistance Recipient</SelectItem>
                  <SelectItem value="lowIncome">Low Income Household</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the option that best describes your current situation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reasonForAccess"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Request</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please briefly explain why you're applying for the low-income plan..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="agreeToVerify"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to provide verification documentation
                </FormLabel>
                <FormDescription>
                  You may be asked to provide proof of income, government assistance, or student status.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
}