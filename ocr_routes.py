"""
OCR Routes Module for SmartDispute.ai
Provides Flask routes for OCR functionality
"""
import os
import json
from flask import Blueprint, request, jsonify, current_app, render_template
from werkzeug.utils import secure_filename
import logging
from typing import Dict, List, Tuple, Any, Optional, Union
import base64
import io

# Import the OCR parser
from ocr_parser import run_ocr_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create blueprint
ocr_routes = Blueprint('ocr_routes', __name__)

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'tif', 'tiff'}

def allowed_file(filename: str) -> bool:
    """
    Check if the file has an allowed extension
    
    Args:
        filename: The name of the file to check
        
    Returns:
        bool: True if file has an allowed extension
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@ocr_routes.route('/ocr', methods=['GET'])
def ocr_page():
    """Display the OCR upload page"""
    return render_template('ocr_upload_form.html')

@ocr_routes.route('/ocr-upload', methods=['POST'])
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

@ocr_routes.route('/ocr-status', methods=['GET'])
def ocr_status():
    """
    Check the status of OCR service
    
    Returns:
        JSON response with OCR service status
    """
    try:
        # Test if we can import pytesseract
        import pytesseract
        version = pytesseract.get_tesseract_version()
        
        return jsonify({
            'status': 'success',
            'message': 'OCR service is operational',
            'tesseract_version': str(version)
        })
    except Exception as e:
        logger.error(f"OCR service status check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'OCR service error: {str(e)}'
        }), 500

@ocr_routes.route('/ocr-sample', methods=['GET'])
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