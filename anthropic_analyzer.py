"""
Anthropic Claude Model Integration for SmartDispute.ai
Handles document analysis and content generation using Anthropic Claude models
"""
import os
import json
import base64
from dotenv import load_dotenv
from anthropic import Anthropic

# Load environment variables
load_dotenv()

# Initialize Anthropic client with support for different API key formats
api_key = os.getenv('ANTHROPIC_API_KEY')

# Try to initialize the Anthropic client
try:
    anthropic = Anthropic(api_key=api_key)
    print(f"Anthropic client initialized successfully")
except Exception as e:
    print(f"Error initializing Anthropic client: {e}")
    anthropic = None

# Pricing configuration (same as OpenAI for consistency)
PRICING = {
    'basic': 4.99,  # Basic document analysis
    'standard': 14.99,  # Standard response with legal references
    'premium': 29.99,  # Premium response with full dispute letter
    'urgent': 49.99,  # Urgent response with priority processing
}

def analyze_text_with_claude(text, province="ON"):
    """
    Analyze document content with Anthropic Claude to classify issue and suggest responses
    
    Args:
        text (str): The extracted text from the document
        province (str): Two-letter province code (default: "ON" for Ontario)
        
    Returns:
        dict: Analysis results including classification, recommended response, and pricing
    """
    try:
        # Check if Anthropic client is available
        if anthropic is None:
            print("Anthropic client is not available, returning mock analysis")
            return {
                "issue_type": "Mock Analysis",
                "classification": "API Unavailable",
                "recommended_forms": "Please configure a valid Anthropic API key",
                "legal_references": "N/A",
                "response_strategy": "This is a mock response since the Anthropic API is not properly configured",
                "complexity": "standard",
                "confidence": 0.5
            }
            
        system_prompt = f"""You are a legal assistant for SmartDispute.ai, specialized in Canadian legal matters.
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
        Include detailed explanations for each field based on the document content."""
        
        try:
            response = anthropic.messages.create(
                model="claude-3-5-sonnet-20241022",  # Using the latest stable Claude model
                system=system_prompt,
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": text}
                ]
            )
        except Exception as api_error:
            print(f"API error when calling Anthropic: {api_error}")
            raise Exception(f"Anthropic API call failed: {api_error}")
        
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
        print(f"Error analyzing with Claude: {e}")
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

def analyze_image_with_claude(image_path):
    """
    Analyze an image with Anthropic Claude Vision capabilities
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Extracted text content from the image
    """
    try:
        # Convert the image to base64
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",  # Using the latest stable Claude model
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
                            "data": base64.b64encode(image_data).decode('utf-8')
                        }
                    }
                ]
            }]
        )
        
        return response.content[0].text
    
    except Exception as e:
        print(f"Error analyzing image with Claude: {e}")
        return f"Error extracting text from image: {e}"

def generate_response_with_claude(analysis, text, user_info=None):
    """
    Generate a response preview based on the AI analysis and document content using Claude
    
    Args:
        analysis (dict): The analysis results from AI
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
        
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",  # Using the latest stable Claude model
            max_tokens=1500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text
    
    except Exception as e:
        print(f"Error generating response with Claude: {e}")
        return f"<p>Error generating preview: {e}</p>"