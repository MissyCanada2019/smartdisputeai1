from flask import Flask
from server.models import db
from server.routes.routes import register_routes  # important: this targets the right file

app = Flask(__name__)

# Config for SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///smartdispute.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

# Register routes
register_routes(app)

@app.route("/")
def home():
    return "SmartDispute.ai API is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
