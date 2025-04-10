"""
OCR Routes Module for SmartDispute.ai
Provides Flask routes for OCR functionality
"""
import os
import json
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import logging
from typing import Dict, List, Tuple, Any, Optional, Union
import base64

# Import the OCR parser
from ocr_parser import OCRParser

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

def get_document_fields(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract user-friendly fields from OCR analysis
    
    Args:
        analysis: The complete OCR analysis results
        
    Returns:
        dict: User-friendly fields extracted from the document
    """
    # Initialize fields with defaults
    fields = {
        "document_type": "Unknown",
        "full_text": analysis.get("raw_text", "")
    }
    
    # Document type mapping for user-friendly names
    document_type_mapping = {
        "eviction_notice": "Eviction Notice",
        "cas_document": "Child Services Document",
        "court_document": "Court Document",
        "lease_agreement": "Lease Agreement",
        "credit_document": "Credit Report",
        "invoice": "Invoice or Bill"
    }
    
    # Get document type
    doc_type = analysis.get("document_type", "unknown")
    
    # Check for specific document subtypes
    raw_text = analysis.get("raw_text", "").lower()
    if doc_type == "eviction_notice":
        if "n4" in raw_text:
            fields["document_type"] = "Eviction Notice (N4)"
        elif "n5" in raw_text:
            fields["document_type"] = "Eviction Notice (N5)"
        elif "n12" in raw_text:
            fields["document_type"] = "Eviction Notice (N12)"
        else:
            fields["document_type"] = document_type_mapping.get(doc_type, "Unknown Document")
    else:
        fields["document_type"] = document_type_mapping.get(doc_type, "Unknown Document")
    
    # Extract key information
    key_info = analysis.get("key_information", {})
    
    # Add any parties (tenants, landlords, etc.)
    if "parties" in key_info:
        for party in key_info["parties"]:
            if party["type"] == "applicant":
                fields["landlord_name"] = party["name"]
            elif party["type"] == "respondent":
                fields["tenant_name"] = party["name"]
    
    # Add property address if available
    if "property_address" in key_info:
        fields["address"] = key_info["property_address"]
    
    # Add dates if available
    if "dates" in key_info and key_info["dates"]:
        # Use the first date found
        fields["date"] = key_info["dates"][0]
    
    # Add termination reason if available
    if "termination_reason" in key_info:
        fields["reason"] = key_info["termination_reason"]
    
    # Add court file number if available
    if "file_number" in key_info:
        fields["file_number"] = key_info["file_number"]
    
    # Add case number if available
    if "case_number" in key_info:
        fields["case_number"] = key_info["case_number"]
    
    # Identify potential issues
    issues = []
    
    # Check if signature might be missing
    if not analysis.get("layout", {}).get("potential_signatures"):
        issues.append("Signature potentially missing")
    
    # Check if the document seems incomplete
    if len(analysis.get("raw_text", "").strip()) < 100:
        issues.append("Document may be incomplete or unclear")
    
    # Check for missing critical information based on document type
    if doc_type == "eviction_notice":
        if "address" not in fields:
            issues.append("Property address not found")
        if "date" not in fields:
            issues.append("Notice date not found")
        if "tenant_name" not in fields and "landlord_name" not in fields:
            issues.append("Party names not clearly identified")
    
    # Add issues to fields if any were found
    if issues:
        fields["issues"] = issues
    
    return fields

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
        
        # Initialize OCR parser
        ocr = OCRParser()
        
        # Read file data
        file_data = file.read()
        
        # Perform OCR analysis
        analysis = ocr.analyze_image(file_data)
        
        if not analysis.get('success', False):
            return jsonify({
                'status': 'error',
                'message': 'OCR processing failed',
                'error': analysis.get('error', 'Unknown error')
            }), 500
        
        # Extract user-friendly fields from analysis
        fields = get_document_fields(analysis)
        
        # Get raw text
        full_text = analysis.get('raw_text', '')
        
        # Get document type
        document_type = analysis.get('document_type', 'unknown')
        
        # Create simplified response for the user interface
        response = {
            'status': 'success',
            'fields': fields,
            'raw_analysis': {
                'document_type': document_type,
                'layout': analysis.get('layout', {}),
                'form_fields': analysis.get('form_fields', {})
            },
            'meta': {
                'ocr_engine': analysis.get('meta', {}).get('ocr_engine', 'tesseract'),
                'version': analysis.get('meta', {}).get('version', '')
            }
        }
        
        logger.info(f"Successfully processed OCR for file: {file.filename}")
        return jsonify(response)
    
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
        # Initialize OCR parser to check if Tesseract is available
        ocr = OCRParser()
        
        return jsonify({
            'status': 'success',
            'message': 'OCR service is operational',
            'tesseract_version': str(ocr.lang)
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
            'address': '123 Sample St, Unit 4, Toronto, ON',
            'date': 'March 15, 2025',
            'reason': 'Non-payment of rent',
            'issues': ['Signature potentially missing'],
            'full_text': 'This is a Notice to End your Tenancy for Non-payment of Rent...'
        },
        'raw_analysis': {
            'document_type': 'eviction_notice',
            'layout': {
                'sections': [
                    {
                        'id': 'section_1',
                        'type': 'header',
                        'content': 'NOTICE TO END YOUR TENANCY FOR NON-PAYMENT OF RENT (N4)'
                    }
                ]
            }
        },
        'meta': {
            'ocr_engine': 'tesseract',
            'version': '5.3.0'
        }
    }
    
    return jsonify(sample_response)