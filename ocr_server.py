#!/usr/bin/env python3
"""
OCR Server for SmartDispute.ai
This script starts a Flask server dedicated to OCR functionality
"""
import os
import logging
from flask import Flask, request, render_template, jsonify, send_file
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import io

# Import OCR functionality
from ocr_parser import run_ocr_pipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('ocr_server.log')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'tif', 'tiff'}

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Simple status page"""
    return """
    <html>
    <head>
        <title>OCR Server - SmartDispute.ai</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .status { background-color: #eeffee; padding: 10px; border-radius: 5px; }
            h1 { color: #0066cc; }
        </style>
    </head>
    <body>
        <h1>SmartDispute.ai OCR Server</h1>
        <div class="status">
            <p>✅ OCR Server is running</p>
            <p>Available endpoints:</p>
            <ul>
                <li><a href="/ocr">/ocr</a> - OCR upload form</li>
                <li>/ocr-upload - OCR API endpoint (POST)</li>
                <li><a href="/ocr-status">/ocr-status</a> - Server status</li>
            </ul>
        </div>
    </body>
    </html>
    """

@app.route('/ocr')
def ocr_page():
    """Display the OCR upload page"""
    try:
        return render_template('ocr_upload_form.html')
    except Exception as e:
        logger.error(f"Error rendering OCR page: {e}")
        return f"Error loading OCR page: {str(e)}", 500

@app.route('/ocr-upload', methods=['POST'])
def ocr_upload():
    """
    Handle OCR document uploads
    
    Returns:
        JSON response with OCR results
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file part in the request'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
            
        if not allowed_file(file.filename):
            return jsonify({
                'status': 'error',
                'message': f'File type not allowed. Supported types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Process the file through our OCR pipeline
        try:
            # Create a file-like object from the uploaded file
            file_stream = io.BytesIO(file.read())
            file.seek(0)  # Reset file pointer for potential reuse
            
            # Run OCR pipeline on the image
            parsed_fields = run_ocr_pipeline(file_stream)
            
            # Create response
            response = {
                'status': 'success',
                'fields': parsed_fields,
                'meta': {
                    'filename': secure_filename(file.filename),
                    'ocr_engine': 'tesseract'
                }
            }
            
            logger.info(f"Successfully processed OCR for file: {file.filename}")
            return jsonify(response)
        except Exception as e:
            logger.error(f"OCR processing error: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'OCR processing failed',
                'error': str(e)
            }), 500
    
    except Exception as e:
        logger.error(f"Error in OCR upload: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error processing document: {str(e)}'
        }), 500

@app.route('/ocr-status', methods=['GET'])
def ocr_status():
    """
    Check the status of OCR service
    
    Returns:
        JSON response with OCR service status
    """
    try:
        # Test if we can import pytesseract
        import pytesseract
        try:
            version = pytesseract.get_tesseract_version()
            status = "operational"
        except Exception as e:
            version = "unavailable"
            status = f"configured but not accessible: {str(e)}"
        
        return jsonify({
            'status': 'success',
            'message': 'OCR service is running',
            'tesseract_status': status,
            'tesseract_version': str(version)
        })
    except Exception as e:
        logger.error(f"OCR service status check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'OCR service error: {str(e)}'
        }), 500

@app.route('/ocr-sample', methods=['GET'])
def ocr_sample():
    """
    Return a sample OCR response for testing the UI
    
    Returns:
        JSON response with sample OCR results
    """
    sample_response = {
        'status': 'success',
        'fields': {
            'document_type': 'Eviction Notice (N4)',
            'landlord_name': 'Sample Property Management',
            'tenant_name': 'Jane Smith',
            'date': 'March 15, 2025',
            'issues': ['Signature potentially missing', 'Notice period not specified'],
            'full_text': 'This is a Notice to End your Tenancy for Non-payment of Rent...'
        },
        'meta': {
            'filename': 'sample_n4.jpg',
            'ocr_engine': 'tesseract'
        }
    }
    
    return jsonify(sample_response)

if __name__ == '__main__':
    PORT = 3001  # Use a different port than the main app
    logger.info(f"Starting OCR server on port {PORT}...")
    
    try:
        app.run(host='0.0.0.0', port=PORT, debug=False)
    except Exception as e:
        logger.error(f"Failed to start OCR server: {e}")