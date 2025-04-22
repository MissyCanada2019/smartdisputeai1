from flask import Flask, render_template, request, redirect, url_for, send_file, session, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os

from ocr_parser import run_ocr_pipeline
from merit_weight import analyze_merit_weight
from pricing_and_pdf import generate_pdf_preview

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super_secret_fallback_key")

UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('form.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'GET':
        return render_template('upload.html')

    if 'document' not in request.files:
        return "No file uploaded", 400

    file = request.files['document']
    if file.filename == '':
        return "No file selected", 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        result = run_ocr_pipeline(filepath)
        merit_score, merit_notes = analyze_merit_weight(result)

        preview_filename = f"{filename}_preview.pdf"
        preview_path = os.path.join(app.config['PREVIEW_FOLDER'], preview_filename)
        generate_pdf_preview(result, output_path=preview_path)

        session['preview_file'] = preview_filename
        session['merit_score'] = merit_score
        session['merit_notes'] = merit_notes

        return render_template('payment.html',
                               filename=filename,
                               price=5.99,
                               merit_score=merit_score,
                               merit_notes=merit_notes)

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

@app.route("/analyze", methods=["POST"])
def analyze_case():
    data = request.get_json()
    result = analyze_merit_weight(data)
    return jsonify(result)

@app.route('/paypal-success')
def paypal_success():
    return redirect(url_for('download_file'))

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)
