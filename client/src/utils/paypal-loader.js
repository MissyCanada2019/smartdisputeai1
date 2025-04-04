/**
 * Utility functions for loading and rendering PayPal buttons
 */

/**
 * Loads the PayPal hosted buttons SDK and renders the buttons
 * @param {Function} callback - Function to call when SDK is loaded
 */
export function loadHostedButtonsScript(callback) {
  if (document.querySelector('script[src*="components=hosted-buttons"]')) {
    if (callback) callback();
    return;
  }
  
  const script = document.createElement('script');
  script.src = "https://www.paypal.com/sdk/js?client-id=BAAX70lJFewN5Sur8CW1Za_Q0USFYAZErHKuZtZ9zEqJ9uncHMycZe2W0IeO5ZPk04uV-59Fm3mNP7nXkE&components=hosted-buttons&disable-funding=venmo&currency=CAD";
  script.async = true;
  
  script.onload = () => {
    if (callback) callback();
  };
  
  document.body.appendChild(script);
}

/**
 * Loads the PayPal subscription SDK and renders the buttons
 * @param {Function} callback - Function to call when SDK is loaded
 */
export function loadSubscriptionScript(callback) {
  if (document.querySelector('script[src*="intent=subscription"]')) {
    if (callback) callback();
    return;
  }
  
  const script = document.createElement('script');
  script.src = "https://www.paypal.com/sdk/js?client-id=AaDPFtb7F82jtldZNnVrUjagsqDsiOahIHBARcI_dqyg45XyNt_qeSGdsp_5XO_15AnEUKy7srJVX7_F&vault=true&intent=subscription";
  script.async = true;
  script.setAttribute('data-sdk-integration-source', 'button-factory');
  
  script.onload = () => {
    if (callback) callback();
  };
  
  document.body.appendChild(script);
}

/**
 * Renders hosted PayPal buttons
 */
export function renderHostedButtons() {
  if (!window.paypal || !window.paypal.HostedButtons) return;
  
  // Render document analysis button
  try {
    const container = document.getElementById("paypal-container-QD2XW5BJCKQGU");
    if (container) {
      window.paypal.HostedButtons({
        hostedButtonId: "QD2XW5BJCKQGU",
      }).render("#paypal-container-QD2XW5BJCKQGU");
    }
  } catch (err) {
    console.error("Error rendering document analysis button:", err);
  }
  
  // Render monthly subscription hosted button
  try {
    const container = document.getElementById("paypal-container-VPHYTYJQB32Y6");
    if (container) {
      window.paypal.HostedButtons({
        hostedButtonId: "VPHYTYJQB32Y6",
      }).render("#paypal-container-VPHYTYJQB32Y6");
    }
  } catch (err) {
    console.error("Error rendering subscription button:", err);
  }
}

/**
 * Renders subscription PayPal button
 */
export function renderSubscriptionButton() {
  if (!window.paypal || !window.paypal.Buttons) return;
  
  try {
    const container = document.getElementById("paypal-button-container-P-08038987C9239303UM7XUMQY");
    if (container) {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            /* Creates the subscription */
            plan_id: 'P-08038987C9239303UM7XUMQY'
          });
        },
        onApprove: function(data, actions) {
          alert('Subscription successful! Subscription ID: ' + data.subscriptionID);
          // Here you would typically handle this server-side
          // For example, send the subscription ID to your server
        }
      }).render('#paypal-button-container-P-08038987C9239303UM7XUMQY');
    }
  } catch (err) {
    console.error("Error rendering plan subscription button:", err);
  }
}

/**
 * Unload all PayPal scripts
 */
export function unloadPayPalScripts() {
  const scripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
  scripts.forEach(script => {
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  });
}