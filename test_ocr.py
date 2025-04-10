#!/usr/bin/env python3
"""
Test script for the OCR functionality
"""
import requests
import sys
import json
import argparse
import os

def test_ocr_upload(image_path, url="http://localhost:3000/ocr-upload"):
    """
    Send an image to the OCR endpoint and print the response
    
    Args:
        image_path: Path to the image file
        url: URL of the OCR endpoint
    """
    if not os.path.exists(image_path):
        print(f"Error: File not found at {image_path}")
        return 1
    
    print(f"Testing OCR with image: {image_path}")
    
    # Check file type
    if not image_path.lower().endswith(('.png', '.jpg', '.jpeg')):
        print("Error: File must be a PNG or JPEG image")
        return 1
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg' if image_path.lower().endswith(('.jpg', '.jpeg')) else 'image/png')}
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("\nOCR Response:")
            print(json.dumps(result, indent=2))
            
            if result.get('status') == 'success':
                print("\nExtracted Information:")
                data = result.get('data', {})
                print(f"Document Type: {data.get('document_type', 'Unknown')}")
                print(f"Tenant Name: {data.get('tenant_name', 'Not detected')}")
                print(f"Landlord Name: {data.get('landlord_name', 'Not detected')}")
                print(f"Date: {data.get('date', 'Not detected')}")
                
                if data.get('issues'):
                    print("\nIssues Detected:")
                    for issue in data.get('issues', []):
                        print(f"- {issue}")
                
                return 0
            else:
                print(f"Error: {result.get('error', 'Unknown error')}")
                return 1
        else:
            print(f"Error: HTTP {response.status_code}")
            print(response.text)
            return 1
            
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to {url}")
        print("Make sure the Flask server is running on port 3000")
        return 1
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the OCR upload functionality")
    parser.add_argument("image_path", help="Path to the image file to test")
    parser.add_argument("--url", default="http://localhost:3000/ocr-upload", help="URL of the OCR endpoint")
    
    args = parser.parse_args()
    
    sys.exit(test_ocr_upload(args.image_path, args.url))