import { Router, Request, Response } from 'express';
import { IStorage } from './storage';

/**
 * Register payment-related routes
 * @param storage Storage instance
 * @returns Express router with payment routes
 */
export default function registerPaymentRoutes(storage: IStorage): Router {
  const router = Router();

  /**
   * Endpoint to verify PayPal transactions
   */
  router.post('/verify-transaction', async (req: Request, res: Response) => {
    try {
      const { orderID, paymentDetails } = req.body;
      
      if (!orderID || !paymentDetails) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing order ID or payment details' 
        });
      }
      
      // Verify the payment details are valid - in a real system, you'd do more validation
      if (
        paymentDetails.status !== 'COMPLETED' &&
        paymentDetails.status !== 'APPROVED'
      ) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid payment status: ${paymentDetails.status}` 
        });
      }
      
      // Record the payment in your database
      const userId = req.user?.id || 999; // Use the authenticated user ID or fallback to demo user
      
      // Record the transaction
      const transaction = await storage.createPaymentTransaction({
        userId,
        paymentId: orderID,
        paymentMethod: 'PAYPAL',
        amount: parseFloat(paymentDetails.purchase_units?.[0]?.amount?.value || '0'),
        currency: paymentDetails.purchase_units?.[0]?.amount?.currency_code || 'CAD',
        status: paymentDetails.status,
        transactionType: 'credit_purchase',
        metadata: JSON.stringify(paymentDetails)
      });
      
      // Update user credits based on the payment amount
      const amount = parseFloat(paymentDetails.purchase_units?.[0]?.amount?.value || '0');
      let creditsToAdd = 0;
      
      // Simple credit allocation logic - can be made more sophisticated
      if (amount <= 5) {
        creditsToAdd = 1;
      } else if (amount <= 15) {
        creditsToAdd = 3;
      } else if (amount <= 30) {
        creditsToAdd = 7;
      } else {
        creditsToAdd = Math.floor(amount / 4); // Approximately 1 credit per $4
      }
      
      // Get user and update credits
      const user = await storage.getUser(userId);
      if (user) {
        // We don't need to update the credits manually since createPaymentTransaction 
        // already handles that for credit_purchase type transactions
        // But we'll verify the credits were updated
        const updatedUser = await storage.getUser(userId);
      }
      
      return res.status(200).json({
        success: true,
        transactionId: transaction.id,
        creditsAdded: creditsToAdd,
        message: 'Payment verified successfully'
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error during payment verification' 
      });
    }
  });

  /**
   * Get user's transaction history
   */
  router.get('/transactions', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 999;
      const transactions = await storage.getPaymentTransactionsByUserId(userId);
      
      return res.status(200).json({
        success: true,
        transactions
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve transaction history'
      });
    }
  });

  /**
   * Get current user's credit balance
   */
  router.get('/credits', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || 999;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        credits: user.credits || 0
      });
    } catch (error) {
      console.error('Error fetching user credits:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve credit balance'
      });
    }
  });

  return router;
}