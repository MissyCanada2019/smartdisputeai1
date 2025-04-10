"""
Enhanced AI Handler Module for SmartDispute.ai
Integrates with Anthropic Claude models for document analysis and response generation
"""
import json
import os
import random
import base64
import traceback
from dotenv import load_dotenv
import time

# Import the Anthropic analyzer module
try:
    from anthropic_analyzer import (
        analyze_text_with_claude, 
        analyze_image_with_claude, 
        generate_response_with_claude
    )
    ANTHROPIC_IMPORTS_AVAILABLE = True
except Exception as e:
    print(f"Warning: Could not import Anthropic functions: {e}")
    ANTHROPIC_IMPORTS_AVAILABLE = False

# Initialize environment variables
load_dotenv()

# Check if Anthropic API key is available 
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

# Check if we can use the Anthropic API
USE_ANTHROPIC = bool(ANTHROPIC_API_KEY and ANTHROPIC_API_KEY.strip() and ANTHROPIC_IMPORTS_AVAILABLE)

if USE_ANTHROPIC:
    print("Anthropic API key found - AI document analysis enabled")
else:
    print("Using mock data for AI document analysis (Anthropic API not properly configured)")
    print("To enable AI analysis, please provide a valid Anthropic API key")

# PDF text extraction support
try:
    import fitz  # PyMuPDF
    PDF_EXTRACTION_AVAILABLE = True
except ImportError:
    PDF_EXTRACTION_AVAILABLE = False

# DOCX text extraction support
try:
    import docx
    DOCX_EXTRACTION_AVAILABLE = True
except ImportError:
    DOCX_EXTRACTION_AVAILABLE = False

def extract_text_from_file(filepath):
    """
    Extract text from various file types using appropriate libraries
    Supports PDF, DOCX, and image files (using AI vision capabilities)
    
    Args:
        filepath (str): Path to the file to extract text from
        
    Returns:
        str: Extracted text content
    """
    if not os.path.exists(filepath):
        return "Error: File not found."
    
    file_extension = os.path.splitext(filepath)[1].lower()
    
    try:
        # PDF extraction
        if file_extension == '.pdf' and PDF_EXTRACTION_AVAILABLE:
            text = ""
            try:
                with fitz.open(filepath) as pdf:
                    for page in pdf:
                        text += page.get_text()
                return text
            except Exception as e:
                print(f"Error extracting PDF text: {e}")
                return f"Error extracting text from PDF: {str(e)}"
        
        # DOCX extraction
        elif file_extension == '.docx' and DOCX_EXTRACTION_AVAILABLE:
            try:
                doc = docx.Document(filepath)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text
            except Exception as e:
                print(f"Error extracting DOCX text: {e}")
                return f"Error extracting text from DOCX: {str(e)}"
        
        # Image extraction using Claude Vision
        elif file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp'] and USE_ANTHROPIC:
            try:
                extracted_text = analyze_image_with_claude(filepath)
                return extracted_text
            except Exception as e:
                print(f"Error analyzing image with Claude: {e}")
                return f"Error extracting text from image: {str(e)}"
        
        # Fallback for when libraries or API keys are not available
        else:
            # For the demo, return a placeholder text
            if file_extension in ['.pdf', '.docx']:
                return f"This is extracted text from the document {os.path.basename(filepath)}. " \
                    f"This would normally contain the actual content of the document."
            elif file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                return f"This is extracted text from the image {os.path.basename(filepath)}. " \
                    f"In the full version, this would use OCR or AI vision models."
            else:
                return "Unsupported file type."
    
    except Exception as e:
        print(f"Error in extract_text_from_file: {e}")
        print(traceback.format_exc())
        return f"Error processing file: {str(e)}"

def analyze_text_with_ai(text, province="ON"):
    """
    Analyze document text using Claude or fallback to dummy data
    
    Args:
        text (str): The document text to analyze
        province (str): Two-letter province code (default: "ON" for Ontario)
        
    Returns:
        str: JSON string containing analysis results
    """
    try:
        if USE_ANTHROPIC and text.strip():
            # Use Anthropic Claude for analysis
            analysis = analyze_text_with_claude(text, province)
            
            # Add merit_weight if not present - indicates strength of claim/case
            if 'confidence' in analysis and 'merit_weight' not in analysis:
                confidence = analysis['confidence']
                analysis['merit_weight'] = calculate_merit_weight(confidence)
                
            return json.dumps(analysis)
        else:
            # Fallback to simulated analysis if API key not available
            return generate_mock_analysis()
    
    except Exception as e:
        print(f"Error in analyze_text_with_ai: {e}")
        print(traceback.format_exc())
        
        # Return error information in JSON format
        error_analysis = {
            "error": str(e),
            "issue_type": "Error",
            "classification": "Analysis Error",
            "recommended_forms": "Unable to determine",
            "legal_references": "Unable to determine",
            "response_strategy": "Please try again or contact support",
            "complexity": "standard",
            "price": 14.99,  # Default price
            "confidence": 0,
            "merit_weight": "Unknown"
        }
        
        return json.dumps(error_analysis)

def generate_response_preview(analysis_json, original_text, user_info=None):
    """
    Generate a preview of the AI-powered response letter
    
    Args:
        analysis_json (str): JSON string from analyze_text_with_ai
        original_text (str): The original document text
        user_info (dict): Optional user information
        
    Returns:
        str: HTML preview of the generated response
    """
    try:
        # Parse the analysis JSON
        analysis = json.loads(analysis_json)
        
        if USE_ANTHROPIC:
            # Use Claude to generate the response
            return generate_response_with_claude(analysis, original_text, user_info)
        else:
            # Generate a simple preview if API key not available
            return generate_mock_preview(analysis)
            
    except Exception as e:
        print(f"Error generating response preview: {e}")
        return f"<p>Error generating preview: {str(e)}</p>"

def calculate_merit_weight(confidence):
    """
    Calculate a merit weight label based on confidence score
    
    Args:
        confidence (float): Confidence score between 0 and 1
        
    Returns:
        str: Merit weight label
    """
    if confidence >= 0.85:
        return "Very Strong"
    elif confidence >= 0.7:
        return "Strong"
    elif confidence >= 0.5:
        return "Moderate"
    elif confidence >= 0.3:
        return "Weak"
    else:
        return "Very Weak"

def generate_mock_analysis():
    """Generate mock analysis data for testing when API is unavailable"""
    # Simulate different document types for testing
    document_types = [
        "housing",
        "credit dispute",
        "cas response",
        "cease and desist"
    ]
    
    # Randomly choose one for the demo
    chosen_type = random.choice(document_types)
    
    if "housing" in chosen_type:
        issue_type = "Housing Dispute"
        classification = "T2 - Tenant Rights"
        complexity = "standard"
        recommended_forms = "Form T2 - Application about Tenant Rights"
        legal_references = "Residential Tenancies Act, 2006, S.O. 2006, c. 17, Sections 22-23"
        response_strategy = "Document the interference with reasonable enjoyment. Include dates, times, and specific incidents. Reference your rights under Section 22 of the RTA."
    
    elif "credit" in chosen_type:
        issue_type = "Financial Dispute"
        classification = "Credit Report Error"
        complexity = "standard"
        recommended_forms = "Credit Bureau Dispute Letter"
        legal_references = "Consumer Reporting Act, R.S.O. 1990, c. C.33"
        response_strategy = "Clearly identify the inaccurate information. Provide any supporting documentation that proves the error. Request a prompt investigation and correction."
    
    elif "cas" in chosen_type:
        issue_type = "CAS Dispute"
        classification = "Child Protection"
        complexity = "premium"
        recommended_forms = "CAS Response Letter"
        legal_references = "Child, Youth and Family Services Act, 2017, S.O. 2017, c. 14, Sched. 1"
        response_strategy = "Address each concern specifically. Demonstrate your commitment to addressing any legitimate issues. Request specific action items and timeline for resolution."
    
    else:  # cease and desist
        issue_type = "Cease and Desist"
        classification = "Harassment"
        complexity = "urgent"
        recommended_forms = "Formal Cease and Desist Letter"
        legal_references = "Criminal Code (R.S.C., 1985, c. C-46) Section 264 (criminal harassment)"
        response_strategy = "Document all incidents of harassment including dates, times, and witnesses. Clearly state that the behavior must stop immediately. Specify potential legal actions if harassment continues."
    
    # Add pricing and confidence
    pricing = {
        'basic': 4.99,
        'standard': 14.99,
        'premium': 29.99,
        'urgent': 49.99
    }
    
    price = pricing.get(complexity.lower(), 14.99)
    confidence = random.uniform(0.5, 0.95)
    
    # Construct a JSON response similar to what would come from the AI
    analysis = {
        "issue_type": issue_type,
        "classification": classification,
        "complexity": complexity,
        "recommended_forms": recommended_forms,
        "legal_references": legal_references,
        "response_strategy": response_strategy,
        "price": price,
        "confidence": confidence,
        "merit_weight": calculate_merit_weight(confidence)
    }
    
    return json.dumps(analysis)

def generate_mock_preview(analysis):
    """Generate a mock HTML preview when API is unavailable"""
    issue_type = analysis.get('issue_type', 'Unknown')
    classification = analysis.get('classification', 'Unknown')
    forms = analysis.get('recommended_forms', 'None')
    legal_refs = analysis.get('legal_references', 'None')
    strategy = analysis.get('response_strategy', 'None')
    
    current_date = time.strftime("%B %d, %Y")
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: right;">
            <p>{current_date}</p>
        </div>
        
        <div style="margin: 30px 0;">
            <p>To Whom It May Concern,</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p><strong>RE: {classification}</strong></p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p>I am writing regarding the {issue_type.lower()} matter. After careful review of the documentation, I would like to address several key points.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p>{strategy}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p>According to {legal_refs}, I am entitled to these protections and remedies.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p>I have prepared the necessary documentation ({forms}) and am prepared to pursue this matter further if a satisfactory resolution cannot be reached.</p>
        </div>
        
        <div style="margin: 30px 0;">
            <p>Sincerely,</p>
            <p>[Your Name]</p>
        </div>
    </div>
    """
    
    return html