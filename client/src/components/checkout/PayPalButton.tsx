import React, { useEffect } from 'react';

interface PayPalButtonProps {
  hostedButtonId: string;
  containerId?: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ 
  hostedButtonId, 
  containerId = `paypal-container-${hostedButtonId}` 
}) => {
  
  useEffect(() => {
    // Check if PayPal SDK is loaded
    if (window.paypal) {
      // Render the PayPal button
      window.paypal.HostedButtons({
        hostedButtonId: hostedButtonId,
      }).render(`#${containerId}`);
    } else {
      console.error("PayPal SDK is not loaded");
    }

    // Cleanup function
    return () => {
      // Remove any PayPal button related elements if needed
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [hostedButtonId, containerId]);

  return <div id={containerId}></div>;
};

// Add PayPal to the window object type
declare global {
  interface Window {
    paypal: any;
  }
}