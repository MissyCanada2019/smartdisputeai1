"""
OCR Document Processor for SmartDispute.ai
Takes images and PDFs and extracts structured information with preprocessing for best results
"""

import os
import re
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import cv2
import numpy as np
import logging
import json
import datetime
from typing import Dict, List, Union, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ocr_parser.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('ocr_parser')

class DocumentProcessor:
    """
    Document processor class that handles OCR with preprocessing
    and field extraction for legal documents
    """
    
    def __init__(self):
        """Initialize the document processor with default values"""
        # Document type patterns - these are regex patterns used to identify document types
        self.document_patterns = {
            "EVICTION_NOTICE": r"(?i)(notice\s+to\s+end\s+tenancy|eviction\s+notice|notice\s+to\s+vacate|notice\s+of\s+termination)",
            "RENTAL_AGREEMENT": r"(?i)(rental\s+agreement|lease\s+agreement|tenancy\s+agreement|residential\s+agreement)",
            "LANDLORD_COMPLAINT": r"(?i)(complaint\s+against\s+landlord|landlord\s+dispute|maintenance\s+request|repair\s+request)",
            "RENT_INCREASE": r"(?i)(rent\s+increase\s+notice|notice\s+of\s+rent\s+increase|rent\s+adjustment)",
            "CHILD_SERVICES_NOTICE": r"(?i)(children(')?s\s+aid\s+society|child\s+protection|family\s+services|child\s+welfare|temporary\s+care\s+agreement|supervision\s+order)",
            "CREDIT_DISPUTE": r"(?i)(credit\s+report|credit\s+bureau|equifax|transunion|experian|credit\s+dispute)",
            "COURT_SUMMONS": r"(?i)(summons|notice\s+of\s+hearing|court\s+appearance|notice\s+of\s+application)",
            "DEMAND_LETTER": r"(?i)(demand\s+letter|demand\s+for\s+payment|legal\s+demand|formal\s+demand)"
        }
        
        # Issue patterns - these help identify common issues in documents
        self.issue_patterns = {
            "MISSING_DATE": r"(?i)(dated?|on\s+the\s+\d+(?:st|nd|rd|th)?\s+day\s+of)",
            "MISSING_SIGNATURE": r"(?i)(signed|signature|sign\s+here|sign\s+below)",
            "MISSING_ADDRESS": r"(?i)(address|premises|property|located\s+at|municipal\s+address)",
            "INVALID_NOTICE_PERIOD": r"(?i)(\d+\s+days\s+notice|\d+\s+day\s+notice|notice\s+period|\d+\s+days\s+from\s+the\s+date)",
        }
        
        # Date patterns for extraction
        self.date_patterns = [
            r"(?i)(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}",
            r"(?i)\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december),?\s+\d{4}",
            r"\d{1,2}/\d{1,2}/\d{4}",
            r"\d{4}-\d{1,2}-\d{1,2}",
            r"\d{1,2}-\d{1,2}-\d{4}",
        ]
        
        # Tenant and landlord patterns
        self.tenant_patterns = [
            r"(?i)tenant\s*:\s*([A-Za-z\s.'-]+)",
            r"(?i)tenant(?:\s+name)?(?:\s*:|\s+is)\s*([A-Za-z\s.'-]+)",
            r"(?i)tenant(?:'s)?\s+name\s*(?::|\s+is)\s*([A-Za-z\s.'-]+)",
            r"(?i)lessee\s*:\s*([A-Za-z\s.'-]+)",
            r"(?i)(?:is|am)\s+(?:leasing|renting)(?:\s+to)?\s+([A-Za-z\s.'-]+)",
            r"(?i)resident\s*:\s*([A-Za-z\s.'-]+)",
        ]
        
        self.landlord_patterns = [
            r"(?i)landlord\s*:\s*([A-Za-z\s.'-]+)",
            r"(?i)landlord(?:\s+name)?(?:\s*:|\s+is)\s*([A-Za-z\s.'-]+)",
            r"(?i)landlord(?:'s)?\s+name\s*(?::|\s+is)\s*([A-Za-z\s.'-]+)",
            r"(?i)lessor\s*:\s*([A-Za-z\s.'-]+)",
            r"(?i)property\s+(?:owner|manager)\s*:?\s*([A-Za-z\s.'-]+)",
            r"(?i)(?:owned|managed)\s+by\s+([A-Za-z\s.'-]+)",
        ]
        
    def preprocess_image(self, image_path: str) -> Image.Image:
        """
        Preprocess an image for better OCR results
        
        Args:
            image_path: Path to the image file
            
        Returns:
            A PIL Image object, preprocessed for OCR
        """
        try:
            logger.info(f"Preprocessing image: {image_path}")
            
            # Open the image
            img = Image.open(image_path)
            
            # Convert to OpenCV format for advanced preprocessing
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Apply dilation to strengthen text
            kernel = np.ones((1, 1), np.uint8)
            dilated = cv2.dilate(thresh, kernel, iterations=1)
            
            # Convert back to PIL format
            img_pil = Image.fromarray(dilated)
            
            # Increase contrast
            enhancer = ImageEnhance.Contrast(img_pil)
            img_contrast = enhancer.enhance(2.0)
            
            # Increase sharpness
            enhancer = ImageEnhance.Sharpness(img_contrast)
            img_sharp = enhancer.enhance(2.0)
            
            logger.info("Image preprocessing complete")
            return img_sharp
            
        except Exception as e:
            logger.error(f"Error during image preprocessing: {str(e)}")
            # If preprocessing fails, return original image
            return Image.open(image_path)
    
    def extract_text(self, image: Image.Image) -> str:
        """
        Extract text from an image using OCR
        
        Args:
            image: A PIL Image object
            
        Returns:
            String containing the extracted text
        """
        try:
            logger.info("Extracting text using OCR")
            
            # Use pytesseract for OCR
            text = pytesseract.image_to_string(image)
            
            # Clean up the text
            text = text.replace('\n\n', '\n').strip()
            
            logger.info(f"Extracted {len(text)} characters of text")
            return text
            
        except Exception as e:
            logger.error(f"Error during text extraction: {str(e)}")
            return ""
    
    def detect_document_type(self, text: str) -> str:
        """
        Determine the type of document based on its content
        
        Args:
            text: Text extracted from the document
            
        Returns:
            String representing the document type
        """
        logger.info("Detecting document type")
        
        # Check for matches with document patterns
        for doc_type, pattern in self.document_patterns.items():
            if re.search(pattern, text):
                logger.info(f"Document type detected: {doc_type}")
                return doc_type
        
        # If no match is found, return UNKNOWN
        logger.info("Document type is UNKNOWN")
        return "UNKNOWN"
    
    def extract_dates(self, text: str) -> List[str]:
        """
        Extract dates from the document text
        
        Args:
            text: Text extracted from the document
            
        Returns:
            List of date strings found in the document
        """
        logger.info("Extracting dates from document")
        
        dates = []
        
        # Check for matches with date patterns
        for pattern in self.date_patterns:
            matches = re.findall(pattern, text)
            dates.extend(matches)
        
        # Remove duplicates and return
        unique_dates = list(set(dates))
        logger.info(f"Found {len(unique_dates)} dates in document")
        return unique_dates
    
    def extract_names(self, text: str) -> Dict[str, str]:
        """
        Extract tenant and landlord names from the document
        
        Args:
            text: Text extracted from the document
            
        Returns:
            Dictionary with tenant_name and landlord_name keys
        """
        logger.info("Extracting names from document")
        
        tenant_name = "Not found"
        landlord_name = "Not found"
        
        # Look for tenant name
        for pattern in self.tenant_patterns:
            match = re.search(pattern, text)
            if match and match.group(1).strip():
                tenant_name = match.group(1).strip()
                logger.info(f"Found tenant name: {tenant_name}")
                break
        
        # Look for landlord name
        for pattern in self.landlord_patterns:
            match = re.search(pattern, text)
            if match and match.group(1).strip():
                landlord_name = match.group(1).strip()
                logger.info(f"Found landlord name: {landlord_name}")
                break
        
        return {
            "tenant_name": tenant_name,
            "landlord_name": landlord_name
        }
    
    def check_for_issues(self, text: str, document_type: str) -> List[Dict[str, str]]:
        """
        Check for common issues in the document
        
        Args:
            text: Text extracted from the document
            document_type: Type of document being analyzed
            
        Returns:
            List of dictionaries containing issue type and description
        """
        logger.info(f"Checking for issues in {document_type} document")
        
        issues = []
        
        # Check for missing date
        if not re.search(self.issue_patterns["MISSING_DATE"], text):
            issues.append({
                "issue_type": "MISSING_DATE",
                "description": "The document appears to be missing a date, which may affect its validity."
            })
        
        # Check for missing signature
        if not re.search(self.issue_patterns["MISSING_SIGNATURE"], text):
            issues.append({
                "issue_type": "MISSING_SIGNATURE",
                "description": "The document appears to be missing a signature, which may affect its validity."
            })
        
        # Check for missing address
        if not re.search(self.issue_patterns["MISSING_ADDRESS"], text):
            issues.append({
                "issue_type": "MISSING_ADDRESS",
                "description": "The document appears to be missing an address, which may affect its specificity and enforceability."
            })
        
        # For eviction notices, check for notice period
        if document_type == "EVICTION_NOTICE" and not re.search(self.issue_patterns["INVALID_NOTICE_PERIOD"], text):
            issues.append({
                "issue_type": "INVALID_NOTICE_PERIOD",
                "description": "The eviction notice may not specify the required notice period, which is typically required by law."
            })
        
        logger.info(f"Found {len(issues)} issues in document")
        return issues
    
    def process_document(self, filepath: str) -> Dict[str, Any]:
        """
        Process a document through the entire pipeline:
        1. Preprocess the image
        2. Extract text using OCR
        3. Detect document type
        4. Extract dates
        5. Extract names
        6. Check for issues
        
        Args:
            filepath: Path to the document file
            
        Returns:
            Dictionary containing the structured extraction results
        """
        logger.info(f"Processing document: {filepath}")
        
        try:
            # Step 1: Preprocess the image
            preprocessed_image = self.preprocess_image(filepath)
            
            # Step 2: Extract text using OCR
            text = self.extract_text(preprocessed_image)
            
            if not text:
                logger.warning("No text extracted from document")
                return {
                    "status": "error",
                    "message": "No text could be extracted from the document."
                }
            
            # Step 3: Detect document type
            document_type = self.detect_document_type(text)
            
            # Step 4: Extract dates
            dates = self.extract_dates(text)
            date_str = dates[0] if dates else "Not found"
            
            # Step 5: Extract names
            names = self.extract_names(text)
            
            # Step 6: Check for issues
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
            
            logger.info("Document processing complete")
            return result
            
        except Exception as e:
            logger.error(f"Error during document processing: {str(e)}")
            return {
                "status": "error",
                "message": f"An error occurred during document processing: {str(e)}"
            }

# Direct execution example
if __name__ == "__main__":
    if len(os.sys.argv) > 1:
        filepath = os.sys.argv[1]
        processor = DocumentProcessor()
        result = processor.process_document(filepath)
        print(json.dumps(result, indent=2))
    else:
        print("Please provide a file path to process")