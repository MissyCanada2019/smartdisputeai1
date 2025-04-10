#!/usr/bin/env python3
"""
Test OCR pipeline directly without the web interface
"""
import os
import json
from ocr_parser import run_ocr_pipeline

def main():
    """Main test function"""
    
    # Create test directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Look for image files in attached_assets
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
    
    # Run OCR pipeline
    with open(test_image, "rb") as f:
        results = run_ocr_pipeline(f)
    
    # Print results
    print(f"OCR Results for {test_image}:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()