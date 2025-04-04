/**
 * PayPal Service - Server side integration for verifying transactions
 */
import paypal from '@paypal/paypal-server-sdk';

// Configure environment
function environment() {
  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  } else {
    return new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID || 'Ae4aYzkf6oRX1GtudHIm9UVWx-U55zBh92pgQKVWnvgel5MvWAW3FYh6nEQ5y-_wcpRCjs5omR4AXyZV', 
      process.env.PAYPAL_CLIENT_SECRET || 'EMwDRd8BjoQoNUNf2Wg_90E9Sv5JiRPkqsbiaQ-6ntk45zPBXuokpTR3vvNIyyBzZg1JcHA5J6Sst6H-'
    );
  }
}

// Create PayPal client
const client = new paypal.core.PayPalHttpClient(environment());

/**
 * Verifies a PayPal order/transaction
 * @param {string} orderId - The PayPal order ID to verify
 * @returns {Promise} - Returns the order details or throws an error
 */
async function verifyPayPalTransaction(orderId) {
  try {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await client.execute(request);
    
    // Check if order was completed successfully
    if (response.result.status === 'COMPLETED') {
      return {
        success: true,
        orderId: orderId,
        status: response.result.status,
        payer: response.result.payer,
        amount: response.result.purchase_units[0].amount,
        createTime: response.result.create_time,
        updateTime: response.result.update_time
      };
    } else {
      return {
        success: false,
        orderId: orderId,
        status: response.result.status,
        message: `Transaction is not completed. Current status: ${response.result.status}`
      };
    }
  } catch (error) {
    console.error('Error verifying PayPal transaction:', error);
    return {
      success: false,
      error: error.message || 'Error verifying PayPal transaction'
    };
  }
}

/**
 * Verifies a PayPal subscription
 * @param {string} subscriptionId - The PayPal subscription ID to verify
 * @returns {Promise} - Returns subscription details or throws an error
 */
async function verifyPayPalSubscription(subscriptionId) {
  try {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
    const response = await client.execute(request);
    
    return {
      success: true,
      subscriptionId: subscriptionId,
      status: response.result.status,
      planId: response.result.plan_id,
      startTime: response.result.start_time,
      subscriber: response.result.subscriber,
      billingInfo: response.result.billing_info
    };
  } catch (error) {
    console.error('Error verifying PayPal subscription:', error);
    return {
      success: false,
      error: error.message || 'Error verifying PayPal subscription'
    };
  }
}

/**
 * Captures a PayPal order
 * @param {string} orderId - The PayPal order ID to capture
 * @returns {Promise} - Returns capture details or throws an error
 */
async function capturePayPalOrder(orderId) {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.prefer("return=representation");
    const response = await client.execute(request);
    
    return {
      success: true,
      orderId: orderId,
      captureId: response.result.purchase_units[0].payments.captures[0].id,
      status: response.result.status,
      amount: response.result.purchase_units[0].payments.captures[0].amount
    };
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return {
      success: false,
      error: error.message || 'Error capturing PayPal order'
    };
  }
}

module.exports = {
  client,
  verifyPayPalTransaction,
  verifyPayPalSubscription,
  capturePayPalOrder
};