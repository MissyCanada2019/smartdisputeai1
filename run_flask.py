"""
SmartDispute.ai Flask Application Launcher
This script runs the Flask application for the dispute letter generator
"""

import os
import sys
import datetime
from app_simple import app

def main():
    """Run the Flask application for the dispute letter generator"""
    
    # Add current year to Flask's template context
    @app.context_processor
    def inject_current_year():
        return {'current_year': datetime.datetime.now().year}
    
    # Pass PayPal client ID from environment variable
    @app.context_processor
    def inject_paypal_client_id():
        return {'paypal_client_id': os.environ.get('PAYPAL_CLIENT_ID', '')}
    
    # Set up upload folder for generated files
    upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'docs')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Set host and port from environment variables if available
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5050))
    
    app.run(host=host, port=port, debug=True)

if __name__ == '__main__':
    sys.exit(main())