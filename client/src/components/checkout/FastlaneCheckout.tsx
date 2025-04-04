import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FastlaneCheckoutProps {
  amount: string;
  currency?: string;
  description?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  locale?: string;
}

/**
 * Fetch a client token from the server for PayPal Fastlane
 */
async function fetchClientToken(): Promise<string> {
  const response = await fetch('/api/paypal/client-token');
  const data = await response.json();
  
  if (!data.success || !data.clientToken) {
    throw new Error('Failed to get client token');
  }
  
  return data.clientToken;
}

/**
 * Create an order on the server
 */
async function createOrder(amount: string, currency: string = 'USD', description?: string): Promise<string> {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, description }),
  });
  
  const data = await response.json();
  
  if (!data.success || !data.orderId) {
    throw new Error(data.error || 'Failed to create order');
  }
  
  return data.orderId;
}

/**
 * Capture an order on the server
 */
async function captureOrder(orderId: string): Promise<any> {
  const response = await fetch('/api/paypal/capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to capture order');
  }
  
  return data;
}

/**
 * Render the Fastlane watermark
 */
function renderFastlaneWatermark(container: HTMLElement | null) {
  if (!container) return;
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Create the watermark image
  const watermark = document.createElement('img');
  watermark.src = 'https://www.paypalobjects.com/fastlane-v1/assets/fastlane-with-tooltip_en_sm_light.0808.svg';
  watermark.alt = 'Powered by PayPal Fastlane';
  watermark.style.height = '24px';
  watermark.style.display = 'inline-block';
  
  // Add the watermark to the container
  container.appendChild(watermark);
}

const FastlaneCheckout: React.FC<FastlaneCheckoutProps> = ({
  amount,
  currency = 'USD',
  description,
  onSuccess,
  onError,
  onCancel,
  locale = 'en_us',
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const watermarkContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load PayPal Fastlane SDK
    const setupPayPal = async () => {
      try {
        setIsLoading(true);
        
        // Get a client token from the server
        const clientToken = await fetchClientToken();
        
        // Add PayPal script to the page
        // Only add if it doesn't already exist
        if (!document.getElementById('paypal-fastlane-script')) {
          const script = document.createElement('script');
          script.id = 'paypal-fastlane-script';
          script.src = `https://www.paypal.com/sdk/js?components=fastlane&client-id=test&currency=${currency}&locale=${locale}`;
          script.dataset.clientToken = clientToken;
          
          // Add a link to preload the watermark asset in the head
          const preloadLink = document.createElement('link');
          preloadLink.rel = 'preload';
          preloadLink.href = 'https://www.paypalobjects.com/fastlane-v1/assets/fastlane-with-tooltip_en_sm_light.0808.svg';
          preloadLink.as = 'image';
          preloadLink.type = 'image/avif';
          document.head.appendChild(preloadLink);
          
          // Wait for the script to load
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PayPal Fastlane SDK'));
            document.body.appendChild(script);
          });
        }
        
        // Render the Fastlane watermark if container exists
        if (watermarkContainerRef.current) {
          renderFastlaneWatermark(watermarkContainerRef.current);
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize PayPal checkout');
        setIsLoading(false);
        if (onError) onError(new Error(err.message || 'Failed to initialize PayPal checkout'));
      }
    };

    setupPayPal();
  }, [locale, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Create order on the server
      const newOrderId = await createOrder(amount, currency, description);
      setOrderId(newOrderId);
      
      // @ts-ignore - PayPal global is loaded from the SDK script
      const fastlane = window.paypal.Fastlane;
      
      // Launch the Fastlane experience
      fastlane.launch({
        orderId: newOrderId,
        buyerEmail: email,
        onApprove: async (data: any) => {
          try {
            // Capture the order payment
            const captureData = await captureOrder(data.orderID);
            setSuccess(true);
            setIsProcessing(false);
            if (onSuccess) onSuccess(captureData);
          } catch (err: any) {
            setError(err.message || 'Payment capture failed');
            setIsProcessing(false);
            if (onError) onError(new Error(err.message || 'Payment capture failed'));
          }
        },
        onCancel: () => {
          setIsProcessing(false);
          if (onCancel) onCancel();
        },
        onError: (err: Error) => {
          setError(err.message || 'Payment processing failed');
          setIsProcessing(false);
          if (onError) onError(err);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
      setIsProcessing(false);
      if (onError) onError(new Error(err.message || 'Payment processing failed'));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Fast Checkout</CardTitle>
        <CardDescription>
          Complete your purchase quickly and securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading payment options...</span>
          </div>
        ) : success ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Payment Successful!</AlertTitle>
            <AlertDescription>
              Your payment has been processed successfully. 
              {orderId && <div className="text-sm mt-1">Order ID: {orderId}</div>}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full"
                    disabled={isProcessing}
                  />
                  {/* PayPal Fastlane watermark will be rendered here */}
                  <div ref={watermarkContainerRef} className="mt-1 text-xs text-gray-500"></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Amount:</span>
                  <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount))}</span>
                </div>
                {description && (
                  <div className="text-sm text-gray-600">
                    {description}
                  </div>
                )}
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <div className="text-xs text-gray-500 text-center">
          Secure checkout powered by PayPal. Your payment information is encrypted and secure.
        </div>
      </CardFooter>
    </Card>
  );
};

export default FastlaneCheckout;