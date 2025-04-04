import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalHostedButtonProps {
  buttonId: string;
  clientId?: string;
}

export default function PayPalHostedButton({ buttonId, clientId = 'BAAX70lJFewN5Sur8CW1Za_Q0USFYAZErHKuZtZ9zEqJ9uncHMycZe2W0IeO5ZPk04uV-59Fm3mNP7nXkE' }: PayPalHostedButtonProps) {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Avoid loading the script multiple times
    if (document.querySelector(`script[src*="paypal.com/sdk/js"][data-button-id="${buttonId}"]`)) {
      scriptLoaded.current = true;
    }

    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=CAD`;
      script.dataset.buttonId = buttonId;
      script.async = true;
      
      script.onload = () => {
        scriptLoaded.current = true;
        if (paypalContainerRef.current && window.paypal) {
          window.paypal.HostedButtons({
            hostedButtonId: buttonId,
          }).render(`#paypal-container-${buttonId}`);
        }
      };
      
      document.body.appendChild(script);
      
      return () => {
        // Cleanup
        document.body.removeChild(script);
      };
    } else if (scriptLoaded.current && paypalContainerRef.current && window.paypal) {
      // If script is already loaded but container was just mounted
      window.paypal.HostedButtons({
        hostedButtonId: buttonId,
      }).render(`#paypal-container-${buttonId}`);
    }
  }, [buttonId, clientId]);

  return <div id={`paypal-container-${buttonId}`} ref={paypalContainerRef}></div>;
}