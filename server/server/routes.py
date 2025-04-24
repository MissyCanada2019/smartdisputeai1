from flask import render_template, request
from server.models import db, Case

def register_routes(app):
    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/upload", methods=["POST"])
    def upload():
        files = request.files.getlist("files")
        for file in files:
            file.save(f"uploads/{file.filename}")
        return "Files uploaded."

    @app.route("/canlii-search", methods=["POST"])
    def canlii_search():
        from functions.src.canlii_scraper import scrape_canlii_cases
        keyword = request.form.get("keyword")
        cases = scrape_canlii_cases(keyword)
        return render_template("canlii_results.html", keyword=keyword, cases=cases)

    @app.route("/save-case", methods=["POST"])
    def save_case():
        title = request.form.get("title")
        url = request.form.get("url")
        new_case = Case(title=title, url=url)
        db.session.add(new_case)
        db.session.commit()
        return f"Saved: {title} <br><a href='/'>Back</a>"

    @app.route("/dashboard")
    def dashboard():
        cases = Case.query.order_by(Case.timestamp.desc()).all()
        return render_template("dashboard.html", cases=cases)
