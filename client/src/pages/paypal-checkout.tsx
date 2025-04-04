import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PayPalOptions } from '@/components/checkout/PayPalOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

// Define PayPal buttons config interface for local use
interface PayPalButtonsConfig {
  style?: {
    shape?: 'rect' | 'pill';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    layout?: 'vertical' | 'horizontal';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
  };
  createSubscription?: (data: any, actions: any) => Promise<any>;
  onApprove?: (data: any, actions: any) => void;
  [key: string]: any;
}

export default function PayPalCheckout() {
  useEffect(() => {
    // This function loads both types of PayPal SDK scripts and renders all buttons
    const loadAllPayPalScripts = () => {
      // Function to load hosted buttons SDK
      const loadHostedButtonsScript = () => {
        if (document.querySelector('script[src*="components=hosted-buttons"]')) {
          renderHostedButtons();
          return;
        }
        
        const script = document.createElement('script');
        script.src = "https://www.paypal.com/sdk/js?client-id=BAAX70lJFewN5Sur8CW1Za_Q0USFYAZErHKuZtZ9zEqJ9uncHMycZe2W0IeO5ZPk04uV-59Fm3mNP7nXkE&components=hosted-buttons&disable-funding=venmo&currency=CAD";
        script.async = true;
        
        script.onload = () => {
          renderHostedButtons();
        };
        
        document.body.appendChild(script);
      };
      
      // Function to load subscription buttons SDK
      const loadSubscriptionScript = () => {
        if (document.querySelector('script[src*="intent=subscription"]')) {
          renderSubscriptionButton();
          return;
        }
        
        const script = document.createElement('script');
        script.src = "https://www.paypal.com/sdk/js?client-id=AaDPFtb7F82jtldZNnVrUjagsqDsiOahIHBARcI_dqyg45XyNt_qeSGdsp_5XO_15AnEUKy7srJVX7_F&vault=true&intent=subscription";
        script.async = true;
        script.setAttribute('data-sdk-integration-source', 'button-factory');
        
        script.onload = () => {
          renderSubscriptionButton();
        };
        
        document.body.appendChild(script);
      };
      
      // Load both scripts in sequence (subscription first, then hosted buttons)
      loadSubscriptionScript();
      
      // Wait a short time before loading the second script to avoid conflicts
      setTimeout(() => {
        loadHostedButtonsScript();
      }, 500);
      
      return () => {
        // Cleanup function if component unmounts
        const scripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
        scripts.forEach(script => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        });
      };
    };
    
    // Function to render hosted PayPal buttons
    const renderHostedButtons = () => {
      if (!window.paypal || !window.paypal.HostedButtons) return;
      
      // Render document analysis button
      try {
        const container = document.getElementById("paypal-container-QD2XW5BJCKQGU");
        if (container) {
          window.paypal.HostedButtons({
            hostedButtonId: "QD2XW5BJCKQGU",
          }).render("#paypal-container-QD2XW5BJCKQGU");
        }
      } catch (err) {
        console.error("Error rendering document analysis button:", err);
      }
      
      // Render monthly subscription hosted button
      try {
        const container = document.getElementById("paypal-container-VPHYTYJQB32Y6");
        if (container) {
          window.paypal.HostedButtons({
            hostedButtonId: "VPHYTYJQB32Y6",
          }).render("#paypal-container-VPHYTYJQB32Y6");
        }
      } catch (err) {
        console.error("Error rendering subscription button:", err);
      }
    };
    
    // Function to render subscription button
    const renderSubscriptionButton = () => {
      if (!window.paypal || !window.paypal.Buttons) return;
      
      try {
        const container = document.getElementById("paypal-button-container-P-08038987C9239303UM7XUMQY");
        if (container) {
          window.paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe'
            },
            createSubscription: function(data: any, actions: any) {
              return actions.subscription.create({
                /* Creates the subscription */
                plan_id: 'P-08038987C9239303UM7XUMQY'
              });
            },
            onApprove: function(data: any, actions: any) {
              alert('Subscription successful! Subscription ID: ' + data.subscriptionID);
              // Here you would typically handle this server-side
              // For example, send the subscription ID to your server
            }
          }).render('#paypal-button-container-P-08038987C9239303UM7XUMQY');
        }
      } catch (err) {
        console.error("Error rendering plan subscription button:", err);
      }
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
        </div>
        
        <div className="p-8 border rounded-lg shadow-md mx-auto w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Monthly Subscription (Hosted Button)</h3>
          <p className="text-gray-600 mb-6 text-center">
            Full access to all platform features and unlimited documents ($49.99/month)
          </p>
          <div id="paypal-container-VPHYTYJQB32Y6"></div>
        </div>
      </div>
      
      {/* PayPal Subscription Button */}
      <div className="mt-12 max-w-xl mx-auto">
        <div className="p-8 border rounded-lg shadow-md w-full">
          <h3 className="text-xl font-bold mb-4 text-center">Premium Subscription</h3>
          <p className="text-gray-600 mb-6 text-center">
            Unlimited document analysis, priority support, and exclusive legal resources
          </p>
          <div id="paypal-button-container-P-08038987C9239303UM7XUMQY"></div>
        </div>
      </div>
    </div>
  );
}