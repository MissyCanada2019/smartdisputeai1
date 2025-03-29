import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserInfoFormValues, userInfoFormSchema, provinces } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useFormState } from "@/lib/formContext";
import { useLocation } from "wouter";
import { useState } from "react";

export default function UserInfoForm() {
  const [formState, setFormState] = useFormState();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoFormSchema),
    defaultValues: formState.userInfo || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      incomeRange: "",
      requestIncomeBased: false
    }
  });
  
  const onSubmit = (data: UserInfoFormValues) => {
    try {
      setErrorMessage(null);
      setFormState({
        ...formState,
        userInfo: data,
        currentStep: 2
      });
      
      toast({
        title: "Personal information saved",
        description: "Moving to document selection."
      });
      
      navigate("/document-selection");
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage("An error occurred while saving your information. Please try again.");
      toast({
        title: "Error",
        description: "There was a problem saving your information.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}
        {/* Personal Details Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Personal Details</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mb-4">
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Address Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Address Information</h3>
          
          <div className="mb-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province/Territory <span className="text-red-500">*</span></FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Province" />
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
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Income Verification */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
            Income Information <span className="text-xs text-gray-500 font-normal">(for sliding scale payment options)</span>
          </h3>
          
          <div className="mb-4">
            <FormField
              control={form.control}
              name="incomeRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Income Range</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Income Range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="belowLIPThreshold">Below LICO Threshold</SelectItem>
                      <SelectItem value="0-30000">$0 - $30,000</SelectItem>
                      <SelectItem value="30001-50000">$30,001 - $50,000</SelectItem>
                      <SelectItem value="50001-75000">$50,001 - $75,000</SelectItem>
                      <SelectItem value="75001-100000">$75,001 - $100,000</SelectItem>
                      <SelectItem value="above100000">Above $100,000</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mb-4">
            <FormField
              control={form.control}
              name="requestIncomeBased"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I would like to request income-based fee reduction</FormLabel>
                    <p className="text-sm text-gray-500">
                      You may be asked to provide documentation to verify your income.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Back
          </Button>
          <Button type="submit">
            Continue to Document Selection
          </Button>
        </div>
      </form>
    </Form>
  );
}
