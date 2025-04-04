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
  
  // Render case review button
  try {
    const container = document.getElementById("paypal-container-R4FJL8GB7FRNN");
    if (container) {
      window.paypal.HostedButtons({
        hostedButtonId: "R4FJL8GB7FRNN",
      }).render("#paypal-container-R4FJL8GB7FRNN");
    }
  } catch (err) {
    console.error("Error rendering case review button:", err);
  }
  
  // Render premium case review button
  try {
    const container = document.getElementById("paypal-container-6ADXJKVACV736");
    if (container) {
      window.paypal.HostedButtons({
        hostedButtonId: "6ADXJKVACV736",
      }).render("#paypal-container-6ADXJKVACV736");
    }
  } catch (err) {
    console.error("Error rendering premium case review button:", err);
  }
}

/**
 * Renders subscription PayPal button
 */
export function renderSubscriptionButton() {
  if (!window.paypal || !window.paypal.Buttons) return;
  
  // List of subscription plan IDs to render
  const subscriptionPlans = [
    'P-08038987C9239303UM7XUMQY',
    'P-9AX658241M042612XM7XYWQA',
    'P-7JM446383R159705KM7XYYGI'
  ];
  
  // Render each subscription button
  subscriptionPlans.forEach(planId => {
    try {
      const container = document.getElementById(`paypal-button-container-${planId}`);
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
              plan_id: planId
            });
          },
          onApprove: function(data, actions) {
            alert('Subscription successful! Subscription ID: ' + data.subscriptionID);
            // Here you would typically handle this server-side
            // For example, redirect to payment success page
            window.location.href = `/payment-success?subscriptionId=${data.subscriptionID}&type=subscription`;
          }
        }).render(`#paypal-button-container-${planId}`);
      }
    } catch (err) {
      console.error(`Error rendering subscription button for plan ${planId}:`, err);
    }
  });
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