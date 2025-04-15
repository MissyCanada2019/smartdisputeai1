import { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { loadSubscriptionScript, renderSubscriptionButton } from '@/utils/paypal-loader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SubscriptionButtonProps {
  planId: string;
  title: string;
  price: string;
  frequency: string;
  features: string[];
  popular?: boolean;
}

export default function SubscriptionButton({
  planId,
  title,
  price,
  frequency,
  features,
  popular = false
}: SubscriptionButtonProps) {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);

  useEffect(() => {
    if (!buttonRendered.current) {
      loadSubscriptionScript(() => {
        if (paypalButtonRef.current) {
          // Wait a bit to ensure the DOM is ready
          setTimeout(() => {
            renderSubscriptionButton();
            buttonRendered.current = true;
          }, 100);
        }
      });
    }

    return () => {
      buttonRendered.current = false;
    };
  }, [planId]);

  return (
    <Card className={`flex flex-col h-full ${popular ? 'border-primary shadow-lg' : 'border-gray-200'}`}>
      {popular && (
        <div className="bg-primary text-white py-1 px-4 text-sm font-medium text-center rounded-t-lg">
          Most Popular
        </div>
      )}
      <CardHeader className="pb-0">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-gray-500 ml-1">{frequency}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 mt-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 pt-2">
        <div
          id={`paypal-button-container-${planId}`}
          ref={paypalButtonRef}
          className="w-full"
          data-plan-id={planId}
        ></div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => toast({
            title: "Contact Sales",
            description: "For bulk pricing or special requirements, please contact our sales team.",
          })}
        >
          Contact for Custom Plan
        </Button>
      </CardFooter>
    </Card>
  );
}