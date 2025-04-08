"""
PayPal Demo App for SmartDispute.ai
Simple Flask application to demonstrate PayPal integration with Google Analytics 4
"""

import os
import uuid
import datetime
from flask import Flask, request, render_template, redirect, url_for, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    """Display homepage with link to payment page"""
    return render_template('paypal_index.html')

@app.route('/paypal-payment')
def paypal_payment():
    """Handle PayPal payment page"""
    return render_template('paypal_payment_page.html', 
                          paypal_client_id=os.environ.get('PAYPAL_CLIENT_ID', ''))

@app.route('/payment-success')
def payment_success():
    """Handle payment success page"""
    # Get order details from query parameters or use defaults
    order_id = request.args.get('order_id', 'ORDER-' + str(uuid.uuid4())[:8])
    amount = request.args.get('amount', '49.99')
    currency = request.args.get('currency', 'CAD')
    date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template('payment_success.html', 
                          order_id=order_id,
                          amount=amount,
                          currency=currency,
                          date=date)

if __name__ == '__main__':
    # Check if PayPal client ID is set
    if not os.environ.get('PAYPAL_CLIENT_ID'):
        print("Warning: PAYPAL_CLIENT_ID environment variable is not set.")
        print("Set it with: export PAYPAL_CLIENT_ID=your_paypal_client_id")
    
    app.run(debug=True, host='0.0.0.0', port=5001)