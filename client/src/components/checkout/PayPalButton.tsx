import React, { useEffect, useState } from 'react';

interface PayPalButtonProps {
  hostedButtonId: string;
  containerId?: string;
}

// Declare the paypal global type
declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ 
  hostedButtonId, 
  containerId = `paypal-button-${hostedButtonId}` 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let checkInterval: number | null = null;
    let timeoutId: number | null = null;
    
    // Function to render the PayPal button
    const renderPayPalButton = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        try {
          setLoading(true);
          // Find the container element
          const container = document.getElementById(containerId);
          
          if (container) {
            // Clear any existing content first
            container.innerHTML = '';
            
            // Render the PayPal button in the container
            window.paypal.HostedButtons({
              hostedButtonId: hostedButtonId,
            }).render(`#${containerId}`);
            
            setLoading(false);
          } else {
            console.error(`Container with ID ${containerId} not found`);
            setError('Button container not found');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error rendering PayPal button:', err);
          setError('Failed to load payment button');
          setLoading(false);
        }
      } else {
        setError('PayPal SDK not loaded');
        setLoading(false);
      }
    };

    // Check if PayPal is loaded, otherwise wait and try again
    if (window.paypal) {
      renderPayPalButton();
    } else {
      // If not loaded yet, wait for it
      checkInterval = window.setInterval(() => {
        if (window.paypal) {
          if (checkInterval) window.clearInterval(checkInterval);
          renderPayPalButton();
        }
      }, 200);

      // Clear interval after 10 seconds to avoid infinite checking
      timeoutId = window.setTimeout(() => {
        if (checkInterval) window.clearInterval(checkInterval);
        if (!window.paypal) {
          setError('PayPal SDK failed to load');
          setLoading(false);
        }
      }, 10000);
    }

    // Clean up function
    return () => {
      if (checkInterval) window.clearInterval(checkInterval);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [hostedButtonId, containerId]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center py-2 text-sm">{error}</div>
      )}
      <div id={containerId} className="w-full"></div>
    </div>
  );
};