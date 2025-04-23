from flask import Flask, render_template, request, send_file, redirect, url_for, after_this_request
from werkzeug.utils import secure_filename
import os, zipfile, io, datetime, shutil

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        files = request.files.getlist("documents")
        if not files:
            return "No files uploaded.", 400

        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        case_id = f"case_{timestamp}"
        case_folder = os.path.join(app.config['UPLOAD_FOLDER'], case_id)
        os.makedirs(case_folder, exist_ok=True)

        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                file.save(os.path.join(case_folder, filename))

        # Simulate form generation
        with open(os.path.join(case_folder, "legal_form.txt"), "w") as f:
            f.write(f"Generated Legal Form for {case_id}")

        # Create ZIP file
        zip_filename = f"{case_id}.zip"
        zip_path = os.path.join(app.config['UPLOAD_FOLDER'], zip_filename)
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, _, files in os.walk(case_folder):
                for file in files:
                    full_path = os.path.join(root, file)
                    arcname = os.path.relpath(full_path, case_folder)
                    zipf.write(full_path, arcname)

        @after_this_request
        def cleanup(response):
            shutil.rmtree(case_folder)
            os.remove(zip_path)
            return response

        return send_file(zip_path, as_attachment=True)

    return render_template("upload.html")

@app.route("/document-analysis")
def analysis():
    return redirect(url_for('upload'))

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=8080)
