import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/authContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SubscriptionButton from '@/components/checkout/SubscriptionButton';
import LowIncomeSubscriptionButton from '@/components/checkout/LowIncomeSubscriptionButton';
import { loadSubscriptionScript } from '@/utils/paypal-loader';
import { useToast } from '@/hooks/use-toast';
import { useQueryParams } from '@/hooks/use-query-params';

export default function SubscriptionsPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { getParam } = useQueryParams();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const successParam = getParam('success') || '';
  const errorParam = getParam('error') || '';

  useEffect(() => {
    // Load the PayPal subscription script
    loadSubscriptionScript(() => {
      setScriptLoaded(true);
    });

    // Show toast messages based on URL parameters
    if (successParam === 'true') {
      toast({
        title: "Subscription Successfully Activated",
        description: "Thank you for subscribing to SmartDispute.ai!",
        variant: "default",
      });
    } else if (errorParam) {
      toast({
        title: "Subscription Error",
        description: errorParam || "There was an error processing your subscription.",
        variant: "destructive",
      });
    }
    
    // Cleanup function
    return () => {
      // No need to unload the script here as it might be needed on other pages
    };
  }, [successParam, errorParam, toast]);

  // Handle login redirect for unauthenticated users
  const handleSubscriptionClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe to our services.",
        variant: "default",
      });
      
      // Redirect to login page
      setLocation('/standalone-login?redirect=/subscriptions');
      return false;
    }
    return true;
  };

  // Low income plan
  const lowIncomePlan = {
    title: "Low Income Plan",
    price: "$25",
    frequency: "/year",
    pricePerDocument: "$0.99/document",
    features: [
      "Discounted access to all document services",
      "Basic evidence analysis",
      "Email support",
      "Access to basic resources",
      "Income verification required"
    ]
  };
  
  // Regular subscription plans data (non-low-income)
  const subscriptionPlans = [
    {
      planId: "P-08038987C9239303UM7XUMQY",
      title: "Standard Monthly Subscription",
      price: "$50",
      frequency: "/month",
      features: [
        "Full access to all document templates",
        "AI-powered document analysis",
        "Evidence file review & categorization",
        "Basic case assessment",
        "Evidence Dashboard (50MB storage)",
        "Email support"
      ],
      popular: true
    },
    {
      planId: "P-9AX658241M042612XM7XYWQA",
      title: "Premium Plan",
      price: "$75",
      frequency: "/month",
      features: [
        "Everything in Standard plan",
        "Advanced AI document analysis",
        "Priority processing queue",
        "Full case briefs with precedents",
        "Monthly webinar access (live & recorded)",
        "Community forum access",
        "Jurisdiction-based analysis"
      ],
      popular: false
    },
    {
      planId: "P-7JM446383R159705KM7XYYGI",
      title: "Family Plan",
      price: "$100",
      frequency: "/month",
      features: [
        "Everything in Premium plan",
        "Covers up to 4 family cases",
        "Full automation suite",
        "Court deadline tracker",
        "Personalized case strategy reports",
        "Family law document bundle",
        "Moderated legal groups access"
      ],
      popular: false
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Subscription Plans | SmartDispute.ai</title>
        <meta name="description" content="Choose the subscription plan that best fits your legal needs. From low-income options to professional services." />
      </Helmet>
      
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-2">Subscriptions</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the subscription that best fits your needs. All plans include access to our AI-powered legal document analysis.
        </p>
      </div>
      
      {/* Income-based pricing notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
        <div className="flex items-start">
          <svg 
            className="w-6 h-6 text-blue-500 mt-0.5 mr-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Income-Based Pricing Available</h3>
            <p className="text-blue-700">
              We believe legal assistance should be accessible to everyone. Our low-income plan requires pre-approval through a simple application process. 
              Select the "Request Access" option and provide the required documentation to apply.
            </p>
          </div>
        </div>
      </div>
      
      {/* Subscription plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Low Income Plan with Request Access form */}
        <div className="flex" onClick={() => handleSubscriptionClick()}>
          <LowIncomeSubscriptionButton
            title={lowIncomePlan.title}
            price={lowIncomePlan.price}
            frequency={lowIncomePlan.frequency}
            features={lowIncomePlan.features}
          />
        </div>
        
        {/* Standard Subscription Plans */}
        {subscriptionPlans.map((plan) => (
          <div key={plan.planId} className="flex" onClick={() => handleSubscriptionClick()}>
            <SubscriptionButton
              planId={plan.planId}
              title={plan.title}
              price={plan.price}
              frequency={plan.frequency}
              features={plan.features}
              popular={plan.popular}
            />
          </div>
        ))}
      </div>
      
      {/* Low-income verification notice */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-2">Low-Income Verification Process</h3>
        <p className="text-gray-700 mb-4">
          Our low-income plan requires pre-approval to ensure it reaches those who truly need it. To qualify, you'll need to submit documentation such as:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Proof of government assistance (EI, disability, etc.)</li>
          <li>Income tax assessment notice</li>
          <li>Social assistance benefit statement</li>
          <li>Income verification letter from employer</li>
          <li>Student ID with financial aid documentation</li>
        </ul>
        <p className="text-gray-700 mb-4">
          After submitting your request via the form, our team will review your information and send you payment instructions if approved, typically within 1-2 business days.
        </p>
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-blue-800 font-medium">
            We're committed to making legal assistance accessible to all Canadians, regardless of financial situation.
          </p>
        </div>
      </div>
      
      {/* Enterprise plans */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-2">Need a Custom Solution?</h3>
        <p className="text-gray-700 mb-4">
          For law firms, advocacy groups, and organizations requiring custom solutions, we offer tailored enterprise plans.
        </p>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => toast({
            title: "Contact Form Submitted",
            description: "Our sales team will contact you shortly to discuss custom plans.",
          })}
        >
          Contact Our Sales Team
        </Button>
      </div>
    </div>
  );
}