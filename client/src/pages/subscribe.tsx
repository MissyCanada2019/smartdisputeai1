import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { AlertCircle, Check, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY. Payment processing will not work properly.');
}
// Initialize Stripe with the publishable key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  null;

const SubscriptionForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?subscription=true`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Subscribe Now'
        )}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<
    "monthly" | 
    "annual" | 
    "basic_document" | 
    "low_income_year" |
    "low_income_doc"
  >("monthly");
  const [planAmount, setPlanAmount] = useState(50);
  
  useEffect(() => {
    // Create subscription payment intent
    apiRequest("POST", "/api/create-subscription", { 
      plan: selectedPlan,
      amount: planAmount
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Could not initialize subscription. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [selectedPlan]);

  if (isLoading || !clientSecret || !stripePromise) {
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">AI-Powered Legal Help</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access powerful legal document tools and AI assistance to help you fight back against unfair treatment.
        </p>
      </div>
      
      {/* Pricing Tiers */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Standard Access</h2>
            
            <Card className={`hover:shadow-md transition-shadow ${selectedPlan === "monthly" ? "border-2 border-primary" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Monthly Unlimited</span>
                  <span className="text-primary">$50/month</span>
                </CardTitle>
                <CardDescription>Unlimited full access</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Unlimited AI assistant access</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> All document templates</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Premium support</div>
                </div>
                <Button 
                  variant={selectedPlan === "monthly" ? "default" : "outline"} 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedPlan("monthly");
                    setPlanAmount(50);
                  }}
                >
                  {selectedPlan === "monthly" ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-md transition-shadow ${selectedPlan === "annual" ? "border-2 border-primary" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Annual Access</span>
                  <span className="text-primary">$1000/year</span>
                </CardTitle>
                <CardDescription>For professionals, advocates, etc.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Save $200 compared to monthly</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Access to all future templates</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Priority customer service</div>
                </div>
                <Button 
                  variant={selectedPlan === "annual" ? "default" : "outline"} 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedPlan("annual");
                    setPlanAmount(1000);
                  }}
                >
                  {selectedPlan === "annual" ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-md transition-shadow ${selectedPlan === "basic_document" ? "border-2 border-primary" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Pay-Per-Document</span>
                  <span className="text-primary">$5.99 each</span>
                </CardTitle>
                <CardDescription>Pay as you go for any legal letter</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Purchase only what you need</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> No recurring charges</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Email delivery included</div>
                </div>
                <Button 
                  variant={selectedPlan === "basic_document" ? "default" : "outline"} 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedPlan("basic_document");
                    setPlanAmount(5.99);
                  }}
                >
                  {selectedPlan === "basic_document" ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Low-Income Access (Honor System)</h2>
            
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">We believe access to justice is a right, not a privilege</AlertTitle>
              <AlertDescription className="text-blue-700">
                If you're struggling financially, you can choose a lower-cost option—no proof required.
              </AlertDescription>
            </Alert>
            
            <Card className={`hover:shadow-md transition-shadow ${selectedPlan === "low_income_year" ? "border-2 border-primary" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Annual Access</span>
                  <span className="text-primary">$25/year</span>
                </CardTitle>
                <CardDescription>Discounted subscription for those who need it</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Full access to all features</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Renewed yearly at discounted rate</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Same support as standard plans</div>
                </div>
                <Button 
                  variant={selectedPlan === "low_income_year" ? "default" : "outline"} 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedPlan("low_income_year");
                    setPlanAmount(25);
                  }}
                >
                  {selectedPlan === "low_income_year" ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className={`hover:shadow-md transition-shadow ${selectedPlan === "low_income_doc" ? "border-2 border-primary" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Budget Document</span>
                  <span className="text-primary">$0.99 each</span>
                </CardTitle>
                <CardDescription>Budget-friendly, no-questions-asked option</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Same quality documents</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Pay for only what you need</div>
                  <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Still includes email delivery</div>
                </div>
                <Button 
                  variant={selectedPlan === "low_income_doc" ? "default" : "outline"} 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedPlan("low_income_doc");
                    setPlanAmount(0.99);
                  }}
                >
                  {selectedPlan === "low_income_doc" ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
            
            <div className="bg-gray-50 p-4 rounded-lg border mt-6">
              <p className="text-sm text-gray-700">
                <strong>Our commitment to accessibility:</strong> We offer low-income options on an honor system because we believe fighting for your rights shouldn't be limited by financial barriers. We trust our community to choose the option that truly reflects their situation.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Section */}
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>Secure payment processing via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between font-medium pb-4 mb-4 border-b">
                <span>Selected Plan:</span>
                <span className="text-primary font-semibold">${planAmount} CAD</span>
              </div>
              
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscriptionForm />
              </Elements>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-gray-500">
            <div className="text-center">
              <p>Your information is encrypted and secure.</p>
              <p className="mt-1">You can cancel your subscription anytime.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}