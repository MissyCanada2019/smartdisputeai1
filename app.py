# Step 1: AI Analysis Result (Simulated)
from flask import Flask, request, send_file, jsonify
from docxtpl import DocxTemplate
from datetime import datetime
from zipfile import ZipFile
import os

app = Flask(__name__)

@app.route("/generate-legal-package", methods=["POST"])
def generate_legal_package():
    data = request.get_json()  # You can later switch this to read from form or session

    # Simulated AI output (replace this with real analysis)
    analysis_results = {
        "issue_type": "landlord_tenant",
        "recommended_forms": ["n4_notice_non_payment", "repair_notice"],
        "province": data.get("province", "ON"),
        "facts": data.get("facts", "Tenant has unpaid rent and unit damage complaints.")
    }

    user_info = {
        "name": data.get("name", "John Doe"),
        "address": data.get("address", "123 Example St, Toronto, ON"),
        "user_id": data.get("user_id", "test_user"),
        "evidence_file": data.get("evidence_filename", "sample.pdf")
    }

    output_folder = "generated_forms"
    os.makedirs(output_folder, exist_ok=True)

    doc_paths = []
    for form in analysis_results["recommended_forms"]:
        template_path = f"templates/forms/landlord/{form}.docx"
        output_path = os.path.join(output_folder, f"{user_info['user_id']}_{form}.docx")

        doc = DocxTemplate(template_path)
        doc.render({
            "date": datetime.now().strftime("%B %d, %Y"),
            "tenant_name": user_info["name"],
            "landlord_name": "Landlord",  # You can auto-fill this from analysis or user profile
            "address": user_info["address"],
            "issue": analysis_results["facts"]
        })
        doc.save(output_path)
        doc_paths.append(output_path)

    # Bundle ZIP
    zip_path = os.path.join(output_folder, f"{user_info['user_id']}_legal_package.zip")
    with ZipFile(zip_path, 'w') as zipf:
        for path in doc_paths:
            zipf.write(path, os.path.basename(path))
        evidence_path = f"uploads/{user_info['evidence_file']}"
        if os.path.exists(evidence_path):
            zipf.write(evidence_path, os.path.basename(evidence_path))

    return send_file(zip_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
