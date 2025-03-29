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
    <div className="bg-gray-100 py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Access Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you need full support or just one letter, we've got an option for you. No lawyers. No stress. Just help.
          </p>
        </div>
        
        {/* Standard Plans */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {/* Monthly Plan */}
          <div 
            className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "monthly" ? "ring-2 ring-green-500" : ""}`}
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
                variant={selectedPlan === "monthly" ? "default" : "outline"} 
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedPlan("monthly");
                  setPlanAmount(50);
                }}
              >
                Subscribe Monthly
              </Button>
            </div>
          </div>
          
          {/* Annual Plan */}
          <div 
            className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "annual" ? "ring-2 ring-green-500" : ""}`}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800">Standard Yearly</h3>
              <p className="text-3xl font-bold my-2">$1000/year</p>
              <ul className="my-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited form access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Best for advocates & legal orgs</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>VIP feature access</span>
                </li>
              </ul>
              <Button 
                variant={selectedPlan === "annual" ? "default" : "outline"} 
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedPlan("annual");
                  setPlanAmount(1000);
                }}
              >
                Subscribe Yearly
              </Button>
            </div>
          </div>
          
          {/* Pay Per Document */}
          <div 
            className={`w-full md:w-[300px] bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "basic_document" ? "ring-2 ring-green-500" : ""}`}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800">Pay-Per-Document</h3>
              <p className="text-3xl font-bold my-2">$5.99 each</p>
              <ul className="my-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Purchase only what you need</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>No recurring charges</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Email delivery included</span>
                </li>
              </ul>
              <Button 
                variant={selectedPlan === "basic_document" ? "default" : "outline"} 
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedPlan("basic_document");
                  setPlanAmount(5.99);
                }}
              >
                Choose Document
              </Button>
            </div>
          </div>
        </div>
        
        {/* Low Income Option */}
        <div className="flex justify-center mb-8 mt-12">
          <div 
            className={`w-full max-w-lg bg-gray-900 text-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg
              ${selectedPlan === "low_income_year" || selectedPlan === "low_income_doc" ? "ring-2 ring-red-500" : ""}`}
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold">Low-Income Access</h3>
              <p className="text-3xl font-bold my-2">$25/year</p>
              <p className="text-gray-300">OR $0.99 per form</p>
              <ul className="my-6 space-y-3 text-gray-300">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-red-400 mr-2" />
                  <span>No proof required</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-red-400 mr-2" />
                  <span>Self-declared support tier</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-red-400 mr-2" />
                  <span>Same access, lower cost</span>
                </li>
              </ul>
              <div className="flex gap-4 mt-8">
                <Button 
                  variant={selectedPlan === "low_income_year" ? "default" : "outline"} 
                  className={`flex-1 py-6 ${selectedPlan === "low_income_year" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"}`}
                  onClick={() => {
                    setSelectedPlan("low_income_year");
                    setPlanAmount(25);
                  }}
                >
                  Choose Yearly ($25)
                </Button>
                <Button 
                  variant={selectedPlan === "low_income_doc" ? "default" : "outline"} 
                  className={`flex-1 py-6 ${selectedPlan === "low_income_doc" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"}`}
                  onClick={() => {
                    setSelectedPlan("low_income_doc");
                    setPlanAmount(0.99);
                  }}
                >
                  Per Form ($0.99 each)
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-10 text-gray-500 text-sm max-w-2xl mx-auto">
          We believe justice should be accessible to all. If you're facing financial hardship, choose the support tier that works for you.
        </div>
        
        {/* Payment Section */}
        {selectedPlan && (
          <div className="max-w-lg mx-auto mt-12">
            <Card className="border-t-4 border-primary">
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
        )}
      </div>
    </div>
  );
}