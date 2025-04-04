import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryParams } from '@/hooks/use-query-params';
import FastlaneCheckout from '@/components/checkout/FastlaneCheckout';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

const FastlaneCheckoutPage: React.FC = () => {
  const { amount, currency, description, productName } = useQueryParams();
  const [, setLocation] = useLocation();
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Track page view
    trackEvent('checkout_page_view', {
      amount,
      currency,
      product: productName || description
    });
    
    // Validate required parameters
    if (!amount) {
      console.error('Missing required parameter: amount');
      setLocation('/');
    }
  }, [amount, currency, description, productName, setLocation, trackEvent]);
  
  // Handle successful payment
  const handleSuccess = (data: any) => {
    // Redirect to success page with payment details
    const params = new URLSearchParams({
      orderId: data.orderId,
      amount: amount,
      currency: currency || 'USD',
      productName: productName || description || 'SmartDispute Service'
    });
    
    trackEvent('checkout_complete', {
      orderId: data.orderId,
      amount,
      currency: currency || 'USD'
    });
    
    setLocation(`/payment-success?${params.toString()}`);
  };
  
  // Handle payment errors
  const handleError = (error: Error) => {
    console.error('Payment error:', error);
    
    trackEvent('checkout_error', {
      error: error.message,
      amount,
      currency: currency || 'USD'
    });
    
    // You could redirect to an error page or stay on checkout page
    // For now, we'll stay on the checkout page as the component shows errors
  };
  
  // Handle payment cancellation
  const handleCancel = () => {
    trackEvent('checkout_cancelled', {
      amount,
      currency: currency || 'USD'
    });
    
    // Go back to the previous page or to a specific page
    window.history.back();
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <p className="text-gray-600 mb-6">
            Complete your purchase securely with PayPal Fastlane. Enter your email to continue.
          </p>
          
          {productName && (
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-2">Your Purchase</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>{productName}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: currency || 'USD' 
                    }).format(parseFloat(amount))}
                  </span>
                </div>
                {description && (
                  <p className="text-sm text-gray-600 mt-2">{description}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">What's Included</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Access to document analysis tools</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>AI-powered legal resource suggestions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>24/7 access to your documents and analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Secure storage of your information</span>
              </li>
            </ul>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="font-semibold text-lg mb-2">Secure Checkout</h2>
            <p className="text-sm text-gray-600">
              Your payment information is processed securely by PayPal. We do not store your payment details.
            </p>
          </div>
        </div>
        
        <div>
          <FastlaneCheckout
            amount={amount}
            currency={currency}
            description={description}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default FastlaneCheckoutPage;