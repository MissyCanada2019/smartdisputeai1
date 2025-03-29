import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY. Payment processing will not work properly.');
}
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
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "weekly" | "basic_document">("monthly");
  const [planAmount, setPlanAmount] = useState(30);

  const handlePlanChange = (value: "monthly" | "weekly" | "basic_document") => {
    setSelectedPlan(value);
    if (value === "monthly") {
      setPlanAmount(30);
    } else if (value === "weekly") {
      setPlanAmount(10);
    } else if (value === "basic_document") {
      setPlanAmount(5.99);
    }
  };
  
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
        <h1 className="text-3xl font-bold mb-4">AI Assistant Subscription</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get unlimited access to our AI assistant to help you with your legal questions and document preparation.
        </p>
      </div>
      
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Choose Your Plan</CardTitle>
            <CardDescription className="text-center">Select the plan that works best for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <RadioGroup 
                value={selectedPlan} 
                onValueChange={(value) => handlePlanChange(value as "monthly" | "weekly" | "basic_document")}
                className="space-y-4"
              >
                <div className={`border-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer ${selectedPlan === "monthly" ? "border-primary" : "border-gray-200"}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">Premium Unlimited</p>
                          <div className="flex items-center">
                            <p className="text-primary font-semibold mr-2">$30/month</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Most Value</Badge>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  {selectedPlan === "monthly" && (
                    <div className="ml-6 mt-2 text-sm text-gray-600 space-y-1">
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Unlimited access to AI legal assistant</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Premium document templates</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Priority support</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> In-depth document reviews</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> File unlimited disputes</div>
                    </div>
                  )}
                </div>
                
                <div className={`border-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer ${selectedPlan === "weekly" ? "border-primary" : "border-gray-200"}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">Weekly Access</p>
                          <p className="text-primary font-semibold">$10/week</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  {selectedPlan === "weekly" && (
                    <div className="ml-6 mt-2 text-sm text-gray-600 space-y-1">
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> 7 days of AI legal assistance</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Standard document templates</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Standard support</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Basic document reviews</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> File up to 3 disputes per week</div>
                    </div>
                  )}
                </div>
                
                <div className={`border-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer ${selectedPlan === "basic_document" ? "border-primary" : "border-gray-200"}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="basic_document" id="basic_document" />
                    <Label htmlFor="basic_document" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">Single Document</p>
                          <div className="flex items-center">
                            <p className="text-primary font-semibold mr-2">$5.99 one-time</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Basic</Badge>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  {selectedPlan === "basic_document" && (
                    <div className="ml-6 mt-2 text-sm text-gray-600 space-y-1">
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Single document generation</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Basic templates only</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> No AI assistance</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Email support only</div>
                      <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Valid for 1 document only</div>
                    </div>
                  )}
                </div>
              </RadioGroup>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${planAmount} CAD</span>
              </div>
            </div>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscriptionForm />
            </Elements>
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