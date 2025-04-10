#!/usr/bin/env python3
"""
Test OCR pipeline directly without the web interface
Can be run directly or used as a module by other scripts
"""
import os
import json
import sys
from ocr_parser import run_ocr_pipeline

def process_image(image_path):
    """
    Process an image with the OCR pipeline
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Results from the OCR pipeline
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"File not found: {image_path}")
            
        # Run OCR pipeline
        with open(image_path, "rb") as f:
            results = run_ocr_pipeline(f)
            
        return results
    except Exception as e:
        print(f"Error processing image {image_path}: {str(e)}", file=sys.stderr)
        return {
            "error": str(e),
            "full_text": f"Error processing image: {str(e)}"
        }

def main():
    """Main test function"""
    
    # Create test directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Check if a file path was provided as an argument
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
        test_image = sys.argv[1]
        print(f"Using provided image: {test_image}")
    else:
        # Look for test images in attached_assets
        print("Looking for test images in attached_assets...")
        image_files = []
        for filename in os.listdir("attached_assets"):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_files.append(os.path.join("attached_assets", filename))
        
        if not image_files:
            print("No image files found in attached_assets")
            return
        
        # Print available images
        print("Available images:")
        for i, img in enumerate(image_files[:10]):  # Show first 10 only
            print(f"{i}: {img}")
        
        # Try to find an eviction notice or similar document based on filename
        eviction_candidates = [img for img in image_files if 'evict' in img.lower() or 'notice' in img.lower() or 'n4' in img.lower()]
        
        # Select test image - prioritize eviction notices
        if eviction_candidates:
            test_image = eviction_candidates[0]
            print(f"Selected eviction notice candidate: {test_image}")
        else:
            # Or try IMG_0392.png which was mentioned in the imports 
            specific_image = "attached_assets/IMG_0392.png"
            if os.path.exists(specific_image):
                test_image = specific_image
                print(f"Selected specific image: {test_image}")
            else:
                test_image = image_files[0]
                print(f"Selected first available image: {test_image}")
    
    print(f"Testing OCR with image: {test_image}")
    
    # Process the image
    results = process_image(test_image)
    
    # Print results
    print(f"OCR Results for {test_image}:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()