import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RequestAccessForm from './RequestAccessForm';

interface LowIncomeSubscriptionButtonProps {
  title: string;
  price: string;
  frequency: string;
  features: string[];
  popular?: boolean;
}

export default function LowIncomeSubscriptionButton({
  title,
  price,
  frequency,
  features,
  popular = false
}: LowIncomeSubscriptionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  const handleRequestSuccess = () => {
    // Close the form dialog after successful submission
    setIsDialogOpen(false);
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              Request Access
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Request Low-Income Access</DialogTitle>
              <DialogDescription>
                Please complete this form to request access to our low-income plan. We'll review your application and respond within 1-2 business days.
              </DialogDescription>
            </DialogHeader>
            <RequestAccessForm onSuccess={handleRequestSuccess} />
          </DialogContent>
        </Dialog>
        
        <div className="text-sm text-center text-gray-500 mt-2">
          Verification required before approval
        </div>
      </CardFooter>
    </Card>
  );
}