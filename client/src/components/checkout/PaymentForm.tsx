import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useFormState } from '@/lib/formContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import { pricingTiers } from '@shared/schema';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY. Payment processing will not work properly.');
}
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  null;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [formState] = useFormState();
  const { toast } = useToast();
  const [_, navigate] = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !formState.selectedTemplate || !formState.documentId) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?document_id=${formState.documentId}`,
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
          'Complete Payment'
        )}
      </Button>
    </form>
  );
};

export default function PaymentForm() {
  const [clientSecret, setClientSecret] = useState("");
  const [formState, setFormState] = useFormState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const template = formState.selectedTemplate;
  const documentData = formState.documentData;
  const userInfo = formState.userInfo;
  
  // Calculate final price based on income range
  const calculateDiscountedPrice = () => {
    if (!template) return 0;
    
    const basePrice = template.basePrice;
    
    if (userInfo?.requestIncomeBased && userInfo?.incomeRange) {
      const tier = pricingTiers.find(tier => tier.incomeRange === userInfo.incomeRange);
      if (tier) {
        return basePrice * (1 - tier.discountPercentage / 100);
      }
    }
    
    return basePrice;
  };
  
  const finalPrice = calculateDiscountedPrice();
  
  useEffect(() => {
    const createDocument = async () => {
      if (!template || !documentData) {
        toast({
          title: "Missing information",
          description: "Please complete the previous steps first.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Create user document
        const docResponse = await apiRequest("POST", "/api/user-documents", {
          userId: 1, // In a real app, this would be the authenticated user's ID
          templateId: template.id,
          documentData,
          finalPrice
        });
        
        const document = await docResponse.json();
        
        // Save the document ID to form state
        setFormState({
          ...formState,
          documentId: document.id
        });
        
        // Create payment intent
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: finalPrice,
          documentId: document.id
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!formState.documentId) {
      createDocument();
    } else {
      // If we already have a document ID, just create the payment intent
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: finalPrice,
        documentId: formState.documentId
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
            description: "Could not initialize payment. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    }
  }, []);
  
  if (isLoading || !clientSecret || !stripePromise) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-500">Preparing your payment...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Complete Your Purchase</CardTitle>
          <CardDescription className="text-center">Secure payment processing by Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{template?.name}</span>
              <span>${template?.basePrice.toFixed(2)}</span>
            </div>
            
            {userInfo?.requestIncomeBased && userInfo?.incomeRange && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center">
                  <Check size={16} className="mr-1" />
                  Income-based discount
                </span>
                <span>
                  {pricingTiers.find(tier => tier.incomeRange === userInfo.incomeRange)?.discountPercentage}% off
                </span>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${finalPrice.toFixed(2)} CAD</span>
            </div>
          </div>
          
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-gray-500">
          <div className="text-center">
            <p>Your information is encrypted and secure.</p>
            <p className="mt-1">You will not be charged until you submit this form.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
