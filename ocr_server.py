"""
OCR Server for SmartDispute.ai
Simple Flask server to provide OCR API for document analysis
"""

import os
import json
import flask
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import logging
import traceback
from ocr_parser import DocumentProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ocr_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ocr_server')

# Create Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure the uploads directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tif', 'tiff', 'pdf'}

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'ocr_server'})

@app.route('/ocr-upload', methods=['POST'])
def ocr_upload():
    """
    OCR document upload endpoint
    Expects a file in the request with name 'file'
    Returns JSON with extracted document information
    """
    logger.info("Received OCR upload request")
    
    # Check if a file was included in the request
    if 'file' not in request.files:
        logger.warning("No file in request")
        return jsonify({'status': 'error', 'message': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if the file has a name
    if file.filename == '':
        logger.warning("Empty filename")
        return jsonify({'status': 'error', 'message': 'No file selected'}), 400
    
    # Check if the file has an allowed extension
    if not allowed_file(file.filename):
        logger.warning(f"Invalid file type: {file.filename}")
        return jsonify({
            'status': 'error', 
            'message': 'Invalid file type. Please upload a PNG, JPG, PDF, or TIFF file.'
        }), 400
    
    try:
        # Save the file to disk
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"File saved to {filepath}")
        
        # Process the document with the OCR parser
        processor = DocumentProcessor()
        result = processor.process_document(filepath)
        
        # Return the results
        logger.info("OCR processing complete, returning results")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error during OCR processing: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'Document processing failed: {str(e)}'
        }), 500

@app.route('/ocr-process-text', methods=['POST'])
def ocr_process_text():
    """
    Process text endpoint
    Expects JSON with 'text' field
    Returns analysis of the text without OCR
    """
    logger.info("Received text processing request")
    
    # Get JSON data from request
    data = request.json
    
    # Check if text was provided
    if not data or 'text' not in data:
        logger.warning("No text in request")
        return jsonify({'status': 'error', 'message': 'No text provided'}), 400
    
    text = data['text']
    if not text:
        logger.warning("Empty text field")
        return jsonify({'status': 'error', 'message': 'Text field is empty'}), 400
    
    try:
        # Process the text
        processor = DocumentProcessor()
        
        # Detect document type
        document_type = processor.detect_document_type(text)
        
        # Extract dates
        dates = processor.extract_dates(text)
        date_str = dates[0] if dates else "Not found"
        
        # Extract names
        names = processor.extract_names(text)
        
        # Check for issues
        issues = processor.check_for_issues(text, document_type)
        
        # Create result
        result = {
            "status": "success",
            "fields": {
                "document_type": document_type,
                "date": date_str,
                "tenant_name": names["tenant_name"],
                "landlord_name": names["landlord_name"],
                "issues": issues,
                "full_text": text
            }
        }
        
        logger.info("Text processing complete, returning results")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error during text processing: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'Text processing failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.environ.get('PORT', 3001))
    logger.info(f"Starting OCR server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)