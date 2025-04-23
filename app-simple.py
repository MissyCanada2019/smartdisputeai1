from flask import Flask, render_template, request, redirect, url_for, send_file, send_from_directory
from werkzeug.utils import secure_filename
from docxtpl import DocxTemplate
from datetime import datetime
from zipfile import ZipFile
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
GENERATED_FOLDER = 'generated_forms'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['GENERATED_FOLDER'] = GENERATED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        if 'document' not in request.files:
            return "No file part", 400
        file = request.files['document']
        if file.filename == '':
            return "No selected file", 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return f"File {filename} uploaded successfully!"

    return render_template("upload.html")

@app.route("/document-analysis")
def analysis():
    return redirect(url_for('upload'))

@app.route("/generate", methods=["POST"])
def generate_document():
    data = request.form.to_dict()

    tenant_name = data.get("tenant_name", "John Doe")
    landlord_name = data.get("landlord_name", "Mr. Smith")
    address = data.get("address", "123 Tenant Ave, Toronto")
    issue = data.get("issue", "Ongoing repair issue not addressed by landlord")
    province = data.get("province", "ON")
    user_id = data.get("user_id", "anon")
    filename = data.get("filename", "")
    date = datetime.now().strftime("%B %d, %Y")

    template_path = f"templates/disputes/{province}/landlord_tenant/repair_notice.docx"
    generated_path = f"{GENERATED_FOLDER}/{user_id}_repair_letter.docx"
    evidence_path = os.path.join(UPLOAD_FOLDER, filename)
    zip_path = f"{GENERATED_FOLDER}/{user_id}_package.zip"

    os.makedirs(GENERATED_FOLDER, exist_ok=True)

    doc = DocxTemplate(template_path)
    doc.render({
        "date": date,
        "landlord_name": landlord_name,
        "tenant_name": tenant_name,
        "address": address,
        "issue": issue
    })
    doc.save(generated_path)

    if os.path.exists(evidence_path):
        with ZipFile(zip_path, "w") as zipf:
            zipf.write(generated_path, os.path.basename(generated_path))
            zipf.write(evidence_path, os.path.basename(evidence_path))
        return send_file(zip_path, as_attachment=True)

    return send_file(generated_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=8080)
