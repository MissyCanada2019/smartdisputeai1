import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PayPalButton } from "@/components/payments/PayPalButton";
import { useToast } from "@/hooks/use-toast";
import { CreditCard } from "lucide-react";

interface PaymentLinkProps {
  amount: number;
  itemName: string;
  itemDescription?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onPaymentSuccess?: (paymentDetails: any) => void;
  onPaymentError?: (error: any) => void;
}

export function PaymentLink({
  amount,
  itemName,
  itemDescription,
  buttonText = "Buy Credits",
  buttonVariant = "default",
  size = "default",
  className = "",
  onPaymentSuccess,
  onPaymentError
}: PaymentLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePaymentSuccess = (paymentDetails: any) => {
    toast({
      title: "Payment Successful",
      description: `Thank you for your purchase of ${itemName}`,
    });
    
    // Close the dialog after successful payment
    setTimeout(() => {
      setIsOpen(false);
      
      // Call parent callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentDetails);
      }
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={size}
          className={className}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Secure payment processing with PayPal for {itemName}
          </DialogDescription>
        </DialogHeader>
        
        <PayPalButton
          amount={amount}
          itemName={itemName}
          itemDescription={itemDescription}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          showFullCard={false}
        />
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}