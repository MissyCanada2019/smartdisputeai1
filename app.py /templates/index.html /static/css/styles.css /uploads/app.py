from flask import Flask, render_template, request
import os
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    files = request.files.getlist("files")
    for file in files:
        file.save(os.path.join("uploads", file.filename))
    return "Files uploaded and processing started."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)