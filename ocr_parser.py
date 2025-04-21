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
from typing import Dict, List, Any

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
    def __init__(self):
        # Document type patterns
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

        self.issue_patterns = {
            "MISSING_DATE": r"(?i)(dated?|on\s+the\s+\d+(?:st|nd|rd|th)?\s+day\s+of)",
            "MISSING_SIGNATURE": r"(?i)(signed|signature|sign\s+here|sign\s+below)",
            "MISSING_ADDRESS": r"(?i)(address|premises|property|located\s+at|municipal\s+address)",
            "INVALID_NOTICE_PERIOD": r"(?i)(\d+\s+days\s+notice|\d+\s+day\s+notice|notice\s+period|\d+\s+days\s+from\s+the\s+date)"
        }

        self.date_patterns = [
            r"(?i)(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}",
            r"(?i)\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december),?\s+\d{4}",
            r"\d{1,2}/\d{1,2}/\d{4}",
            r"\d{4}-\d{1,2}-\d{1,2}",
            r"\d{1,2}-\d{1,2}-\d{4}",
        ]

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
        try:
            logger.info(f"Preprocessing image: {image_path}")
            img = Image.open(image_path)
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            dilated = cv2.dilate(thresh, np.ones((1, 1), np.uint8), iterations=1)
            img_pil = Image.fromarray(dilated)
            enhancer = ImageEnhance.Contrast(img_pil)
            img_contrast = enhancer.enhance(2.0)
            img_sharp = ImageEnhance.Sharpness(img_contrast).enhance(2.0)
            return img_sharp
        except Exception as e:
            logger.error(f"Error during image preprocessing: {str(e)}")
            return Image.open(image_path)

    def extract_text(self, image: Image.Image) -> str:
        try:
            logger.info("Extracting text using OCR")
            text = pytesseract.image_to_string(image)
            return text.replace('\n\n', '\n').strip()
        except Exception as e:
            logger.error(f"Text extraction error: {str(e)}")
            return ""

    def detect_document_type(self, text: str) -> str:
        for doc_type, pattern in self.document_patterns.items():
            if re.search(pattern, text):
                return doc_type
        return "UNKNOWN"

    def extract_dates(self, text: str) -> List[str]:
        dates = []
        for pattern in self.date_patterns:
            dates += re.findall(pattern, text)
        return list(set(dates))

    def extract_names(self, text: str) -> Dict[str, str]:
        tenant_name, landlord_name = "Not found", "Not found"
        for pattern in self.tenant_patterns:
            match = re.search(pattern, text)
            if match:
                tenant_name = match.group(1).strip()
                break
        for pattern in self.landlord_patterns:
            match = re.search(pattern, text)
            if match:
                landlord_name = match.group(1).strip()
                break
        return {"tenant_name": tenant_name, "landlord_name": landlord_name}

    def check_for_issues(self, text: str, doc_type: str) -> List[Dict[str, str]]:
        issues = []
        for key, pattern in self.issue_patterns.items():
            if key == "INVALID_NOTICE_PERIOD" and doc_type != "EVICTION_NOTICE":
                continue
            if not re.search(pattern, text):
                issues.append({
                    "issue_type": key,
                    "description": f"Potential issue detected: {key.replace('_', ' ').title()} missing or invalid."
                })
        return issues

    def process_document(self, filepath: str) -> Dict[str, Any]:
        try:
            image = self.preprocess_image(filepath)
            text = self.extract_text(image)
            if not text:
                return {"status": "error", "message": "No text could be extracted."}
            return {
                "status": "success",
                "fields": {
                    "document_type": self.detect_document_type(text),
                    "date": self.extract_dates(text)[0] if self.extract_dates(text) else "Not found",
                    **self.extract_names(text),
                    "issues": self.check_for_issues(text, self.detect_document_type(text)),
                    "full_text": text
                }
            }
        except Exception as e:
            return {"status": "error", "message": f"Processing error: {str(e)}"}


# Standalone function for importing in routes or scripts
def run_ocr_pipeline(filepath: str) -> dict:
    return DocumentProcessor().process_document(filepath)


# CLI entry point for manual testing
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = run_ocr_pipeline(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Please provide a file path to process")
