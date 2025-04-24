from flask import Blueprint

def register_routes(app):
    # Example route registration
    from server.routes.paymentRoutes import payment_bp
    from server.routes.paypalRoutes import paypal_bp

    app.register_blueprint(payment_bp, url_prefix="/payments")
    app.register_blueprint(paypal_bp, url_prefix="/paypal")
