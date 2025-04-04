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
    // Create container for PayPal button if it doesn't exist
    if (!document.getElementById(containerId)) {
      const container = document.createElement('div');
      container.id = containerId;
      document.getElementById('root')?.appendChild(container);
    }

    // Render the PayPal button
    const renderPayPalButton = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        try {
          setLoading(true);
          window.paypal.HostedButtons({
            hostedButtonId: hostedButtonId,
          }).render(`#${containerId}`);
          setLoading(false);
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

    // Check if PayPal is loaded, otherwise wait
    if (window.paypal) {
      renderPayPalButton();
    } else {
      // If not loaded yet, wait for it
      const checkPayPalInterval = setInterval(() => {
        if (window.paypal) {
          clearInterval(checkPayPalInterval);
          renderPayPalButton();
        }
      }, 100);

      // Clear interval after 10 seconds to avoid infinite checking
      setTimeout(() => {
        clearInterval(checkPayPalInterval);
        if (!window.paypal) {
          setError('PayPal SDK failed to load');
          setLoading(false);
        }
      }, 10000);
    }

    // Clean up function
    return () => {
      const container = document.getElementById(containerId);
      if (container && container.parentNode !== document.getElementById('root')) {
        container.parentNode?.removeChild(container);
      }
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