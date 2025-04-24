from flask import request, jsonify
from server.models import db, Case

def register_routes(app):
    @app.route("/canlii-search", methods=["POST"])
    def canlii_search():
        keyword = request.form.get("keyword")
        results = [{"title": f"Sample Case Related to {keyword}", "url": f"https://www.canlii.org/en/ca/search/?keyword={keyword}"}]
        return jsonify(results)

    @app.route("/save-case", methods=["POST"])
    def save_case():
        title = request.form["title"]
        url = request.form["url"]
        new_case = Case(title=title, url=url)
        db.session.add(new_case)
        db.session.commit()
        return "Saved"

    @app.route("/dashboard", methods=["GET"])
    def dashboard():
        cases = Case.query.all()
        return jsonify([{"title": c.title, "url": c.url} for c in cases])
