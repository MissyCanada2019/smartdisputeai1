import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

declare global {
  interface Window {
    paypal: any;
  }
}

export default function AdvocacyGroupSubscription() {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const planId = 'P-8S233797GN003581LM7YFTKI';
  const clientId = 'AaDPFtb7F82jtldZNnVrUjagsqDsiOahIHBARcI_dqyg45XyNt_qeSGdsp_5XO_15AnEUKy7srJVX7_F';
  
  useEffect(() => {
    // Avoid loading the script multiple times
    if (document.querySelector(`script[src*="paypal.com/sdk/js"][data-plan-id="${planId}"]`)) {
      scriptLoaded.current = true;
    }

    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.dataset.planId = planId;
      script.dataset.sdkIntegrationSource = "button-factory";
      script.async = true;
      
      script.onload = () => {
        scriptLoaded.current = true;
        
        if (paypalContainerRef.current && window.paypal) {
          window.paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'white',
              layout: 'vertical',
              label: 'subscribe'
            },
            createSubscription: function(data: any, actions: any) {
              return actions.subscription.create({
                plan_id: planId
              });
            },
            onApprove: function(data: any, actions: any) {
              // We can add a success notification here
              console.log('Subscription successful!', data.subscriptionID);
            }
          }).render(`#paypal-button-container-${planId}`);
        }
      };
      
      document.body.appendChild(script);
      
      return () => {
        // Cleanup
        document.body.removeChild(script);
      };
    } else if (scriptLoaded.current && paypalContainerRef.current && window.paypal) {
      // If script is already loaded but container was just mounted
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'white',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({
            plan_id: planId
          });
        },
        onApprove: function(data: any, actions: any) {
          // We can add a success notification here
          console.log('Subscription successful!', data.subscriptionID);
        }
      }).render(`#paypal-button-container-${planId}`);
    }
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Advocacy Group Support</CardTitle>
        <CardDescription>For legal advocacy organizations and non-profits</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-3xl font-bold mb-4">$249/year</div>
        <Separator className="mb-4" />
        <ul className="space-y-2">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Access for 5 staff members</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Priority document processing</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Dedicated support</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>White-labeled resources</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <div id={`paypal-button-container-${planId}`} ref={paypalContainerRef} className="w-full"></div>
      </CardFooter>
    </Card>
  );
}