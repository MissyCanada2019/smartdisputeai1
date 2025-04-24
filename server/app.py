from flask import Flask
from server.models import db
from server.routes import register_routes

app = Flask(__name__)
register_routes(app)

@app.route("/")
def home():
    return "SmartDispute.ai API is running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///smartdispute.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
register_routes(app)
