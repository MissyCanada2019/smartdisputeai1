from flask import Flask, render_template, request
import os

# Import your scraper
from functions.src.canlii_scraper import scrape_canlii_cases

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

# NEW: Route for CanLII search
@app.route("/canlii-search", methods=["POST"])
def canlii_search():
    keyword = request.form.get("keyword")
    if not keyword:
        return "Please enter a keyword", 400

    cases = scrape_canlii_cases(keyword)
    return render_template("canlii_results.html", keyword=keyword, cases=cases)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
