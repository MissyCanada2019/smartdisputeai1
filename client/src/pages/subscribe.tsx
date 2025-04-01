import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { AlertCircle, Check, Loader2, Info, Upload, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// HubSpot Payments Component
const HubSpotPaymentsEmbed = ({ planName, planAmount }: { planName: string, planAmount: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if the script already exists to avoid duplicates
    if (!document.getElementById('hubspot-payments-script')) {
      // Create and load the HubSpot Payments embed script
      const script = document.createElement('script');
      script.id = 'hubspot-payments-script';
      script.src = "https://static.hsappstatic.net/payments-embed/ex/PaymentsEmbedCode.js";
      script.type = "text/javascript";
      script.async = true;
      
      script.onload = () => {
        console.log("HubSpot Payments script loaded successfully");
        setScriptLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error("Failed to load HubSpot Payments script:", error);
        toast({
          title: "Payment System Error",
          description: "There was an issue loading the payment system. Please refresh the page and try again.",
          variant: "destructive",
        });
      };
      
      document.body.appendChild(script);
    } else {
      // Script already exists
      setScriptLoaded(true);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Complete your {planName} purchase</h3>
      <p className="text-sm text-gray-500">Secure payment processing by HubSpot Payments</p>
      
      {/* HubSpot Payments Embed Container */}
      <div 
        ref={containerRef}
        className="payments-iframe-container" 
        data-src="https://app-na3.hubspot.com/payments/6KCgXjp4?referrer=PAYMENT_LINK_EMBED&layout=embed-full"
      ></div>
      
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Your payment is secure and encrypted.</p>
        <p>For questions regarding your payment, please contact support.</p>
      </div>
    </div>
  );
};

// Income Verification Dialog Component
const IncomeVerificationDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  planType
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (formData: FormData) => void;
  planType: 'low_income' | 'disability' | 'agency'
}) => {
  const [verificationMethod, setVerificationMethod] = useState<'upload' | 'declaration'>('declaration');
  const [fileSelected, setFileSelected] = useState(false);
  const [selfDeclared, setSelfDeclared] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(e.target.files ? e.target.files.length > 0 : false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    if (verificationMethod === 'upload' && fileInputRef.current?.files?.length) {
      formData.append('verification_document', fileInputRef.current.files[0]);
      formData.append('verificationType', planType);
      formData.append('selfDeclaration', 'false');
    } else {
      formData.append('verificationType', planType);
      formData.append('selfDeclaration', 'true');
    }
    
    onSubmit(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verification Required</DialogTitle>
          <DialogDescription>
            {planType === 'low_income' && 'Please provide verification of your low-income status to qualify for this rate.'}
            {planType === 'disability' && 'Please provide verification of your disability status to qualify for this rate.'}
            {planType === 'agency' && 'Please provide verification of your agency or advocate status to qualify for this rate.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="declaration" onValueChange={(v) => setVerificationMethod(v as 'upload' | 'declaration')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="declaration">Self Declaration</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
          </TabsList>
          
          <TabsContent value="declaration" className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="border p-4 rounded-md bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="declaration" checked={selfDeclared} onCheckedChange={(checked) => setSelfDeclared(checked === true)} />
                    <div>
                      <Label htmlFor="declaration" className="text-sm font-medium">
                        I declare that I qualify for the{' '}
                        {planType === 'low_income' && 'low-income'}
                        {planType === 'disability' && 'disability'}
                        {planType === 'agency' && 'agency/advocate'}
                        {' '}rate.
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        By checking this box, I affirm that my financial situation qualifies me for this discounted rate, and I understand that false declarations may result in termination of services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={!selfDeclared}>Submit Declaration</Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="upload" className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <div className="text-sm">
                  <label htmlFor="file-upload" className="relative cursor-pointer text-primary hover:text-primary-dark">
                    <span>Upload a document</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
                {fileSelected && (
                  <div className="mt-2 text-xs font-medium text-green-600">
                    <FileText className="inline-block h-4 w-4 mr-1" />
                    File selected
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Acceptable documents include:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {planType === 'low_income' && (
                    <>
                      <li>Proof of social assistance</li>
                      <li>Recent tax assessment notice</li>
                      <li>Letter from community organization</li>
                    </>
                  )}
                  {planType === 'disability' && (
                    <>
                      <li>Disability benefit statements</li>
                      <li>Medical professional's letter</li>
                      <li>Disability tax credit certificate</li>
                    </>
                  )}
                  {planType === 'agency' && (
                    <>
                      <li>Professional license</li>
                      <li>Employment verification from legal aid</li>
                      <li>Organizational letterhead</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={!fileSelected}>Upload & Submit</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default function Subscribe() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<
    "standard_monthly" | 
    "standard_annual" | 
    "standard_document" | 
    "low_income_monthly" | 
    "low_income_annual" | 
    "low_income_document" |
    "disability_monthly" |
    "disability_annual" |
    "disability_document" |
    "agency_monthly" |
    "agency_annual"
  >("standard_monthly");
  const [planAmount, setPlanAmount] = useState(50);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationPlanType, setVerificationPlanType] = useState<'low_income' | 'disability' | 'agency'>('low_income');
  const [verificationComplete, setVerificationComplete] = useState({
    low_income: false,
    disability: false,
    agency: false
  });
  
  // Handle verification submission
  const handleVerificationSubmit = (formData: FormData) => {
    setIsLoading(true);
    
    // Create a fetch request to send FormData
    fetch("/api/income-verification", {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        setVerificationDialogOpen(false);
        
        if (data.verified) {
          // Update verification status based on the type
          setVerificationComplete(prev => ({
            ...prev,
            [verificationPlanType]: true
          }));
          
          toast({
            title: "Verification Complete",
            description: "You've been verified for the discounted rate.",
          });
        } else {
          toast({
            title: "Verification Pending",
            description: "Your verification is being reviewed. This may take up to 24 hours.",
          });
        }
        
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Verification Error:", error);
        toast({
          title: "Verification Failed",
          description: "There was an error processing your verification. Please try again.",
          variant: "destructive",
        });
        setVerificationDialogOpen(false);
        setIsLoading(false);
      });
  };
  
  useEffect(() => {
    // Skip loading payment info if verification is needed but not completed
    const needsVerification = 
      (selectedPlan.startsWith('low_income_') && !verificationComplete.low_income) ||
      (selectedPlan.startsWith('disability_') && !verificationComplete.disability) ||
      (selectedPlan.startsWith('agency_') && !verificationComplete.agency);
    
    if (needsVerification) {
      // Determine which verification type is needed
      let type: 'low_income' | 'disability' | 'agency' = 'low_income';
      
      if (selectedPlan.startsWith('disability_')) {
        type = 'disability';
      } else if (selectedPlan.startsWith('agency_')) {
        type = 'agency';
      }
      
      setVerificationPlanType(type);
      setVerificationDialogOpen(true);
      return;
    }
    
    // We'll only use get-or-create-subscription for recurring subscription plans
    const isRecurringPlan = !selectedPlan.includes('document');
    
    if (isRecurringPlan) {
      // Create or get subscription using the subscription endpoint
      apiRequest("POST", "/api/get-or-create-subscription", { 
        plan: selectedPlan
      })
        .then((res) => res.json())
        .then((data) => {
          // HubSpot payment widget integration doesn't need client secret
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          toast({
            title: "Error",
            description: "Could not initialize subscription. Please try again or check if you're logged in.",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    } else {
      // For one-time payments, use the one-time payment endpoint
      apiRequest("POST", "/api/create-subscription", { 
        plan: selectedPlan,
        amount: planAmount
      })
        .then((res) => res.json())
        .then((data) => {
          // HubSpot payment widget integration doesn't need client secret
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          toast({
            title: "Error",
            description: "Could not initialize payment. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    }
  }, [selectedPlan, planAmount, verificationComplete, verificationPlanType]);

  // Use HubSpot payment widget instead of Stripe
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-500">Preparing your subscription...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 py-16">
      {/* Verification Dialog */}
      <IncomeVerificationDialog 
        isOpen={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        onSubmit={handleVerificationSubmit}
        planType={verificationPlanType}
      />
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Access Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you need full support or just one letter, we've got an option for you. No lawyers. No stress. Just help.
          </p>
        </div>
        
        {/* Standard Plans */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {/* Standard Monthly Plan */}
          <div 
            className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "standard_monthly" ? "ring-2 ring-green-500" : ""}`}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800">Standard Monthly</h3>
              <p className="text-3xl font-bold my-2">$50/month</p>
              <ul className="my-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited form access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>All legal tools included</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority updates + features</span>
                </li>
              </ul>
              <Button 
                variant={selectedPlan === "standard_monthly" ? "default" : "outline"} 
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedPlan("standard_monthly");
                  setPlanAmount(50);
                }}
              >
                Subscribe Monthly
              </Button>
            </div>
          </div>
          
          {/* Standard Annual Plan */}
          <div 
            className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "standard_annual" ? "ring-2 ring-green-500" : ""}`}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800">Standard Yearly</h3>
              <p className="text-3xl font-bold my-2">$450/year</p>
              <ul className="my-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited form access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>All legal tools included</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Save $150 over monthly plan</span>
                </li>
              </ul>
              <Button 
                variant={selectedPlan === "standard_annual" ? "default" : "outline"} 
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedPlan("standard_annual");
                  setPlanAmount(450);
                }}
              >
                Subscribe Yearly
              </Button>
            </div>
          </div>
          
          {/* Standard Pay Per Document */}
          <div 
            className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "standard_document" ? "ring-2 ring-green-500" : ""}`}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800">Pay-Per-Document</h3>
              <p className="text-3xl font-bold my-2">$5.99 each</p>
              <ul className="my-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Access single document</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited edits (14 days)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>PDF + Email delivery</span>
                </li>
              </ul>
              <Button 
                variant={selectedPlan === "standard_document" ? "default" : "outline"} 
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedPlan("standard_document");
                  setPlanAmount(5.99);
                }}
              >
                Buy Single Document
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-10" />
        
        {/* Low Income Plans */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Low Income Plans</h3>
            <p className="text-gray-600">
              Special rates for those with limited financial resources. 
              <Badge className="ml-2 bg-blue-500">Verification Required</Badge>
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {/* Low Income Monthly */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "low_income_monthly" ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Low Income Monthly</h3>
                <p className="text-3xl font-bold my-2">$15/month</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Unlimited form access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>All legal tools included</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Low income verification</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "low_income_monthly" ? "default" : "outline"} 
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedPlan("low_income_monthly");
                    setPlanAmount(15);
                  }}
                >
                  Subscribe Monthly
                </Button>
              </div>
            </div>
            
            {/* Low Income Annual */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "low_income_annual" ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Low Income Yearly</h3>
                <p className="text-3xl font-bold my-2">$120/year</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Unlimited form access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>All legal tools included</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Save $60 over monthly plan</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "low_income_annual" ? "default" : "outline"} 
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedPlan("low_income_annual");
                    setPlanAmount(120);
                  }}
                >
                  Subscribe Yearly
                </Button>
              </div>
            </div>
            
            {/* Low Income Document */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "low_income_document" ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Low Income Document</h3>
                <p className="text-3xl font-bold my-2">$1.99 each</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Access single document</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Unlimited edits (14 days)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Low income verification</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "low_income_document" ? "default" : "outline"} 
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedPlan("low_income_document");
                    setPlanAmount(1.99);
                  }}
                >
                  Buy Single Document
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Disability Plans */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Disability Plans</h3>
            <p className="text-gray-600">
              Special rates for those with disabilities. 
              <Badge className="ml-2 bg-purple-500">Verification Required</Badge>
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {/* Disability Monthly */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "disability_monthly" ? "ring-2 ring-purple-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Disability Monthly</h3>
                <p className="text-3xl font-bold my-2">$15/month</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Unlimited form access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>All legal tools included</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Disability verification</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "disability_monthly" ? "default" : "outline"} 
                  className="w-full py-6 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedPlan("disability_monthly");
                    setPlanAmount(15);
                  }}
                >
                  Subscribe Monthly
                </Button>
              </div>
            </div>
            
            {/* Disability Annual */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "disability_annual" ? "ring-2 ring-purple-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Disability Yearly</h3>
                <p className="text-3xl font-bold my-2">$120/year</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Unlimited form access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>All legal tools included</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Save $60 over monthly plan</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "disability_annual" ? "default" : "outline"} 
                  className="w-full py-6 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedPlan("disability_annual");
                    setPlanAmount(120);
                  }}
                >
                  Subscribe Yearly
                </Button>
              </div>
            </div>
            
            {/* Disability Document */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "disability_document" ? "ring-2 ring-purple-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Disability Document</h3>
                <p className="text-3xl font-bold my-2">$1.99 each</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Access single document</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Unlimited edits (14 days)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Disability verification</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "disability_document" ? "default" : "outline"} 
                  className="w-full py-6 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedPlan("disability_document");
                    setPlanAmount(1.99);
                  }}
                >
                  Buy Single Document
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Agency/Advocate Plans */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Agency & Advocate Plans</h3>
            <p className="text-gray-600">
              For legal aid organizations and professional advocates. 
              <Badge className="ml-2 bg-amber-500">Verification Required</Badge>
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {/* Agency Monthly */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "agency_monthly" ? "ring-2 ring-amber-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Agency Monthly</h3>
                <p className="text-3xl font-bold my-2">$30/month</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-amber-500 mr-2" />
                    <span>Unlimited form access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-amber-500 mr-2" />
                    <span>On behalf of client submissions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-amber-500 mr-2" />
                    <span>Professional verification</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "agency_monthly" ? "default" : "outline"} 
                  className="w-full py-6 bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    setSelectedPlan("agency_monthly");
                    setPlanAmount(30);
                  }}
                >
                  Subscribe Monthly
                </Button>
              </div>
            </div>
            
            {/* Agency Annual */}
            <div 
              className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
                ${selectedPlan === "agency_annual" ? "ring-2 ring-amber-500" : ""}`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800">Agency Yearly</h3>
                <p className="text-3xl font-bold my-2">$300/year</p>
                <ul className="my-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-amber-500 mr-2" />
                    <span>Unlimited form access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-amber-500 mr-2" />
                    <span>On behalf of client submissions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-amber-500 mr-2" />
                    <span>Save $60 over monthly plan</span>
                  </li>
                </ul>
                <Button 
                  variant={selectedPlan === "agency_annual" ? "default" : "outline"} 
                  className="w-full py-6 bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    setSelectedPlan("agency_annual");
                    setPlanAmount(300);
                  }}
                >
                  Subscribe Yearly
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* HubSpot payment section replaces Stripe */}
        {!isLoading && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-8 max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-center">Complete Your Payment</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Selected Plan:</span>
                <span className="font-semibold">{selectedPlan.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${planAmount.toFixed(2)}{selectedPlan.includes('monthly') ? '/month' : selectedPlan.includes('annual') ? '/year' : ' one-time'}</span>
              </div>
            </div>
            
            <HubSpotPaymentsEmbed 
              planName={selectedPlan.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())} 
              planAmount={planAmount} 
            />
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Your payment is processed securely through HubSpot Payments.</p>
              <p className="mt-1">You can cancel your subscription at any time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}