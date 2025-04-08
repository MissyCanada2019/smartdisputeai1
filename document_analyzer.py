"""
Document Analysis Module for SmartDispute.ai
Handles the extraction of content from uploaded files and AI analysis
"""
import os
import json
import fitz  # PyMuPDF
import docx
from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from werkzeug.utils import secure_filename
import base64
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

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
    try:
        with fitz.open(file_path) as pdf:
            for page in pdf:
                text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return f"Error extracting text: {e}"

def extract_text_from_docx(file_path):
    """Extract text content from a DOCX file"""
    try:
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
        return f"Error extracting text: {e}"

def extract_text_from_image(file_path):
    """Extract text from an image using OpenAI's Vision model"""
    try:
        # Convert the image to base64
        with open(file_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Use OpenAI's Vision model to extract text
        response = client.chat.completions.create(
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
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return f"Error extracting text from image: {e}"

def extract_content(file_path):
    """Extract content from various file types"""
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension in ['pdf']:
        return extract_text_from_pdf(file_path)
    elif file_extension in ['docx', 'doc']:
        return extract_text_from_docx(file_path)
    elif file_extension in ['jpg', 'jpeg', 'png']:
        return extract_text_from_image(file_path)
    else:
        return "Unsupported file type"

def analyze_with_openai(text, province="ON"):
    """
    Analyze document content with OpenAI to classify issue and suggest responses
    
    Args:
        text (str): The extracted text from the document
        province (str): Two-letter province code (default: "ON" for Ontario)
        
    Returns:
        dict: Analysis results including classification, recommended response, and pricing
    """
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
        
        response = client.chat.completions.create(
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
        
        # Add pricing based on complexity
        if 'complexity' in analysis:
            complexity = analysis['complexity'].lower()
            if complexity in PRICING:
                analysis['price'] = PRICING[complexity]
            else:
                analysis['price'] = PRICING['standard']  # Default pricing
        else:
            analysis['price'] = PRICING['standard']  # Default pricing
            
        return analysis
    
    except Exception as e:
        print(f"Error analyzing with OpenAI: {e}")
        return {
            "error": str(e),
            "issue_type": "Unknown",
            "classification": "Error during analysis",
            "recommended_forms": "Unable to determine",
            "legal_references": "Unable to determine",
            "response_strategy": "Please contact support",
            "complexity": "standard",
            "price": PRICING['standard'],
            "confidence": 0
        }

def generate_response_preview(analysis, text, user_info=None):
    """
    Generate a response preview based on the AI analysis and document content
    
    Args:
        analysis (dict): The analysis results from OpenAI
        text (str): The original document text
        user_info (dict): Optional user information for personalization
    
    Returns:
        str: HTML preview of the generated response
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
        
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Error generating response preview: {e}")
        return f"<p>Error generating preview: {e}</p>"