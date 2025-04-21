import os
from flask import Flask, request, render_template, session, redirect, url_for, send_file
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from pricing_and_pdf import generate_pdf_preview
from ocr_parser import run_ocr_pipeline

# Load .env variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super_secret_fallback_key")

# Config for upload limits and folders
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['PREVIEW_FOLDER'] = 'previews'
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 64MB upload limit
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}

# Ensure upload/preview folders exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PREVIEW_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Homepage / Upload Form
@app.route('/')
def index():
    return render_template('form.html')

# File Upload Endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'document' not in request.files:
        return "No file uploaded", 400

    file = request.files['document']
    if file.filename == '':
        return "No file selected", 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # OCR + AI logic
        result = run_ocr_pipeline(filepath)

        # Generate preview PDF
        preview_filename = f"{filename}_preview.pdf"
        preview_path = os.path.join(app.config['PREVIEW_FOLDER'], preview_filename)
        generate_pdf_preview(result, output_path=preview_path)

        # Save filename in session
        session['preview_file'] = preview_filename

        return render_template("payment.html", filename=filename, price=5.99)

    return "Invalid file type", 400

# Download Final PDF After Payment
@app.route('/download')
def download_preview():
    filename = session.get('preview_file')
    if not filename:
        return "Unauthorized or session expired", 403

    file_path = os.path.join(app.config['PREVIEW_FOLDER'], filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return "File not found", 404

# PayPal redirect success
@app.route('/paypal-success')
def paypal_success():
    return redirect(url_for('download_preview'))

# Run server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
