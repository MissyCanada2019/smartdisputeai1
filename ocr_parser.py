"""
OCR Parser for SmartDispute.ai
Handles image preprocessing and text extraction from document images
"""

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import cv2
import numpy as np
import re
import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ocr_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ocr_parser')

class DocumentProcessor:
    """Class to handle document image processing and OCR text extraction"""
    
    def __init__(self):
        """Initialize the document processor"""
        self.tesseract_config = '--oem 3 --psm 6'
        logger.info("Document processor initialized")
    
    def preprocess_image(self, image_path):
        """
        Preprocess image for better OCR results
        
        Args:
            image_path: Path to the image file
            
        Returns:
            PIL Image: Processed image
        """
        logger.info(f"Preprocessing image: {image_path}")
        
        try:
            # Read image
            if isinstance(image_path, str):
                # Path to image file
                img = cv2.imread(image_path)
            else:
                # Binary data
                nparr = np.frombuffer(image_path, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error(f"Failed to read image: {image_path}")
                return None
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding
            _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            
            # Remove noise
            denoised = cv2.fastNlMeansDenoising(binary, None, 10, 7, 21)
            
            # Convert back to PIL image for OCR
            pil_img = Image.fromarray(denoised)
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_img)
            enhanced_img = enhancer.enhance(2.0)
            
            # Apply sharpening
            enhanced_img = enhanced_img.filter(ImageFilter.SHARPEN)
            
            logger.info("Image preprocessing completed successfully")
            return enhanced_img
            
        except Exception as e:
            logger.error(f"Error during image preprocessing: {str(e)}")
            return None
    
    def extract_text(self, image):
        """
        Extract text from an image using Tesseract OCR
        
        Args:
            image: PIL Image object
            
        Returns:
            str: Extracted text
        """
        logger.info("Extracting text from image using OCR")
        
        try:
            text = pytesseract.image_to_string(image, config=self.tesseract_config)
            logger.info(f"Extracted {len(text)} characters from image")
            return text
        except Exception as e:
            logger.error(f"Error during text extraction: {str(e)}")
            return ""
    
    def detect_document_type(self, text):
        """
        Detect the type of legal document based on extracted text
        
        Args:
            text: Extracted text from document
            
        Returns:
            str: Document type
        """
        logger.info("Detecting document type")
        
        text_lower = text.lower()
        
        # Check for different document types
        if "notice to terminate" in text_lower or "eviction notice" in text_lower:
            return "Eviction Notice"
        elif "notice of rent increase" in text_lower:
            return "Rent Increase Notice"
        elif "lease agreement" in text_lower or "rental agreement" in text_lower:
            return "Lease Agreement"
        elif "child" in text_lower and "services" in text_lower and any(x in text_lower for x in ["investigation", "allegation", "petition"]):
            return "Child Services Document"
        elif "summons" in text_lower or "court date" in text_lower:
            return "Court Summons"
        elif "cease and desist" in text_lower:
            return "Cease and Desist Letter"
        elif "appeal" in text_lower and any(x in text_lower for x in ["decision", "order", "ruling"]):
            return "Appeal Document"
        elif "agreement" in text_lower:
            return "Legal Agreement"
        elif any(x in text_lower for x in ["notice", "notification"]):
            return "Legal Notice"
        else:
            return "Unknown Legal Document"
    
    def extract_dates(self, text):
        """
        Extract dates from document text
        
        Args:
            text: Extracted text from document
            
        Returns:
            list: List of dates found in document
        """
        logger.info("Extracting dates from text")
        
        # Date patterns
        date_patterns = [
            r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b',
            r'\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',
            r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
            r'\b\d{4}-\d{1,2}-\d{1,2}\b'
        ]
        
        dates = []
        for pattern in date_patterns:
            dates.extend(re.findall(pattern, text))
        
        logger.info(f"Found {len(dates)} dates in document")
        return dates
    
    def extract_names(self, text):
        """
        Extract potential names from document text
        
        Args:
            text: Extracted text from document
            
        Returns:
            dict: Dictionary with tenant and landlord names
        """
        logger.info("Extracting names from text")
        
        # Look for patterns that might indicate names
        landlord_patterns = [
            r'(?:landlord|lessor|owner)(?:[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
            r'(?:from|by)(?:[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        ]
        
        tenant_patterns = [
            r'(?:tenant|lessee|resident|occupant)(?:[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
            r'(?:to|dear)(?:[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})',
        ]
        
        landlord_name = "Not found"
        tenant_name = "Not found"
        
        # Try to find landlord name
        for pattern in landlord_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                landlord_name = matches[0].strip()
                break
        
        # Try to find tenant name
        for pattern in tenant_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                tenant_name = matches[0].strip()
                break
        
        logger.info(f"Extracted names - Tenant: {tenant_name}, Landlord: {landlord_name}")
        return {
            "tenant_name": tenant_name,
            "landlord_name": landlord_name
        }
    
    def check_for_issues(self, text, document_type):
        """
        Check document for potential issues
        
        Args:
            text: Extracted text from document
            document_type: Type of the document
            
        Returns:
            list: List of identified issues
        """
        logger.info(f"Checking for issues in {document_type}")
        
        issues = []
        
        # Common issues for all document types
        if not re.search(r'sign(ed|ature)', text.lower()):
            issues.append("Missing signature")
        
        # Check for dates
        dates = self.extract_dates(text)
        if not dates:
            issues.append("No date found on document")
        
        # Document-specific checks
        if document_type == "Eviction Notice":
            if not re.search(r'days notice', text.lower()):
                issues.append("Notice period not specified")
            
            if not re.search(r'reason', text.lower()) and not re.search(r'grounds', text.lower()):
                issues.append("Reason for eviction not clearly stated")
        
        elif document_type == "Lease Agreement":
            if not re.search(r'rent(?:al)?\s+(?:amount|payment|fee)', text.lower()):
                issues.append("Rent amount not specified")
            
            if not re.search(r'term', text.lower()) and not re.search(r'period', text.lower()):
                issues.append("Lease term not clearly specified")
        
        logger.info(f"Found {len(issues)} issues in document")
        return issues
    
    def process_document(self, image_path):
        """
        Process a document image and extract key information
        
        Args:
            image_path: Path to the image file
            
        Returns:
            dict: Extracted document information
        """
        logger.info(f"Processing document: {image_path}")
        
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            if processed_image is None:
                logger.error("Image preprocessing failed")
                return {"status": "error", "message": "Image preprocessing failed"}
            
            # Extract text using OCR
            text = self.extract_text(processed_image)
            if not text:
                logger.error("OCR text extraction failed")
                return {"status": "error", "message": "Text extraction failed"}
            
            # Detect document type
            document_type = self.detect_document_type(text)
            
            # Extract dates
            dates = self.extract_dates(text)
            date_str = dates[0] if dates else "Not found"
            
            # Extract names
            names = self.extract_names(text)
            
            # Check for issues
            issues = self.check_for_issues(text, document_type)
            
            # Create result dictionary
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
            
            logger.info("Document processing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error during document processing: {str(e)}")
            return {
                "status": "error", 
                "message": f"Document processing failed: {str(e)}"
            }

# For direct testing
if __name__ == "__main__":
    processor = DocumentProcessor()
    if len(os.sys.argv) > 1:
        # Process file provided as command line argument
        result = processor.process_document(os.sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Please provide an image path as command line argument")