import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PayPalButtonProps {
  amount: number;
  itemName: string;
  itemDescription?: string;
  onSuccess?: (paymentDetails: any) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  showFullCard?: boolean;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButton({ 
  amount, 
  itemName, 
  itemDescription = "Legal document analysis service", 
  onSuccess, 
  onError,
  buttonText = "Pay with PayPal",
  showFullCard = true
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load the PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID || import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=CAD`;
    script.async = true;
    
    script.onload = () => {
      setLoading(false);
      initializePayPal();
    };
    
    script.onerror = () => {
      setLoading(false);
      setError("Failed to load PayPal. Please try again later.");
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to load PayPal. Please try again later.",
      });
      if (onError) onError(new Error("Failed to load PayPal SDK"));
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const initializePayPal = () => {
    if (window.paypal) {
      try {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
          },
          createOrder: (data: any, actions: any) => {
            setPaymentStatus('processing');
            return actions.order.create({
              purchase_units: [{
                description: itemDescription,
                amount: {
                  currency_code: 'CAD',
                  value: amount.toFixed(2)
                },
                items: [{
                  name: itemName,
                  unit_amount: {
                    currency_code: 'CAD',
                    value: amount.toFixed(2)
                  },
                  quantity: '1'
                }]
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const orderDetails = await actions.order.capture();
              setPaymentStatus('success');
              toast({
                title: "Payment Successful",
                description: `Successfully processed payment for ${itemName}`,
              });
              
              // Verify the payment on the server-side
              const response = await fetch('/api/payments/verify-transaction', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  orderID: data.orderID,
                  paymentDetails: orderDetails
                }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to verify payment on server');
              }
              
              const verificationResult = await response.json();
              
              if (onSuccess) {
                onSuccess({
                  transactionId: data.orderID,
                  paymentDetails: orderDetails,
                  verificationResult
                });
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              setPaymentStatus('error');
              setError('Payment was processed but verification failed');
              if (onError) onError(error);
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            setPaymentStatus('error');
            setError('Payment failed. Please try again.');
            toast({
              variant: "destructive",
              title: "Payment Error",
              description: "Failed to process payment. Please try again.",
            });
            if (onError) onError(err);
          },
          onCancel: () => {
            setPaymentStatus('idle');
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
            });
          }
        }).render('#paypal-button-container');
      } catch (error) {
        console.error('PayPal initialization error:', error);
        setError('Failed to initialize PayPal');
        if (onError) onError(error);
      }
    }
  };
  
  if (!showFullCard) {
    return (
      <div className="w-full">
        {paymentStatus === 'success' ? (
          <div className="flex items-center justify-center py-4 space-x-2 bg-green-50 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700 font-medium">Payment successful!</p>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="flex items-center justify-center py-4 space-x-2 bg-red-50 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 font-medium">{error || "Payment failed"}</p>
          </div>
        ) : (
          <div id="paypal-button-container" className="w-full">
            {loading && (
              <Button disabled variant="outline" className="w-full h-12">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading payment options...
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          Secure payment processing with PayPal
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">{itemName}</h3>
          <p className="text-sm text-gray-500 mb-3">{itemDescription}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm">Amount:</span>
            <span className="font-bold text-lg">${amount.toFixed(2)} CAD</span>
          </div>
        </div>
        
        {paymentStatus === 'success' ? (
          <div className="flex items-center justify-center p-6 space-x-2 bg-green-50 rounded-md">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <p className="text-green-700 font-medium">Payment successful!</p>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="flex items-center justify-center p-6 space-x-2 bg-red-50 rounded-md">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-red-700 font-medium">{error || "Payment failed"}</p>
          </div>
        ) : (
          <div id="paypal-button-container" className="w-full">
            {loading && (
              <Button disabled variant="outline" className="w-full h-12">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading payment options...
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <div className="text-xs text-gray-500 text-center">
          Your payment is secure and encrypted. By proceeding, you agree to our
          Terms of Service and Privacy Policy.
        </div>
        
        {paymentStatus !== 'idle' && paymentStatus !== 'success' && (
          <Button variant="outline" onClick={() => setPaymentStatus('idle')} className="w-full">
            Cancel payment
          </Button>
        )}
        
        {paymentStatus === 'success' && onSuccess && (
          <Button onClick={() => window.location.href = "/dashboard"} className="w-full">
            Go to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}