import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PayPalHostedButton from './PayPalHostedButton';
import PayPalBuyNowButton from './PayPalBuyNowButton';

// Define the add-on options
const addOns = [
  {
    id: 1,
    title: "Document Analysis",
    description: "AI analysis of legal documents",
    price: "$4.99",
    features: [
      "Key information extraction",
      "Document complexity assessment",
      "24-hour turnaround"
    ],
    paypalButtonId: "JV8988GUCPJ3Q", // Hosted button ID
    paypalPaymentId: "7K4SREHDBAZ7E" // Using specific payment ID provided
  },
  {
    id: 2,
    title: "Legal Document Generation",
    description: "Create customized legal documents",
    price: "$5.99",
    features: [
      "Province-specific templates",
      "Fillable PDF format",
      "Unlimited revisions"
    ],
    paypalButtonId: "JV8988GUCPJ3Q", // Using the same hosted button ID for demo
    paypalPaymentId: "7K4SREHDBAZ7E" // Using specific payment ID provided
  },
  {
    id: 3,
    title: "Case Analysis",
    description: "Comprehensive analysis of your legal situation",
    price: "$7.99",
    features: [
      "Precedent research",
      "Personalized legal strategy",
      "Expert recommendations"
    ],
    paypalButtonId: "JV8988GUCPJ3Q", // Using the same hosted button ID for demo
    paypalPaymentId: "7K4SREHDBAZ7E" // Using specific payment ID provided
  }
];

interface AddOnOptionsProps {
  useNewPayPalButtons?: boolean;
}

export default function AddOnOptions({ useNewPayPalButtons = true }: AddOnOptionsProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);

  const toggleAddOn = (id: number) => {
    if (selectedAddOns.includes(id)) {
      setSelectedAddOns(selectedAddOns.filter(item => item !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, id]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Add-On Services</h2>
        <p className="text-gray-600 mb-6">
          Enhance your subscription with these additional services, 
          available as one-time purchases.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {addOns.map((addOn) => (
          <Card key={addOn.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{addOn.title}</CardTitle>
              <CardDescription>{addOn.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-4">{addOn.price}</div>
              <Separator className="mb-4" />
              <ul className="space-y-2">
                {addOn.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {useNewPayPalButtons ? (
                <div className="w-full">
                  <PayPalBuyNowButton paymentId={addOn.paypalPaymentId} />
                </div>
              ) : (
                <div className="w-full">
                  <PayPalHostedButton buttonId={addOn.paypalButtonId} />
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}