from flask import Flask, request, render_template, send_from_directory, redirect, url_for
from docxtpl import DocxTemplate
from docx import Document
import os
import uuid
import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'generated'
TEMPLATE_FOLDER = 'templates/docs'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if not os.path.exists(TEMPLATE_FOLDER):
    os.makedirs(TEMPLATE_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/form')
def dynamic_form():
    province = request.args.get('province')
    dispute_type = request.args.get('type')
    return render_template('form.html', province=province, dispute_type=dispute_type)

@app.route('/generate', methods=['POST'])
def generate():
    name = request.form['name']
    email = request.form['email']
    description = request.form['description']
    province = request.form['province']
    dispute_type = request.form['dispute_type']
    
    # Get optional form fields with defaults
    recipient_name = request.form.get('recipient_name', 'To Whom It May Concern')
    recipient_address = request.form.get('recipient_address', '')
    user_address = request.form.get('address', '')

    filename = f"{dispute_type}_{province}.docx"
    template_path = os.path.join(TEMPLATE_FOLDER, filename)

    # Create a basic template if it doesn't exist yet
    if not os.path.exists(template_path):
        create_basic_template(template_path)

    doc = DocxTemplate(template_path)
    context = {
        'name': name,
        'email': email,
        'description': description,
        'province': province,
        'recipient_name': recipient_name,
        'recipient_address': recipient_address,
        'address': user_address,
        'now': lambda: datetime.datetime.now().strftime("%B %d, %Y")
    }

    doc.render(context)
    output_filename = f"{uuid.uuid4()}.docx"
    output_path = os.path.join(UPLOAD_FOLDER, output_filename)
    doc.save(output_path)

    return redirect(url_for('success', filename=output_filename))

def create_basic_template(path):
    """Create a basic template if none exists"""
    doc = Document()
    doc.add_heading('SmartDispute.ai Generated Document', 0)
    doc.add_paragraph('Name: {{ name }}')
    doc.add_paragraph('Email: {{ email }}')
    doc.add_paragraph('Date: {{ now() }}')
    doc.add_heading('Issue Description', level=1)
    doc.add_paragraph('{{ description }}')
    
    # Add province-specific section
    doc.add_heading('Province Information', level=1)
    doc.add_paragraph('Province: {{ province }}')
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    doc.save(path)
    print(f"Created basic template at {path}")

@app.route('/success')
def success():
    filename = request.args.get('filename')
    return render_template('success.html', filename=filename)

@app.route('/generated/<filename>')
def download_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)