"""
Test script for enhanced AI handler with Anthropic Claude integration
"""
import os
import json
import sys
from dotenv import load_dotenv
from ai_handler import extract_text_from_file, analyze_text_with_ai, generate_response_preview

# Load environment variables
load_dotenv()

def main():
    """Main function to test AI handler functionality"""
    # Check if API key is available
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    if not anthropic_key:
        print("Warning: ANTHROPIC_API_KEY not found in environment variables.")
        print("Continuing with mock data...")
    else:
        print(f"Using Anthropic API key: {anthropic_key[:4]}...{anthropic_key[-4:]}")
    
    # Test text analysis
    test_text = """
    Dear Tenant,
    
    This letter serves as formal notice that your rent will be increased by 5% effective June 1st, 2025. 
    Your monthly rent will increase from $1,500 to $1,575.
    
    Additionally, I must inform you that I will be entering your unit on May 15th, 2025 at 10:00 AM 
    to conduct inspections of the plumbing and electrical systems. I expect this will take approximately 
    2-3 hours to complete. Note that I may need to enter without prior notice in the future for emergency repairs.
    
    Please be reminded that your lease prohibits any pets on the premises. I've received complaints about 
    barking sounds coming from your unit. Any violation of this term may result in eviction proceedings.
    
    Sincerely,
    John Smith
    Landlord
    """
    
    print("\n=== Testing text analysis ===")
    analysis_json = analyze_text_with_ai(test_text, "ON")
    analysis = json.loads(analysis_json)
    
    print(f"Issue Type: {analysis.get('issue_type', 'Unknown')}")
    print(f"Classification: {analysis.get('classification', 'Unknown')}")
    print(f"Complexity: {analysis.get('complexity', 'Unknown')}")
    print(f"Price: ${analysis.get('price', 0):.2f}")
    print(f"Confidence: {analysis.get('confidence', 0):.2f}")
    print(f"Merit Weight: {analysis.get('merit_weight', 'Unknown')}")
    print(f"Recommended Forms: {analysis.get('recommended_forms', 'Unknown')}")
    
    # Test response generation
    print("\n=== Testing response generation ===")
    user_info = {
        "name": "Jane Doe",
        "address": "123 Main St, Toronto, ON",
        "details": "I have been a tenant at this property for 3 years."
    }
    
    preview_html = generate_response_preview(analysis_json, test_text, user_info)
    
    # Save the preview to a file for viewing
    with open("preview_response.html", "w") as f:
        f.write(preview_html)
        
    print(f"Response preview saved to preview_response.html")
    
    # Test file extraction if argument provided
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        if os.path.exists(file_path):
            print(f"\n=== Testing file extraction from {file_path} ===")
            extracted_text = extract_text_from_file(file_path)
            print(f"Extracted text (first 300 chars): {extracted_text[:300]}...")
            
            # Analyze the extracted text
            print("\n=== Analyzing extracted text ===")
            file_analysis_json = analyze_text_with_ai(extracted_text)
            file_analysis = json.loads(file_analysis_json)
            
            print(f"Issue Type: {file_analysis.get('issue_type', 'Unknown')}")
            print(f"Classification: {file_analysis.get('classification', 'Unknown')}")
            print(f"Complexity: {file_analysis.get('complexity', 'Unknown')}")
            print(f"Price: ${file_analysis.get('price', 0):.2f}")
        else:
            print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()