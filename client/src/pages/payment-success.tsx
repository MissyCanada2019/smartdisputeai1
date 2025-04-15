import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { useQueryParams } from '@/hooks/use-query-params';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

const PaymentSuccess: React.FC = () => {
  const { orderId, subscriptionId, amount, currency, productName } = useQueryParams();
  const { trackTransaction } = useAnalytics();
  
  useEffect(() => {
    // Track transaction when component mounts
    if (orderId && amount) {
      trackTransaction(
        orderId,
        parseFloat(amount),
        currency || 'USD',
        productName || 'SmartDispute Service'
      );
    }
  }, [orderId, amount, currency, productName, trackTransaction]);
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-500 h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            {orderId && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
            )}
            {subscriptionId && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subscription ID:</span>
                <span className="font-medium">{subscriptionId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: currency || 'USD' 
                  }).format(parseFloat(amount))}
                </span>
              </div>
            )}
            {productName && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{productName}</span>
              </div>
            )}
          </div>
          
          <div className="text-center text-gray-600">
            <p>A confirmation email has been sent to your email address.</p>
            <p className="mt-2">If you have any questions or need assistance, please contact our support team.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;