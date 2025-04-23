from flask import Flask
from server.routes.routes import register_routes

app = Flask(__name__)

# Register all route blueprints
register_routes(app)

@app.route("/")
def home():
    return "SmartDispute.ai is running with modular server structure!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
