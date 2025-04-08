# Payment Analytics Documentation

## Overview
This documentation covers the enhanced e-commerce analytics implementation for SmartDispute.ai's payment flow. The implementation uses Google Analytics 4 (GA4) with enhanced event tracking for a complete view of the user's payment journey.

## Analytics Modules
The analytics system consists of the following components:

1. **Enhanced Analytics Module**: `static/js/analytics-enhanced.js`
   - Central analytics functionality for consistent tracking across pages
   - Standardized event tracking functions for the entire application
   - Supports e-commerce, form engagement, and error tracking

2. **Integration Points**
   - Payment page: `templates/paypal_payment_page.html`
   - Success page: `templates/enhanced_payment_success.html` 

## Tracked Events

The analytics system tracks the following standard e-commerce events:

### Funnel Events
- **Page View**: User visits a specific page
  - `page_view` event with page categorization
- **View Item**: User views service details
  - `view_item` event with product details
- **Begin Checkout**: User enters the checkout flow
  - `begin_checkout` event with product and pricing details
- **Add Payment Info**: User initiates payment method selection
  - `add_payment_info` event with payment method and product details
- **Purchase**: User completes a transaction
  - `purchase` event with complete transaction details from PayPal
- **Form Engagement**: Tracks form interactions
  - `form_submit` events with form details

### Custom Events
- **Purchase Confirmation**: User views the success page
  - `purchase_confirmation_viewed` event with transaction details
- **Document Generation**: Tracks document creation
  - `document_generated` event with document type and service tier
- **Error Events**: Tracks various errors in the application
  - `error` event with detailed error information

## Data Structure

### Standard Item Structure
```javascript
const itemData = {
  item_id: 'doc-analysis-premium',
  item_name: 'Comprehensive Document Analysis',
  price: 49.99,
  quantity: 1,
  item_category: 'Legal Services'
};
```

### Transaction Data Structure
```javascript
const transactionData = {
  transaction_id: 'PAY-1AB23456CD789012EF34GHIJ', // From PayPal
  value: 49.99,
  currency: 'CAD',
  payment_method: 'PayPal',
  tax: 0,
  shipping: 0
};
```

## Implementation Details

### Setup
Add the enhanced analytics module to any page:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S3WXDJLT2T"></script>
<!-- Enhanced Analytics Module -->
<script src="{{ url_for('static', filename='js/analytics-enhanced.js') }}"></script>
<script>
    // Initialize Analytics
    window.sdAnalytics.initializeAnalytics('G-S3WXDJLT2T');
</script>
```

### Usage Examples

#### Track a Page View
```javascript
window.sdAnalytics.trackPageView('Payment Page', 'Checkout');
```

#### Track a Product View
```javascript
window.sdAnalytics.trackViewItem(itemData, {
    currency: 'CAD'
});
```

#### Track a Purchase
```javascript
window.sdAnalytics.trackPurchase(transactionData, itemData);
```

#### Track Form Engagement
```javascript
window.sdAnalytics.trackFormSubmission('payment_form_complete', {
    payment_successful: true,
    service_type: 'Comprehensive Document Analysis'
});
```

## PayPal Integration

The PayPal integration extracts actual transaction data from the PayPal API response:

```javascript
onApprove: function(data, actions) {
    return actions.order.capture().then(function(orderData) {
        // Extract transaction details from PayPal response
        const transaction = orderData.purchase_units[0].payments.captures[0];
        const orderId = transaction.id;
        const amount = transaction.amount.value;
        const currency = transaction.amount.currency_code;
        
        // Track with real transaction data
        const transactionData = {
            transaction_id: orderId,
            value: parseFloat(amount),
            currency: currency,
            payment_method: 'PayPal'
        };
        
        // Track the purchase
        window.sdAnalytics.trackPurchase(transactionData, itemData);
        
        // Redirect to success page with transaction details
        window.location.href = `/payment-success?order_id=${orderId}&amount=${amount}&currency=${currency}`;
    });
}
```

## Best Practices

1. **Consistent Data Structure**: Use the same item structure across all tracking points
2. **Real Transaction Data**: Always use real transaction data from PayPal API responses
3. **Comprehensive Funnel**: Track all steps in the payment flow from view to purchase
4. **Error Tracking**: Monitor payment errors to identify conversion issues
5. **Custom Event Properties**: Add relevant custom properties to standard events

## Report Examples

The implementation supports the following GA4 reports:

1. **E-commerce Overview**: Complete funnel visualization
2. **Checkout Behavior**: Step-by-step checkout analysis
3. **Product Performance**: Service popularity and conversion rates
4. **Revenue Analysis**: Transaction values and customer lifetime value

## Troubleshooting

If events are not showing up in Google Analytics:
1. Verify that the GA4 measurement ID is correctly set
2. Check browser console for JavaScript errors
3. Enable GA4 Debug mode to verify events are being sent
4. Ensure all required parameters have proper values