"""
Enhanced Document Analysis Module for SmartDispute.ai
Handles the extraction of content from uploaded files and multi-model AI analysis
Supports both OpenAI's GPT-4o and Anthropic's Claude models
"""
import os
import json
import docx
import datetime
from openai import OpenAI
from anthropic import Anthropic
from dotenv import load_dotenv
import base64
from PIL import Image
from io import BytesIO
import logging

# Flag to indicate if PyMuPDF is available
PYMUPDF_AVAILABLE = False
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    logging.warning("PyMuPDF (fitz) not available. PDF text extraction will be limited.")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Global variables for AI clients
openai_client = None
anthropic_client = None

# Function to check if mock mode is enabled
def is_mock_mode():
    return os.getenv('MOCK_MODE', 'false').lower() == 'true'

# Function to initialize clients
def initialize_clients():
    global openai_client, anthropic_client
    
    # Check mock mode
    if is_mock_mode():
        logger.info("MOCK_MODE is enabled. Using simulated AI responses.")
        return
    
    # Initialize OpenAI client if API key available
    if os.getenv('OPENAI_API_KEY'):
        try:
            openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            logger.info("OpenAI client initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI client: {e}")
    else:
        logger.warning("OpenAI client not available. Set OPENAI_API_KEY environment variable.")
    
    # Initialize Anthropic client if API key available
    if os.getenv('ANTHROPIC_API_KEY'):
        try:
            anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
            logger.info("Anthropic client initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize Anthropic client: {e}")
    else:
        logger.warning("Anthropic client not available. Set ANTHROPIC_API_KEY environment variable.")

# Initialize clients on module load
initialize_clients()

# Pricing configuration
PRICING = {
    'basic': 4.99,  # Basic document analysis
    'standard': 14.99,  # Standard response with legal references
    'premium': 29.99,  # Premium response with full dispute letter
    'urgent': 49.99,  # Urgent response with priority processing
}

def extract_text_from_pdf(file_path):
    """Extract text content from a PDF file"""
    text = ""
    
    # If PyMuPDF is not available, use AI vision to process the PDF
    if not PYMUPDF_AVAILABLE:
        logger.info("PyMuPDF not available, using AI vision to extract PDF text")
        # Convert to base64 and use the image extraction method
        return extract_text_from_image(file_path, model="openai")
    
    # Otherwise use PyMuPDF
    try:
        with fitz.open(file_path) as pdf:
            for page in pdf:
                text += page.get_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return f"Error extracting text: {e}"

def extract_text_from_docx(file_path):
    """Extract text content from a DOCX file"""
    try:
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        return f"Error extracting text: {e}"

def extract_text_from_image(file_path, model="openai"):
    """
    Extract text from an image using AI vision capabilities
    
    Args:
        file_path (str): Path to the image file
        model (str): AI model to use ('openai' or 'anthropic')
        
    Returns:
        str: Extracted text content from the image
    """
    # If in mock mode, return simulated response
    if is_mock_mode():
        logger.info(f"MOCK MODE: Simulating image text extraction from {file_path}")
        return f"""MOCK IMAGE TEXT EXTRACTION
        
This is simulated text that would be extracted from the image at {file_path}.
        
For testing purposes only.
        
In a production environment, this would contain the actual text extracted from the document image using AI vision capabilities.
        
File analyzed: {file_path}
Model that would be used: {model}
        """
    
    try:
        # Convert the image to base64
        with open(file_path, "rb") as image_file:
            image_data = image_file.read()
            base64_image = base64.b64encode(image_data).decode('utf-8')
        
        if model.lower() == "openai" and openai_client:
            # Use OpenAI's Vision model to extract text
            response = openai_client.chat.completions.create(
                model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract all text from this image. Format it clearly, preserving paragraphs and important formatting."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500
            )
            return response.choices[0].message.content
            
        elif anthropic_client:  # Use Anthropic Claude
            response = anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",  # the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
                max_tokens=1500,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all text from this image. Format it clearly, preserving paragraphs and important formatting."
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": base64_image
                            }
                        }
                    ]
                }]
            )
            return response.content[0].text
        else:
            return "No AI service available. Please check your API keys."
            
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        return f"Error extracting text from image: {e}"

def extract_content(file_path, model="openai"):
    """
    Extract content from various file types
    
    Args:
        file_path (str): Path to the file
        model (str): AI model to use for image processing
        
    Returns:
        str: Extracted text content
    """
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension in ['pdf']:
        return extract_text_from_pdf(file_path)
    elif file_extension in ['docx', 'doc']:
        return extract_text_from_docx(file_path)
    elif file_extension in ['jpg', 'jpeg', 'png']:
        return extract_text_from_image(file_path, model)
    else:
        return "Unsupported file type"

def analyze_document(text, province="ON", model="openai"):
    """
    Analyze document content with AI to classify issue and suggest responses
    
    Args:
        text (str): The extracted text from the document
        province (str): Two-letter province code (default: "ON" for Ontario)
        model (str): AI model to use ('openai' or 'anthropic')
        
    Returns:
        dict: Analysis results including classification, recommended response, and pricing
    """
    # If in mock mode, return simulated response
    if is_mock_mode():
        logger.info(f"MOCK MODE: Simulating document analysis for province {province}")
        
        # Create mock analysis based on text content
        if "eviction" in text.lower() or "landlord" in text.lower() or "tenant" in text.lower():
            issue_type = "Housing"
            classification = "T2 - Notice of Eviction"
            complexity = "standard"
        elif "child" in text.lower() or "cas" in text.lower() or "welfare" in text.lower():
            issue_type = "CAS/Child Services"
            classification = "Records Request"
            complexity = "premium"
        elif "employment" in text.lower() or "workplace" in text.lower() or "termination" in text.lower():
            issue_type = "Employment"
            classification = "Wrongful Dismissal"
            complexity = "premium"
        else:
            issue_type = "General"
            classification = "Legal Dispute"
            complexity = "basic"
            
        analysis = {
            "issue_type": issue_type,
            "classification": classification,
            "recommended_forms": f"Mock {issue_type} form recommendation for {province}",
            "legal_references": f"Mock legal references for {province}",
            "response_strategy": "Mock response strategy - This is a simulated response for development purposes",
            "complexity": complexity,
            "confidence": 0.85,
            "price": PRICING[complexity],
            "model_used": f"Mock {model}"
        }
        
        return analysis
    
    try:
        system_prompt = f"""
        You are a legal assistant for SmartDispute.ai, specialized in Canadian legal matters.
        Analyze this document from {province} and identify:
        
        1. Type of issue (housing, employment, consumer, CAS/child services, etc.)
        2. Specific classification (e.g., "T2 - Interference with reasonable enjoyment" for housing)
        3. Recommended legal forms or responses
        4. Relevant legal references from {province}
        5. Suggested response strategy
        6. Document complexity (basic, standard, premium, or urgent)
        
        Respond in valid JSON format with these fields:
        {{
            "issue_type": string,
            "classification": string,
            "recommended_forms": string,
            "legal_references": string,
            "response_strategy": string,
            "complexity": string,
            "confidence": number (0-1)
        }}
        Include detailed explanations for each field based on the document content.
        """
        
        if model.lower() == "openai" and openai_client:
            # Use OpenAI's GPT-4o
            response = openai_client.chat.completions.create(
                model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"},
                max_tokens=1500
            )
            
            # Parse the JSON response
            analysis = json.loads(response.choices[0].message.content)
            
        elif anthropic_client:  # Use Anthropic Claude
            response = anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",  # the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
                system=system_prompt,
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": text}
                ]
            )
            
            # Parse the JSON response - Claude doesn't have a structured JSON format option so we need to extract it
            response_text = response.content[0].text
            # Extract JSON from the response by finding the first { and the last }
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                analysis = json.loads(json_str)
            else:
                # Fallback if no JSON format is detected
                analysis = {
                    "issue_type": "Unknown",
                    "classification": "Error parsing Claude response",
                    "recommended_forms": "Unable to determine",
                    "legal_references": "Unable to determine",
                    "response_strategy": "Please try again",
                    "complexity": "standard",
                    "confidence": 0.5
                }
        else:
            return {
                "error": "No AI service available. Please check your API keys.",
                "issue_type": "Unknown",
                "classification": "No AI service available",
                "recommended_forms": "Unable to determine",
                "legal_references": "Unable to determine",
                "response_strategy": "Please check API keys",
                "complexity": "standard",
                "price": PRICING['standard'],
                "confidence": 0,
                "model_used": model
            }
        
        # Add pricing based on complexity
        if 'complexity' in analysis:
            complexity = analysis['complexity'].lower()
            if complexity in PRICING:
                analysis['price'] = PRICING[complexity]
            else:
                analysis['price'] = PRICING['standard']  # Default pricing
        else:
            analysis['price'] = PRICING['standard']  # Default pricing
            
        # Add model information
        analysis['model_used'] = model
            
        return analysis
    
    except Exception as e:
        logger.error(f"Error analyzing with {model}: {e}")
        return {
            "error": str(e),
            "issue_type": "Unknown",
            "classification": "Error during analysis",
            "recommended_forms": "Unable to determine",
            "legal_references": "Unable to determine",
            "response_strategy": "Please contact support",
            "complexity": "standard",
            "price": PRICING['standard'],
            "confidence": 0,
            "model_used": model
        }

def generate_response_preview(analysis, text, user_info=None, model="openai"):
    """
    Generate a response preview based on the AI analysis and document content
    
    Args:
        analysis (dict): The analysis results from AI
        text (str): The original document text
        user_info (dict): Optional user information for personalization
        model (str): AI model to use ('openai' or 'anthropic')
    
    Returns:
        str: HTML preview of the generated response
    """
    # If in mock mode, return simulated response
    if is_mock_mode():
        logger.info(f"MOCK MODE: Generating mock response preview")
        
        # Create a mockup of user information
        name = user_info.get('name', 'Jane Doe') if user_info else 'Jane Doe'
        address = user_info.get('address', '123 Main Street, Toronto, ON') if user_info else '123 Main Street, Toronto, ON'
        
        # Return a formatted HTML mock response
        current_date = datetime.datetime.now().strftime("%B %d, %Y")
        issue_type = analysis.get('issue_type', 'Unknown')
        classification = analysis.get('classification', 'Unknown')
        legal_references = analysis.get('legal_references', 'Unknown')
        
        # Create a simplified HTML response without embedded CSS (which causes Python parsing issues)
        return f"""
        <div style="font-family: Georgia, serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 20px;">
                <h1 style="color: #2c5282; margin-bottom: 5px;">SmartDispute.ai</h1>
                <p>123 Legal Avenue, Suite 500<br>Toronto, ON M5V 2K4<br>Canada</p>
            </div>
            
            <div style="text-align: right; margin: 20px 0;">
                {current_date}
            </div>
            
            <div style="margin-bottom: 20px;">
                <p>Regarding: Legal Matter - {issue_type} ({classification})</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p>To Whom It May Concern:</p>
            </div>
            
            <div>
                <p style="margin-bottom: 15px; text-align: justify;">I am writing in response to the {issue_type} matter referenced as {classification}. This letter serves as a formal response to the concerns outlined in your correspondence.</p>
                
                <p style="margin-bottom: 15px; text-align: justify;">My name is {name} and I reside at {address}.</p>
                
                <p style="margin-bottom: 15px; text-align: justify;">Based on my understanding of the applicable laws and regulations, including {legal_references}, I believe there are several important considerations that must be addressed in this matter.</p>
                
                <p style="margin-bottom: 15px; text-align: justify;">This is a mock legal response generated for development purposes. In a production environment, this section would contain a detailed analysis of the specific legal issues identified in your document and a comprehensive strategy for addressing them.</p>
                
                <p style="margin-bottom: 15px; text-align: justify;">The content would be tailored to your specific situation and would include relevant legal references, precedents, and strategic recommendations based on the AI analysis of your document.</p>
            </div>
            
            <div style="margin-top: 30px;">
                <p>Please contact me at your earliest convenience to discuss this matter further.</p>
                <p>Sincerely,</p>
                <p style="margin-top: 40px; font-style: italic;">{name}</p>
            </div>
        </div>
        """
    
    try:
        user_context = ""
        if user_info:
            if 'name' in user_info:
                user_context += f"My name is {user_info['name']}. "
            if 'address' in user_info:
                user_context += f"I reside at {user_info['address']}. "
            if 'details' in user_info:
                user_context += f"{user_info['details']}"
        
        # Create a prompt for response generation
        prompt = f"""
        You are drafting a legal response for a client based on this analysis:
        
        Issue Type: {analysis.get('issue_type', 'Unknown')}
        Classification: {analysis.get('classification', 'Unknown')}
        Recommended Forms: {analysis.get('recommended_forms', 'None')}
        Legal References: {analysis.get('legal_references', 'None')}
        
        The client provided this additional context: {user_context}
        
        Original document text:
        {text[:1000]}... [truncated]
        
        Create a legally sound response draft that:
        1. Is professionally formatted as a legal letter
        2. Addresses the key issues in the document
        3. Uses appropriate legal language and references
        4. Presents the client's position clearly and persuasively
        
        Format the response as clean HTML that can be rendered in a preview.
        """
        
        if model.lower() == "openai" and openai_client:
            # Use OpenAI's GPT-4o
            response = openai_client.chat.completions.create(
                model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500
            )
            return response.choices[0].message.content
            
        elif anthropic_client:  # Use Anthropic Claude
            response = anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",  # the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        else:
            return "<p>No AI service available. Please check your API keys.</p>"
    
    except Exception as e:
        logger.error(f"Error generating response preview with {model}: {e}")
        return f"<p>Error generating preview: {e}</p>"