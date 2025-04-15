/**
 * PayPal Routes - Endpoints for PayPal integration
 */
import { Router, Request, Response } from 'express';
import paypal from '@paypal/paypal-server-sdk';
import { client, verifyPayPalTransaction, verifyPayPalSubscription, capturePayPalOrder } from './services/paypal';

const router = Router();

// Generate client token for Fastlane integration
router.get('/client-token', async (req: Request, res: Response) => {
  try {
    // Create a mock request since we're having issues with the SDK
    const request = {
      path: '/v1/identity/generate-client-token',
      method: 'POST'
    };
    
    // Execute the request to generate a client token
    const response = await client.execute(request);
    
    // Return the client token
    return res.json({
      success: true,
      clientToken: response.result.client_token
    });
  } catch (error: any) {
    console.error('Error generating PayPal client token:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error generating PayPal client token'
    });
  }
});

// Verify PayPal transaction
router.post('/verify-transaction', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  
  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required'
    });
  }
  
  try {
    // Create a mock request
    const request = {
      path: `/v2/checkout/orders/${orderId}`,
      method: 'GET'
    };
    
    const response = await client.execute(request);
    
    // Use our existing function for consistency in response format
    const verificationResult = {
      success: true,
      orderId: orderId,
      status: response.result.status,
      payer: response.result.payer,
      amount: response.result.purchase_units?.[0]?.amount,
      createTime: response.result.create_time,
      updateTime: response.result.update_time
    };
    
    return res.json(verificationResult);
  } catch (error: any) {
    console.error('Error verifying PayPal transaction:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error verifying PayPal transaction'
    });
  }
});

// Verify PayPal subscription
router.post('/verify-subscription', async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;
  
  if (!subscriptionId) {
    return res.status(400).json({
      success: false,
      error: 'Subscription ID is required'
    });
  }
  
  try {
    // Create a mock request
    const request = {
      path: `/v1/billing/subscriptions/${subscriptionId}`,
      method: 'GET'
    };
    
    const response = await client.execute(request);
    
    // Use our existing function for consistency in response format
    const verificationResult = {
      success: true,
      subscriptionId: subscriptionId,
      status: response.result.status,
      planId: response.result.plan_id,
      startTime: response.result.start_time,
      subscriber: response.result.subscriber,
      billingInfo: response.result.billing_info
    };
    
    return res.json(verificationResult);
  } catch (error: any) {
    console.error('Error verifying PayPal subscription:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error verifying PayPal subscription'
    });
  }
});

// Capture PayPal order
router.post('/capture-order', async (req: Request, res: Response) => {
  const { orderId } = req.body;
  
  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required'
    });
  }
  
  try {
    // Create a mock request
    const request = {
      path: `/v2/checkout/orders/${orderId}/capture`,
      method: 'POST',
      prefer: "return=representation"
    };
    
    const response = await client.execute(request);
    
    // Use our existing function for consistency in response format with optional chaining
    const captureResult = {
      success: true,
      orderId: orderId,
      captureId: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      status: response.result.status,
      amount: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
    };
    
    return res.json(captureResult);
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error capturing PayPal order'
    });
  }
});

// Create order for Fastlane checkout
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'USD', intent = 'CAPTURE', description } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }
    
    // Create a mock request since we're having issues with the SDK
    const request = {
      path: '/v2/checkout/orders',
      method: 'POST',
      requestBody: {
        intent: intent,
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount
          },
          description: description || 'SmartDispute Service'
        }]
      }
    };
    
    const response = await client.execute(request);
    
    return res.json({
      success: true,
      orderId: response.result.id,
      status: response.result.status,
      links: response.result.links
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error creating PayPal order'
    });
  }
});

export default router;