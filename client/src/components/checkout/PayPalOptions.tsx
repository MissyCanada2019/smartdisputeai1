import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PayPalButton } from "./PayPalButton";

export type PaymentOption = {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  paypalButtonId: string;
};

// Define payment options
const paymentOptions: PaymentOption[] = [
  {
    id: "document-analysis",
    title: "Document Analysis",
    price: "$14.99",
    description: "AI-powered legal document analysis",
    features: [
      "Complexity assessment",
      "Identify legal issues",
      "Plain language explanations",
      "Risk evaluation"
    ],
    paypalButtonId: "QD2XW5BJCKQGU"
  },
  {
    id: "priority-processing",
    title: "Priority Processing",
    price: "$9.99",
    description: "Get expedited service for your documents",
    features: [
      "24-hour turnaround",
      "Priority support",
      "Priority in review queue",
      "Detailed feedback"
    ],
    paypalButtonId: "R4FJL8GB7FRNN" // Using case review button ID for now until dedicated button is created
  },
  {
    id: "case-strategy",
    title: "Case Strategy Report",
    price: "$29.99",
    description: "Comprehensive analysis and strategy",
    features: [
      "Case strength evaluation",
      "Evidence recommendations",
      "Legal precedent analysis",
      "Strategic next steps"
    ],
    paypalButtonId: "R4FJL8GB7FRNN"
  },
  {
    id: "premium-case-review",
    title: "Premium Case Review",
    price: "$49.99",
    description: "Priority case review with extended legal analysis",
    features: [
      "Expedited processing",
      "Comprehensive case analysis",
      "Personalized strategy",
      "Follow-up consultation"
    ],
    paypalButtonId: "6ADXJKVACV736"
  },
  {
    id: "monthly-subscription",
    title: "Monthly Subscription",
    price: "$49.99/month",
    description: "Full access to all platform features",
    features: [
      "Unlimited document access",
      "Evidence analysis",
      "Document generation",
      "Priority support"
    ],
    paypalButtonId: "VPHYTYJQB32Y6"
  }
];

interface PayPalOptionsProps {
  showAll?: boolean;
  selectedOptions?: string[];
}

export const PayPalOptions: React.FC<PayPalOptionsProps> = ({ 
  showAll = true, 
  selectedOptions = [] 
}) => {
  // Filter options if not showing all
  const displayOptions = showAll 
    ? paymentOptions 
    : paymentOptions.filter(option => selectedOptions.includes(option.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      {displayOptions.map((option) => (
        <Card key={option.id} className="flex flex-col transition-all hover:shadow-lg">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle className="text-blue-800">{option.title}</CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-700">
              {option.price}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pt-6">
            <p className="text-gray-600 mb-4">{option.description}</p>
            <ul className="space-y-2">
              {option.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-4 pb-6 flex flex-col items-center">
            <Separator className="mb-4" />
            <div className="w-full">
              <PayPalButton hostedButtonId={option.paypalButtonId} containerId={`paypal-button-${option.id}`} />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};