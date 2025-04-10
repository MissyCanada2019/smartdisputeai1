
from flask import Flask, request, jsonify, send_from_directory
import requests
import os

app = Flask(__name__, static_folder='static')

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    prompt = data.get("prompt", "")

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "anthropic/claude-3-sonnet",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({"error": "API Error", "details": response.text}), 500

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/payment")
def payment():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Complete Payment</title>
        <style>
            body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
            .payment-box { border: 1px solid #ccc; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .pay-button { background-color: #0070ba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>
        <h1>Complete Your Payment</h1>
        <div class="payment-box">
            <h2>Claude Chat Access</h2>
            <p>Price: $4.99</p>
            <div id="paypal-button-container"></div>
        </div>
        <script src="https://www.paypal.com/sdk/js?client-id=test&currency=USD"></script>
        <script>
            paypal.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '4.99'
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        window.location.href = '/';
                    });
                }
            }).render('#paypal-button-container');
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
