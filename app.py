from flask import send_file
from docxtpl import DocxTemplate
from zipfile import ZipFile

@app.route("/generate", methods=["POST"])
def generate_document():
    # Replace with actual analysis result
    analysis_results = {
        "case_type": "landlord_tenant",
        "recommended_form": "repair_notice",
        "province": "ON",
        "key_facts": "Tenant has reported ongoing water damage and no repairs have been made despite multiple requests."
    }
    user_info = {
        "name": "John Doe",
        "address": "123 Example Street, Toronto, ON",
        "user_id": "user123",
        "filename": "evidence.pdf"  # This file should exist in uploads/
    }

    template_path = f"templates/forms/landlord/{analysis_results['recommended_form']}.docx"
    generated_path = f"generated_forms/{user_info['user_id']}_form.docx"
    evidence_path = f"uploads/{user_info['filename']}"
    zip_path = f"generated_forms/{user_info['user_id']}_bundle.zip"

    doc = DocxTemplate(template_path)
    doc.render({
        "full_name": user_info["name"],
        "address": user_info["address"],
        "province": analysis_results["province"],
        "facts": analysis_results["key_facts"]
    })
    doc.save(generated_path)

    # Zip it with evidence
    with ZipFile(zip_path, "w") as zipf:
        zipf.write(generated_path, os.path.basename(generated_path))
        zipf.write(evidence_path, os.path.basename(evidence_path))

    return send_file(zip_path, as_attachment=True)
    from docxtpl import DocxTemplate
from flask import send_file

@app.route("/generate", methods=["POST"])
def generate():
    # Get form data
    tenant_name = request.form.get("tenant_name")
    landlord_name = request.form.get("landlord_name")
    address = request.form.get("address")
    issue = request.form.get("issue")
    date = request.form.get("date")

    # Template path
    template_path = "templates/disputes/ON/landlord_tenant/template.docx"
    
    # Load and render the docx template
    doc = DocxTemplate(template_path)
    context = {
        "tenant_name": tenant_name,
        "landlord_name": landlord_name,
        "address": address,
        "issue": issue,
        "date": date
    }
    doc.render(context)

    # Save generated file
    output_path = "generated_letter.docx"
    doc.save(output_path)

    return send_file(output_path, as_attachment=True)
