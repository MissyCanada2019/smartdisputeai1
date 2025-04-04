/**
 * PayPal API routes
 */
import express, { Router } from 'express';
const router: Router = express.Router();
import * as paypalService from './services/paypal';

/**
 * Endpoint to verify a PayPal transaction
 * POST /api/paypal/verify-transaction
 */
router.post('/verify-transaction', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    const verification = await paypalService.verifyPayPalTransaction(orderId);
    
    return res.json(verification);
  } catch (error) {
    console.error('Error in verify-transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying transaction',
      error: error.message
    });
  }
});

/**
 * Endpoint to verify a PayPal subscription
 * POST /api/paypal/verify-subscription
 */
router.post('/verify-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }
    
    const verification = await paypalService.verifyPayPalSubscription(subscriptionId);
    
    return res.json(verification);
  } catch (error) {
    console.error('Error in verify-subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying subscription',
      error: error.message
    });
  }
});

/**
 * Endpoint to capture a PayPal order
 * POST /api/paypal/capture-order
 */
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    const captureResult = await paypalService.capturePayPalOrder(orderId);
    
    return res.json(captureResult);
  } catch (error) {
    console.error('Error in capture-order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error capturing order',
      error: error.message
    });
  }
});

/**
 * PayPal webhook endpoint to receive order notifications
 * POST /api/paypal/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    // Get the webhook data from PayPal
    const { event_type, resource } = req.body;
    
    console.log('Received PayPal webhook:', event_type);
    
    // Verify the webhook (in production, add webhook signature validation)
    
    // Handle different event types
    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was captured successfully
        // Update your database, send confirmation email, etc.
        console.log('Payment captured successfully:', resource.id);
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        // Payment was denied
        console.log('Payment denied:', resource.id);
        break;
        
      case 'CHECKOUT.ORDER.APPROVED':
        // Order was approved but not yet captured
        console.log('Order approved:', resource.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.CREATED':
        // New subscription created
        console.log('Subscription created:', resource.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Subscription activated
        console.log('Subscription activated:', resource.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Subscription cancelled
        console.log('Subscription cancelled:', resource.id);
        break;
        
      default:
        console.log('Unhandled event type:', event_type);
    }
    
    // Always return 200 to acknowledge receipt of the webhook
    return res.status(200).json({
      success: true,
      message: 'Webhook received successfully'
    });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    // Still return 200 to prevent PayPal from retrying
    return res.status(200).json({
      success: true,
      message: 'Webhook received with errors'
    });
  }
});

export default router;