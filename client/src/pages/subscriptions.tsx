import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckIcon, ShieldCheck } from 'lucide-react';
import { SubscriptionButton } from '@/components/checkout/SubscriptionButton';
import { loadSubscriptionScript, unloadPayPalScripts } from '@/utils/paypal-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from '@/hooks/use-analytics';

const subscriptionPlans = [
  {
    id: "premium-monthly",
    title: "Premium Monthly",
    price: "$49.99/month",
    description: "Full access to all professional legal tools",
    features: [
      "Unlimited document analysis",
      "Priority case review",
      "Evidence analysis assistance",
      "Legal precedent search",
      "Document generation",
      "Priority support"
    ],
    planId: "P-9AX658241M042612XM7XYWQA",
    badge: "Most Popular"
  },
  {
    id: "premium-quarterly",
    title: "Premium Quarterly",
    price: "$129.99/quarter",
    description: "Save 13% with quarterly billing",
    features: [
      "All Premium Monthly features",
      "Advanced analytics dashboard",
      "Batch document processing",
      "Extended document storage",
      "Priority queue for all services",
      "Quarterly strategy consultation"
    ],
    planId: "P-7JM446383R159705KM7XYYGI",
    badge: "Best Value"
  }
];

export default function SubscriptionsPage() {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Track page view
    trackEvent('page_view', { page: 'subscriptions' });
    
    // Load subscription script
    loadSubscriptionScript();
    
    // Clean up on unmount
    return () => {
      unloadPayPalScripts();
    };
  }, [trackEvent]);
  
  const handleSubscriptionSuccess = (planId: string, subscriptionId: string) => {
    // Track successful subscription
    trackEvent('subscription_success', { 
      planId, 
      subscriptionId 
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">SmartDispute.ai Subscription Plans</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Choose the right subscription plan to get ongoing access to AI-powered legal assistance
          tailored to your needs.
        </p>
      </div>
      
      <Alert className="mb-8 max-w-3xl mx-auto">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Secure Payment Processing</AlertTitle>
        <AlertDescription>
          All payments are processed securely through PayPal. Your subscription can be canceled at any time
          from your PayPal account.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="professional" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="low-income" disabled>Low Income (Coming Soon)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="professional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col transition-all hover:shadow-lg border-2">
                {plan.badge && (
                  <div className="absolute -right-2 -top-2">
                    <Badge variant="secondary" className="bg-blue-600 text-white font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                  <CardTitle className="text-blue-800">{plan.title}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-blue-700">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-6">
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="text-blue-500 w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 pb-6 flex flex-col items-center">
                  <Separator className="mb-4" />
                  <div className="w-full">
                    <SubscriptionButton 
                      planId={plan.planId}
                      onSuccess={(data) => handleSubscriptionSuccess(plan.planId, data.subscriptionID)}
                    />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-10 max-w-3xl mx-auto p-6 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start mb-4">
              <ShieldCheck className="text-blue-700 w-6 h-6 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Our Commitment to Legal Support</h3>
                <p className="text-gray-700">
                  Every SmartDispute.ai subscription helps us provide free and reduced-cost services
                  to those most in need. Your subscription ensures we can continue improving our AI
                  tools and making legal assistance more accessible to all Canadians.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="low-income">
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Low-income pricing options are coming soon. Please check back later.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}