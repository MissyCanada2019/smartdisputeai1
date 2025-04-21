from flask import Flask, request, render_template, send_file, redirect, url_for
from werkzeug.utils import secure_filename
import os
from ocr_parser import run_ocr_pipeline

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/form")
def form():
    return render_template("form.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if 'document' not in request.files:
        return "No file part", 400

    file = request.files['document']
    if file.filename == '':
        return "No selected file", 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            result = run_ocr_pipeline(filepath)
            return render_template("success.html", result=result)
        except Exception as e:
            return f"Error: {str(e)}", 500

    return "Invalid file type", 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
@app.route('/')
def index():
    return render_template("form.html")

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'document' not in request.files:
        return "No file part", 400

    file = request.files['document']
    if file.filename == '':
        return "No selected file", 400

    filepath = os.path.join("uploads", file.filename)
    file.save(filepath)

    result = run_ocr_pipeline(filepath)
    return render_template("success.html", result=result)
