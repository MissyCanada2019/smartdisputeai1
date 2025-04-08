"""
Test script for the enhanced document analyzer
"""
import os
import sys
from enhanced_document_analyzer import extract_content, analyze_document, generate_response_preview

def test_document_analysis():
    """Test the AI document analysis capability"""
    
    # Set MOCK_MODE to true for testing without valid API keys
    os.environ['MOCK_MODE'] = 'true'
    
    print("Testing document analysis with MOCK_MODE...")
    
    # Look for a test image
    test_images = ["attached_assets/IMG_0277.png", "attached_assets/IMG_0371.png", "attached_assets/IMG_0378.png"]
    
    # Test with a sample image
    for image_path in test_images:
        if os.path.exists(image_path):
            print(f"Analyzing image: {image_path}")
            
            # Test OpenAI version
            print("\n--- OpenAI Model Test ---")
            extracted_text = extract_content(image_path, model="openai")
            print(f"Extracted text (first 200 chars): {extracted_text[:200]}...")
            
            # Test document analysis
            analysis = analyze_document(extracted_text, province="ON", model="openai")
            print(f"Analysis: {analysis}")
            
            # Generate a response preview
            user_info = {
                "name": "John Smith",
                "address": "456 Maple Avenue, Toronto, ON M6J 3H2",
                "details": "I have been living at this address for 5 years and have always paid rent on time."
            }
            preview = generate_response_preview(analysis, extracted_text, user_info=user_info, model="openai")
            print(f"Preview (first 200 chars): {preview[:200]}...")
            
            # Test Anthropic version
            print("\n--- Anthropic Model Test ---")
            extracted_text = extract_content(image_path, model="anthropic")
            print(f"Extracted text (first 200 chars): {extracted_text[:200]}...")
            
            # Test document analysis
            analysis = analyze_document(extracted_text, province="BC", model="anthropic")
            print(f"Analysis: {analysis}")
            
            # Generate a response preview
            preview = generate_response_preview(analysis, extracted_text, user_info=user_info, model="anthropic")
            print(f"Preview (first 200 chars): {preview[:200]}...")
            
            break
    else:
        print("No test images found")
        
    # Test with text containing housing keywords
    print("\n--- Testing with Housing Text ---")
    housing_text = """
    Dear Tenant,
    
    This letter serves as notice of eviction from the premises located at 123 Oak Street, 
    Apartment 4B, Toronto, Ontario. As your landlord, I am terminating your tenancy effective
    30 days from the date of this notice due to consistent late payment of rent and property damage.
    
    Please vacate the premises and return all keys by the specified date.
    
    Sincerely,
    Property Management
    """
    
    analysis = analyze_document(housing_text, province="ON", model="openai")
    print(f"Housing Analysis: {analysis}")
    
    # Test with text containing CAS keywords
    print("\n--- Testing with CAS Text ---")
    cas_text = """
    Re: Child Welfare Case #CD-2023-0456
    
    To whom it may concern at Children's Aid Society,
    
    I am writing to request all records related to the case involving my children.
    As per the Child, Youth and Family Services Act, I am entitled to access these records.
    
    Please provide these documents within 30 days as required by law.
    
    Regards,
    Concerned Parent
    """
    
    analysis = analyze_document(cas_text, province="ON", model="anthropic")
    print(f"CAS Analysis: {analysis}")

def test_with_real_apis():
    """Test with real API keys if available"""
    # Reset mock mode
    os.environ['MOCK_MODE'] = 'false'
    
    # Check if we have API keys available
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        print("No API keys found. Skipping real API tests.")
        return
    
    print("\n=== Testing with Real APIs ===")
    
    # Test with OpenAI if available
    if os.getenv("OPENAI_API_KEY"):
        print("Testing OpenAI API...")
        try:
            # Simple test to check if the API key works
            sample_text = "This is a test of the OpenAI API connection."
            analysis = analyze_document(sample_text, province="ON", model="openai")
            
            # Check if there was an error in the analysis
            if 'error' in analysis:
                print(f"OpenAI API test failed: {analysis['error']}")
            else:
                print("OpenAI API test successful!")
        except Exception as e:
            print(f"OpenAI API test failed: {e}")
    
    # Test with Anthropic if available
    if os.getenv("ANTHROPIC_API_KEY"):
        print("Testing Anthropic API...")
        try:
            # Simple test to check if the API key works
            sample_text = "This is a test of the Anthropic API connection."
            analysis = analyze_document(sample_text, province="ON", model="anthropic")
            
            # Check if there was an error in the analysis
            if 'error' in analysis:
                print(f"Anthropic API test failed: {analysis['error']}")
            else:
                print("Anthropic API test successful!")
        except Exception as e:
            print(f"Anthropic API test failed: {e}")

if __name__ == "__main__":
    test_document_analysis()
    test_with_real_apis()