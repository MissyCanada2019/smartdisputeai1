# ocr_parser.py

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import cv2
import numpy as np
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('ocr_parser')

def preprocess_image(image_stream):
    """
    Preprocess the image for better OCR results.
    Includes multiple processing methods in case one fails.
    """
    try:
        # Open image and make a copy of the stream
        image_bytes = image_stream.read()
        image_stream_copy = io.BytesIO(image_bytes)
        image_stream.seek(0)  # Reset the stream position
        
        # Method 1: Basic PIL processing
        try:
            image = Image.open(image_stream_copy).convert('L')  # Convert to grayscale
            image = image.filter(ImageFilter.MedianFilter())
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(2)
            
            np_img = np.array(image)
            _, thresh = cv2.threshold(np_img, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            return Image.fromarray(thresh)
        except Exception as e:
            logger.warning(f"Method 1 failed: {e}, trying Method 2")
            image_stream.seek(0)  # Reset stream position
            
        # Method 2: Advanced OpenCV processing
        try:
            # Convert to OpenCV format
            image_stream.seek(0)  # Reset stream position
            image_bytes = image_stream.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                          cv2.THRESH_BINARY, 11, 2)
            
            # Noise removal with morphological operations
            kernel = np.ones((1, 1), np.uint8)
            opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            
            # Deskew the image if needed
            # ... deskew code would go here if implemented...
            
            return Image.fromarray(opening)
        except Exception as e:
            logger.warning(f"Method 2 failed: {e}, falling back to basic method")
            image_stream.seek(0)  # Reset stream position
            
        # Final fallback: basic processing
        image = Image.open(image_stream).convert('L')
        return image
        
    except Exception as e:
        logger.error(f"All image preprocessing methods failed: {e}")
        # If all else fails, try to at least open the image
        try:
            image_stream.seek(0)
            return Image.open(image_stream)
        except:
            raise ValueError("Could not process the provided image")

def extract_text(image):
    """
    Extract text from the image using multiple configurations and languages.
    """
    try:
        # Try with the default settings
        text = pytesseract.image_to_string(image)
        
        # If text is too short, try with additional configuration
        if len(text.strip()) < 50:
            logger.info("Default OCR yielded limited results, trying with additional configurations")
            
            # Try with different PSM modes (page segmentation modes)
            # PSM 3 - Fully automatic page segmentation, but no OSD (default)
            # PSM 6 - Assume a single uniform block of text
            # PSM 4 - Assume a single column of text of variable sizes
            psm_modes = [3, 6, 4]
            
            # Try different languages
            languages = ['eng']  # Add 'fra' for French if needed
            
            # Try different configurations
            for psm in psm_modes:
                for lang in languages:
                    config = f'--psm {psm} -l {lang}'
                    new_text = pytesseract.image_to_string(image, config=config)
                    
                    # If this configuration gives more text, use it
                    if len(new_text.strip()) > len(text.strip()):
                        logger.info(f"Better results with config: {config}")
                        text = new_text
        
        return text
    except Exception as e:
        logger.error(f"Error during text extraction: {e}")
        return ""

def detect_document_type(text):
    """
    Detect the type of legal document based on text content
    """
    text_lower = text.lower()
    
    # Common document types in Canadian tenant/landlord context
    if re.search(r'\bn[4]\b', text.upper()) or "notice to end tenancy" in text_lower:
        return "Eviction Notice (N4)"
    if re.search(r'\bn[1-3]\b', text.upper()) or "notice of rent increase" in text_lower:
        return "Rent Increase Notice"
    if re.search(r'\bn[5]\b', text.upper()) or "notice to terminate" in text_lower:
        return "Termination Notice (N5)"
    if re.search(r'\bn[7-9]\b', text.upper()):
        return "Landlord and Tenant Board Notice"
    if re.search(r'\bl[1-3]\b', text.upper()) or "application" in text_lower:
        return "LTB Application"
    if "lease" in text_lower or "tenancy agreement" in text_lower:
        return "Lease Agreement"
    if "maintenance" in text_lower or "repair" in text_lower:
        return "Maintenance Request"
    if "complaint" in text_lower:
        return "Complaint Letter"
    if "cease and desist" in text_lower:
        return "Cease and Desist Letter"
    if "receipt" in text_lower:
        return "Payment Receipt"
    
    # Check for Children's Aid Society documents
    if "children's aid" in text_lower or "child protection" in text_lower or "cas" in text_lower:
        if "plan of care" in text_lower:
            return "CAS Plan of Care"
        if "appeal" in text_lower:
            return "CAS Appeal"
        if "records request" in text_lower:
            return "CAS Records Request"
        return "CAS Document"
    
    return None

def extract_names(text):
    """
    Extract names from the document text using multiple patterns
    """
    tenant_name = None
    landlord_name = None
    
    # Look for labeled names
    tenant_matches = re.findall(r'(?:tenant|resident|applicant|respondent)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})', text, re.IGNORECASE)
    if tenant_matches:
        tenant_name = tenant_matches[0].strip()
    
    landlord_matches = re.findall(r'(?:landlord|property owner|property manager|lessor)[:\s]+([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})', text, re.IGNORECASE)
    if landlord_matches:
        landlord_name = landlord_matches[0].strip()
    
    # If labeled names not found, try to find names by format
    if not tenant_name or not landlord_name:
        name_matches = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3}', text)
        if name_matches and not tenant_name:
            tenant_name = name_matches[0]
        if len(name_matches) > 1 and not landlord_name:
            landlord_name = name_matches[1]
    
    return tenant_name, landlord_name

def extract_dates(text):
    """
    Extract dates from the document text using multiple formats
    """
    # Look for full month name format (January 1, 2023)
    full_date_match = re.search(r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},?\s\d{4}\b', text)
    if full_date_match:
        return full_date_match.group(0)
    
    # Look for numeric formats (MM/DD/YYYY or DD/MM/YYYY)
    numeric_date_match = re.search(r'\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b', text)
    if numeric_date_match:
        return numeric_date_match.group(0)
    
    # Look for short month format (Jan 1, 2023)
    short_month_match = re.search(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s\d{1,2},?\s\d{4}\b', text)
    if short_month_match:
        return short_month_match.group(0)
    
    return None

def identify_issues(text, document_type):
    """
    Identify potential issues in the document
    """
    issues = []
    text_lower = text.lower()
    
    # Common issues in legal documents
    if "signature" not in text_lower and "signed" not in text_lower:
        issues.append("Signature missing")
    
    if "non-payment" in text_lower or "unpaid rent" in text_lower:
        issues.append("Non-payment of rent")
    
    if "damage" in text_lower or "property damage" in text_lower:
        issues.append("Damage to property")
    
    if "notice period" in text_lower and "insufficient" in text_lower:
        issues.append("Insufficient notice period")
    
    if document_type == "Eviction Notice (N4)":
        if "n4" not in text.lower() and "N4" not in text:
            issues.append("Missing N4 form reference")
        if "days" not in text_lower or "notice" not in text_lower:
            issues.append("Notice period not specified")
    
    if document_type == "Rent Increase Notice":
        if "90 days" not in text_lower and "ninety days" not in text_lower:
            issues.append("90-day notice requirement may not be met")
        if "%" not in text:
            issues.append("Percentage increase not specified")
    
    # Check for date specifics
    if not re.search(r'\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b', text) and not re.search(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s\d{1,2},?\s\d{4}\b', text):
        issues.append("Date not clearly specified")
    
    return issues

def parse_legal_fields(text):
    """
    Extract structured data from the OCR text, focusing on legal document fields
    """
    # Initialize fields
    fields = {
        "tenant_name": None,
        "landlord_name": None,
        "date": None,
        "document_type": None,
        "issues": [],
        "full_text": text.strip()
    }
    
    # Detect document type
    fields["document_type"] = detect_document_type(text)
    
    # Extract names
    tenant_name, landlord_name = extract_names(text)
    fields["tenant_name"] = tenant_name
    fields["landlord_name"] = landlord_name
    
    # Extract date
    fields["date"] = extract_dates(text)
    
    # Identify issues
    fields["issues"] = identify_issues(text, fields["document_type"])
    
    logger.info(f"Parsed fields: {fields}")
    return fields

def run_ocr_pipeline(image_stream):
    preprocessed_image = preprocess_image(image_stream)
    text = extract_text(preprocessed_image)
    parsed_fields = parse_legal_fields(text)
    return parsed_fields