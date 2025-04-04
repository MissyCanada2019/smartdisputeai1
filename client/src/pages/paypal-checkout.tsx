import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PayPalOptions } from '@/components/checkout/PayPalOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

export default function PayPalCheckout() {
  useEffect(() => {
    // This ensures the PayPal SDK is loaded on this page even if it wasn't loaded globally
    const loadPayPalScript = () => {
      if (window.paypal) {
        // If PayPal is already loaded, render the buttons directly
        renderPayPalButtons();
        return;
      }
      
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=BAAX70lJFewN5Sur8CW1Za_Q0USFYAZErHKuZtZ9zEqJ9uncHMycZe2W0IeO5ZPk04uV-59Fm3mNP7nXkE&components=hosted-buttons&disable-funding=venmo&currency=CAD";
      script.async = true;
      
      // When the script loads, render the buttons
      script.onload = () => {
        renderPayPalButtons();
      };
      
      document.body.appendChild(script);
      
      return () => {
        // Clean up only if we added the script
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };
    
    // Function to render all PayPal buttons on the page
    const renderPayPalButtons = () => {
      if (!window.paypal || !window.paypal.HostedButtons) return;
      
      // Render first button
      try {
        window.paypal.HostedButtons({
          hostedButtonId: "QD2XW5BJCKQGU",
        }).render("#paypal-container-QD2XW5BJCKQGU");
      } catch (err) {
        console.error("Error rendering document analysis button:", err);
      }
      
      // Render second button
      try {
        window.paypal.HostedButtons({
          hostedButtonId: "VPHYTYJQB32Y6",
        }).render("#paypal-container-VPHYTYJQB32Y6");
      } catch (err) {
        console.error("Error rendering subscription button:", err);
      }
    };
    
    return loadPayPalScript();
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
          <PayPalOptions showAll={false} selectedOptions={["case-strategy", "priority-processing"]} />
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
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function() {
                  if (window.paypal) {
                    paypal.HostedButtons({
                      hostedButtonId: "QD2XW5BJCKQGU",
                    }).render("#paypal-container-QD2XW5BJCKQGU");
                  }
                });
              `
            }}
          />
        </div>
        
        <div className="p-8 border rounded-lg shadow-md mx-auto w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Monthly Subscription</h3>
          <p className="text-gray-600 mb-6 text-center">
            Full access to all platform features and unlimited documents ($49.99/month)
          </p>
          <div id="paypal-container-VPHYTYJQB32Y6"></div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function() {
                  if (window.paypal) {
                    paypal.HostedButtons({
                      hostedButtonId: "VPHYTYJQB32Y6",
                    }).render("#paypal-container-VPHYTYJQB32Y6");
                  }
                });
              `
            }}
          />
        </div>
      </div>
    </div>
  );
}