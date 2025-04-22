from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Create upload folder if not exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

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
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return f"File {filename} uploaded successfully!"

    return render_template("upload.html")

@app.route("/document-analysis")
def analysis():
    return redirect(url_for('upload'))

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=8080)
