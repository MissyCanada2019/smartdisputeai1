/**
 * PayPal Fastlane Integration - Client side utilities
 */

// Function to load PayPal SDK dynamically
export const loadPayPalSDK = async (clientId: string, clientToken: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if the script is already loaded
      if (document.querySelector('script[data-paypal-script]')) {
        resolve();
        return;
      }

      // Create the script element
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=fastlane`;
      script.setAttribute('data-paypal-script', 'true');
      script.setAttribute('data-sdk-client-token', clientToken);
      script.async = true;

      // Handle script loading events
      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error loading PayPal SDK:', error);
        reject(new Error('Failed to load PayPal SDK'));
      };

      // Add the script to the document
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error setting up PayPal SDK:', error);
      reject(error);
    }
  });
};

// Function to initialize Fastlane
export const initFastlane = async (locale: string = 'en_us'): Promise<any> => {
  // @ts-ignore - PayPal global is loaded from the SDK script
  if (!window.paypal || !window.paypal.Fastlane) {
    throw new Error('PayPal SDK not loaded or Fastlane component not available');
  }

  try {
    // @ts-ignore - PayPal global is loaded from the SDK script
    const fastlane = window.paypal.Fastlane({
      // Configuration options
      locale: locale, // en_us, es_us, fr_us, zh_us
    });

    return fastlane;
  } catch (error) {
    console.error('Error initializing PayPal Fastlane:', error);
    throw error;
  }
};

// Function to fetch client token from our server
export const getClientToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/paypal/client-token');
    const data = await response.json();

    if (!data.success || !data.clientToken) {
      throw new Error(data.error || 'Failed to get client token');
    }

    return data.clientToken;
  } catch (error) {
    console.error('Error fetching PayPal client token:', error);
    throw error;
  }
};

// Function to create an order with our server
export const createOrder = async (amount: string, currency: string = 'USD', description?: string): Promise<string> => {
  try {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
      }),
    });

    const data = await response.json();

    if (!data.success || !data.orderId) {
      throw new Error(data.error || 'Failed to create order');
    }

    return data.orderId;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

// Function to capture a payment from our server
export const captureOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to capture order');
    }

    return data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};

// Function to render the Fastlane watermark for email input
export const renderFastlaneWatermark = (container: HTMLElement): void => {
  try {
    // @ts-ignore - PayPal global is loaded from the SDK script
    if (!window.paypal || !window.paypal.Fastlane) {
      console.error('PayPal SDK not loaded or Fastlane component not available');
      return;
    }

    // @ts-ignore - PayPal global is loaded from the SDK script
    window.paypal.Fastlane.renderWatermark(container, {
      // Optional watermark configuration
    });
  } catch (error) {
    console.error('Error rendering PayPal Fastlane watermark:', error);
  }
};