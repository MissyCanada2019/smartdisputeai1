import os
from flask import Flask, render_template, request, redirect, url_for, send_file, session
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from pricing_and_pdf import generate_pdf_preview
from ocr_parser import run_ocr_pipeline

# Load environment variables
load_dotenv()

# Flask app config
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_key")

UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)

# File type check
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---

@app.route('/')
def index():
    return render_template('form.html')  # Upload form template

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

        # Run OCR and AI analysis
        result = run_ocr_pipeline(filepath)

        # Generate preview
        preview_filename = f"{filename}_preview.pdf"
        preview_path = os.path.join(app.config['PREVIEW_FOLDER'], preview_filename)
        generate_pdf_preview(result, output_path=preview_path)

        # Save preview name in session
        session['preview_file'] = preview_filename

        return render_template('payment.html', filename=filename, price=5.99)

    return "Invalid file type", 400

@app.route('/download')
def download_file():
    filename = session.get('preview_file')
    if not filename:
        return "No file available for download", 403

    path = os.path.join(app.config['PREVIEW_FOLDER'], filename)
    if os.path.exists(path):
        return send_file(path, as_attachment=True)
    return "File not found", 404

@app.route('/paypal-success')
def paypal_success():
    return redirect(url_for('download_file'))

# --- Start Server ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
