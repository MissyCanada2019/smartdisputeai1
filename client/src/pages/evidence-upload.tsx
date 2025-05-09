import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useFormState } from "@/lib/formContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authContext";
import ProgressTracker from "@/components/common/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import EvidenceUploader from "@/components/evidence/EvidenceUploader";
import type { EvidenceFile } from "@/components/evidence/EvidenceUploader";
import { apiRequest } from "@/lib/queryClient";

// Form validation schema creator function
// This allows us to create a conditional schema based on authentication status
const createEvidenceFormSchema = (isAuthenticated: boolean) => {
  // Base schema for authenticated and non-authenticated users
  const baseSchema = {
    // Case information
    issueDescription: z.string().min(10, "Please provide a more detailed description of your issue"),
    agency: z.string().optional(),
    province: z.string().min(2, "Please select your province or territory"),
    
    // Contact information
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional()
  };
  
  // If not authenticated, require account creation fields
  if (!isAuthenticated) {
    return z.object({
      ...baseSchema,
      // User account information (only required when not authenticated)
      username: z.string().min(4, "Username must be at least 4 characters"),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
    });
  }
  
  // For authenticated users, make account fields optional
  return z.object({
    ...baseSchema,
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  });
};

// Create a type that includes all possible form fields
// This ensures we have a consistent type regardless of authentication status
type EvidenceFormValues = z.infer<ReturnType<typeof createEvidenceFormSchema>>;

export default function EvidenceUpload() {
  const [formState, setFormState] = useFormState();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth(); // Get authentication state

  // Create temporary anonymous user if needed for uploads
  useEffect(() => {
    const createTemporaryUser = async () => {
      try {
        console.log("Creating temporary user...");
        // Create a temporary user for evidence uploads if not logged in
        const timestamp = Date.now();
        const tempUsername = `temp_${timestamp}`;
        const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
        
        console.log("Attempting to create temporary user with username:", tempUsername);
        
        // Prepare payload for temporary user
        const payload = {
          username: tempUsername,
          password: tempPassword,
          isTemporary: true
        };
        console.log("Sending temporary user payload:", JSON.stringify(payload));
        
        // Make the API request with detailed error handling
        try {
          // Use fetch directly for more control over error handling
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          console.log("Temporary user API response status:", response.status);
          
          // Check if the response is JSON
          const contentType = response.headers.get("content-type");
          let responseBody;
          
          if (contentType && contentType.includes("application/json")) {
            responseBody = await response.json();
            console.log("Received JSON response:", responseBody);
          } else {
            const textResponse = await response.text();
            console.log("Received text response:", textResponse);
            try {
              // Try to parse it as JSON anyway in case the content-type is wrong
              responseBody = JSON.parse(textResponse);
              console.log("Successfully parsed text as JSON:", responseBody);
            } catch (parseError) {
              console.error("Could not parse response as JSON:", parseError);
              throw new Error(`Server returned non-JSON response: ${textResponse}`);
            }
          }
          
          // Handle error response
          if (!response.ok) {
            console.error("API error response:", responseBody);
            throw new Error(`Server error: ${response.status} - ${JSON.stringify(responseBody)}`);
          }
          
          // Handle success
          if (responseBody && responseBody.id) {
            console.log("Temporary user created successfully with ID:", responseBody.id);
            setUserId(responseBody.id);
          } else {
            console.error("Response missing ID field:", responseBody);
            throw new Error("Server returned success but no user ID");
          }
          
        } catch (fetchError: any) {
          console.error("Network or parsing error:", fetchError);
          throw new Error(`API request failed: ${fetchError?.message || 'Unknown error occurred during API request'}`);
        }
      } catch (error: any) {
        console.error("Error creating temporary user:", error);
        toast({
          title: "Upload System Error",
          description: `Could not initialize upload system: ${error.message}. Please refresh the page and try again.`,
          variant: "destructive"
        });
      }
    };
    
    // Only create temp user if we don't already have a userId in state
    if (!userId) {
      console.log("No user ID, creating temporary user...");
      createTemporaryUser();
    } else {
      console.log("User ID already exists:", userId);
    }
  }, [toast, userId]);

  // Create the form schema based on authenticated status
  const evidenceFormSchema = useMemo(() => createEvidenceFormSchema(isAuthenticated), [isAuthenticated]);
  
  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      // User account info
      username: isAuthenticated && user ? user.username : formState.username || "",
      email: isAuthenticated && user ? user.email : formState.email || "",
      password: "",
      firstName: isAuthenticated && user ? user.firstName : formState.firstName || "",
      lastName: isAuthenticated && user ? user.lastName : formState.lastName || "",
      
      // Case information
      issueDescription: formState.issueDescription || "",
      agency: formState.agency || "",
      province: isAuthenticated && user ? user.province || "" : formState.province || "",
      
      // Contact information
      phone: isAuthenticated && user ? user.phone || "" : formState.phone || "",
      address: isAuthenticated && user ? user.address || "" : formState.address || "",
      city: isAuthenticated && user ? user.city || "" : formState.city || "",
      postalCode: isAuthenticated && user ? user.postalCode || "" : formState.postalCode || ""
    }
  });

  // Load saved form data if user is authenticated
  useEffect(() => {
    const loadUserFormData = async () => {
      if (isAuthenticated && user) {
        try {
          // Fetch existing form data from the server
          const response = await fetch('/api/form-data/current/evidence');
          if (response.ok) {
            const formData = await response.json();
            
            // If we have existing form data, update the form with it
            if (formData) {
              console.log('Loaded existing form data for authenticated user:', formData);
              
              // Update form with fetched values
              form.reset({
                ...form.getValues(),
                // Contact information from user profile
                username: user.username || form.getValues().username,
                email: user.email || form.getValues().email,
                firstName: user.firstName || form.getValues().firstName,
                lastName: user.lastName || form.getValues().lastName,
                phone: user.phone || formData.phone || form.getValues().phone,
                address: user.address || formData.address || form.getValues().address,
                city: user.city || formData.city || form.getValues().city,
                postalCode: user.postalCode || formData.postalCode || form.getValues().postalCode,
                province: user.province || formData.province || form.getValues().province,
                
                // Evidence-specific fields
                issueDescription: formData.issueDescription || form.getValues().issueDescription,
                agency: formData.agency || form.getValues().agency
              });
            }
          }
        } catch (error) {
          console.error('Error loading user form data:', error);
        }
      }
    };
    
    if (isAuthenticated && user) {
      loadUserFormData();
    }
  }, [isAuthenticated, user, form]);

  const handleEvidenceUpload = (files: EvidenceFile[]) => {
    setEvidenceFiles(files);
  };

  const onSubmit = async (data: EvidenceFormValues) => {
    // Check if we have files or at least a description
    if (evidenceFiles.length === 0 && data.issueDescription.trim().length < 50) {
      toast({
        title: "More information needed",
        description: "Please either upload some evidence documents or provide a more detailed description of your issue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Create the actual user account
      const newUserResponse = await apiRequest("POST", "/api/users", {
        username: data.username,  // Adding username here
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        province: data.province,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        phone: data.phone,
        isTemporary: false
      });
      
      if (!newUserResponse.ok) {
        throw new Error("Failed to create account. Please try again.");
      }
      
      const newUserData = await newUserResponse.json();
      const permanentUserId = newUserData.id;
      
      // If we previously used a temporary user ID for uploads, we need to associate those files with the new user
      if (userId && userId !== permanentUserId && evidenceFiles.length > 0) {
        // Transfer ownership of uploaded files to the permanent user account
        await apiRequest("PATCH", `/api/evidence-files/transfer/${userId}/${permanentUserId}`, {});
      }
      
      // Save all form data to state
      setFormState({
        ...formState,
        // User info
        username: data.username,  // Add username here
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        
        // Issue info
        issueDescription: data.issueDescription,
        agency: data.agency,
        province: data.province,
        
        // Evidence info
        evidenceFileIds: evidenceFiles.map(file => file.id),
        evidence: {
          files: evidenceFiles,
          description: data.issueDescription
        },
        
        // Set permanent user ID
        userId: permanentUserId,
        
        // Set current step
        currentStep: 1
      });
      
      // If we have evidence files, analyze them with the permanent user ID
      if (evidenceFiles.length > 0) {
        // Get file IDs from evidence files
        const evidenceIds = evidenceFiles.map(file => file.id);
        
        // Request case analysis based on the evidence
        const analysisResponse = await apiRequest("POST", "/api/case-analyses/by-evidence", {
          userId: permanentUserId,
          evidenceIds: evidenceIds,
          description: data.issueDescription
        });
        
        if (!analysisResponse.ok) {
          throw new Error("Failed to analyze your case");
        }
        
        const analysisData = await analysisResponse.json();
        
        // Update form state with analysis data
        const updatedState = {
          ...formState,
          caseAnalysis: analysisData,
          recommendedForms: analysisData.recommendedForms || []
        };
        setFormState(updatedState);
        
        toast({
          title: "Analysis complete",
          description: "We've analyzed your evidence and prepared recommendations"
        });
      }
      
      // Skip the user-info step since we already collected that info here
      // Go directly to document selection
      navigate("/document-selection?recommended=true");
      
    } catch (error: any) {
      console.error("Error in evidence submission:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem processing your information",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const provinces = [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" }
  ];

  const agencies = [
    { value: "landlord", label: "Landlord or Property Management" },
    { value: "ltb", label: "Landlord and Tenant Board" },
    { value: "cas", label: "Children's Aid Society" },
    { value: "equifax", label: "Equifax or Credit Bureau" },
    { value: "shelter", label: "Shelter or Housing Service" },
    { value: "court", label: "Court System" },
    { value: "police", label: "Police" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={1} />

      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {isAuthenticated ? 'Upload Your Evidence' : 'Create Your Account'}
        </h1>
        <p className="text-gray-600">
          {isAuthenticated 
            ? 'Upload and analyze your evidence to receive personalized legal recommendations'
            : 'Sign up to access personalized legal assistance and document recommendations'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Evidence</CardTitle>
              <CardDescription>
                Upload documents, photos, or any relevant evidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidenceUploader 
                userId={userId || 0} 
                onUploadComplete={handleEvidenceUpload}
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
              <CardDescription>
                Tell us more about the situation you're facing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Issue Description Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium border-b pb-2 mb-4">Issue Details</h3>
                    <FormField
                      control={form.control}
                      name="issueDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What issue are you facing? <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your situation in detail. What happened? When did it happen? Who was involved?" 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="agency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Which agency or entity are you dealing with?</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select agency or entity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {agencies.map((agency) => (
                                  <SelectItem key={agency.value} value={agency.value}>
                                    {agency.label}
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
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Province/Territory <span className="text-red-500">*</span></FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your province/territory" />
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
                  </div>

                  {/* Display existing user information if authenticated */}
                  {isAuthenticated && user && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-blue-800">
                        You're signed in as <span className="font-semibold">{user.email}</span>. 
                        Any evidence you upload will be associated with your account.
                      </p>
                    </div>
                  )}
                  
                  {/* Contact Information Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium border-b pb-2 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <input
                                type="tel"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="(555) 555-5555"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="123 Main St"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Toronto"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="A1A 1A1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* New Account Form Section - Only show if not logged in */}
                  {!isAuthenticated && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Create Your Account</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <input
                                    type="text"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="John"
                                    {...field}
                                  />
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
                                  <input
                                    type="text"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Doe"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <input
                                  type="text"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="johndoe123"
                                  {...field}
                                />
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
                              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <input
                                  type="email"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="john.doe@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <input
                                  type="password"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? 'Analyzing Your Evidence...' : isAuthenticated ? 'Analyze Evidence & Continue' : 'Create Account & Continue'}
                    </Button>
                  </div>
                  
                  {!isAuthenticated && (
                    <div className="mt-6 text-center">
                      <span className="text-sm text-gray-500">Already have an account? </span>
                      <Link href="/login" className="text-primary hover:underline text-sm font-medium">
                        Login Instead
                      </Link>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Why Start With Evidence?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 rounded-lg p-4 border-l-4 border-info">
                <AlertTitle className="font-medium text-info mb-2 flex items-center">
                  <Info className="mr-1 h-4 w-4" /> Better Recommendations
                </AlertTitle>
                <AlertDescription className="text-sm text-gray-600">
                  Uploading your evidence first helps us analyze your case and recommend the most effective legal documents for your specific situation.
                </AlertDescription>
              </Alert>

              <div className="text-sm space-y-2 text-gray-600">
                <p><strong>Your privacy matters:</strong> All documents are encrypted and your information is kept confidential.</p>
                <p><strong>Time-saving:</strong> By analyzing your evidence first, we can pre-fill many fields in the forms and documents you'll need.</p>
                <p><strong>Location-specific:</strong> Providing your province ensures you receive legally appropriate documents for your jurisdiction.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}