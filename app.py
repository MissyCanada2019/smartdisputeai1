from flask import Flask, request, render_template, redirect, url_for, send_file, render_template_string, jsonify
import os
import stripe
from werkzeug.utils import secure_filename
from ai_handler import extract_text_from_file, analyze_text_with_ai
from pricing_and_pdf import determine_price_and_type, generate_pdf_preview
from dotenv import load_dotenv
import logging

# Import OCR functionality 
from ocr_routes import ocr_routes

# Initialize app
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png', 'tif', 'tiff'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Load environment variables
load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

# Register OCR Blueprint
app.register_blueprint(ocr_routes)

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)

# --- ROUTES ---
@app.route('/')
def index():
    return render_template('upload_form.html')

@app.route('/form')
def form():
    return render_template('submit.html')

# (Keep all your other routes below as-is)

# --- START SERVER ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
