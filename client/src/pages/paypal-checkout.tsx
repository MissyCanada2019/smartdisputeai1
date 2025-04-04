import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PayPalOptions } from '@/components/checkout/PayPalOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';
import { 
  loadHostedButtonsScript, 
  loadSubscriptionScript, 
  renderHostedButtons, 
  renderSubscriptionButton, 
  unloadPayPalScripts 
} from '../utils/paypal-loader';

export default function PayPalCheckout() {
  useEffect(() => {
    // Load the PayPal scripts and render buttons
    const loadAllPayPalScripts = () => {
      // Load subscription script first
      loadSubscriptionScript(renderSubscriptionButton);
      
      // Wait a short time before loading the hosted buttons script to avoid conflicts
      setTimeout(() => {
        loadHostedButtonsScript(renderHostedButtons);
      }, 500);
      
      // Return cleanup function
      return unloadPayPalScripts;
    };
    
    return loadAllPayPalScripts();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Legal Services Checkout</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Select from our range of AI-powered legal services designed to help you navigate 
          your legal matters with confidence.
        </p>
      </div>

      <Alert className="mb-8 max-w-3xl mx-auto">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Secure PayPal Checkout</AlertTitle>
        <AlertDescription>
          All payments are processed securely through PayPal. You do not need a PayPal account 
          to complete your purchase.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="documents">Document Services</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="premium">Premium Services</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <PayPalOptions showAll={true} />
        </TabsContent>
        <TabsContent value="documents">
          <PayPalOptions showAll={false} selectedOptions={["document-analysis"]} />
        </TabsContent>
        <TabsContent value="subscriptions">
          <PayPalOptions showAll={false} selectedOptions={["monthly-subscription"]} />
        </TabsContent>
        <TabsContent value="premium">
          <PayPalOptions showAll={false} selectedOptions={["case-strategy", "priority-processing", "premium-case-review"]} />
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
          If you have questions about our services or need assistance with checkout, 
          please don't hesitate to contact our support team.
        </p>
        <Button variant="outline" className="mr-4">Contact Support</Button>
        <Button variant="default">Return to Services</Button>
      </div>

      {/* Direct PayPal containers */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="p-8 border rounded-lg shadow-md mx-auto w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Document Analysis</h3>
          <p className="text-gray-600 mb-6 text-center">
            AI-powered legal document analysis with risk evaluation ($14.99)
          </p>
          <div id="paypal-container-QD2XW5BJCKQGU"></div>
        </div>
        
        <div className="p-8 border rounded-lg shadow-md mx-auto w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Monthly Subscription (Hosted Button)</h3>
          <p className="text-gray-600 mb-6 text-center">
            Full access to all platform features and unlimited documents ($49.99/month)
          </p>
          <div id="paypal-container-VPHYTYJQB32Y6"></div>
        </div>
      </div>
      
      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="p-8 border rounded-lg shadow-md mx-auto w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Legal Case Review</h3>
          <p className="text-gray-600 mb-6 text-center">
            In-depth legal case review with strategic recommendations by AI
          </p>
          <div id="paypal-container-R4FJL8GB7FRNN"></div>
        </div>
        
        {/* PayPal Subscription Button */}
        <div className="p-8 border rounded-lg shadow-md mx-auto w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Premium Subscription</h3>
          <p className="text-gray-600 mb-6 text-center">
            Unlimited document analysis, priority support, and exclusive legal resources
          </p>
          <div id="paypal-button-container-P-08038987C9239303UM7XUMQY"></div>
        </div>
      </div>
      
      {/* Premium Case Review Section */}
      <div className="mt-8 max-w-xl mx-auto">
        <div className="p-8 border rounded-lg shadow-md border-blue-200 bg-blue-50 w-full relative">
          <div className="absolute -right-2 -top-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">PREMIUM</div>
          <h3 className="text-xl font-bold mb-4 text-center">Premium Case Review</h3>
          <p className="text-gray-600 mb-6 text-center">
            Priority case review with extended legal analysis and personalized strategy recommendations
          </p>
          <div id="paypal-container-6ADXJKVACV736"></div>
        </div>
      </div>
    </div>
  );
}