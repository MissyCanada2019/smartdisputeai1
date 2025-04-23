from .paypalRoutes import paypal_routes
from .paymentRoutes import payment_routes
# Add other route imports here

def register_routes(app):
    app.register_blueprint(paypal_routes)
    app.register_blueprint(payment_routes)
    # Register others
