"""
SmartDispute.ai Document Upload Handler
A Flask application that handles document uploads and AI analysis
"""
import os
import uuid
from flask import Flask, request, redirect, render_template, url_for, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure uploads directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Display the upload form"""
    return render_template('upload_form.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle the file upload"""
    # Check if the post request has the file part
    if 'document' not in request.files:
        return redirect(request.url)
    
    file = request.files['document']
    
    # If the user does not select a file, the browser submits an
    # empty file without a filename
    if file.filename == '':
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        # Secure the filename and generate a unique name to prevent overwriting
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save the file
        file.save(file_path)
        
        # For now, just acknowledge the upload
        return f'''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Upload Successful - SmartDispute.ai</title>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #000; color: #fff; text-align: center; padding: 50px; }}
                h1 {{ color: #ff0000; }}
                .container {{ background-color: #111; padding: 20px; border-radius: 10px; display: inline-block; }}
                a {{ color: #ff0000; text-decoration: none; }}
                .button {{ background-color: #ff0000; color: #fff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Upload Successful!</h1>
                <p>Your document <strong>{filename}</strong> has been uploaded successfully.</p>
                <p>File saved as: {unique_filename}</p>
                <p>In the next phase, this will be processed by our AI system for analysis.</p>
                <a href="/" class="button">Upload Another Document</a>
            </div>
        </body>
        </html>
        '''
    
    return redirect(request.url)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')