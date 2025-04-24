from flask import Flask
from models import db
from routes import register_routes

app = Flask(__name__)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///smartdispute.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the app
db.init_app(app)

# Register routes
register_routes(app)

@app.route("/")
def home():
    return "SmartDispute.ai API is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
