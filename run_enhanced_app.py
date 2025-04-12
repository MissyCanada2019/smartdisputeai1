#!/usr/bin/env python3
"""
SmartDispute.ai Enhanced App Runner

This script provides an easy way to run the enhanced document analysis app
with or without mock mode enabled.

Usage:
    python run_enhanced_app.py [--mock]
    
    --mock: Enable mock mode (simulated AI responses)
"""

import os
import sys
import argparse
from app_enhanced import app

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Run the enhanced document analysis app')
    parser.add_argument('--mock', action='store_true', 
                        help='Enable mock mode (simulated AI responses)')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    
    # Set environment variable for mock mode if requested
    if args.mock:
        print("🔧 Mock mode ENABLED - Using simulated AI responses")
        os.environ['MOCK_MODE'] = 'true'
    else:
        # Check if API keys are available
        if not os.getenv('OPENAI_API_KEY') and not os.getenv('ANTHROPIC_API_KEY'):
            print("⚠️  WARNING: No API keys found. Setting MOCK_MODE to true.")
            print("   To use real AI services, set OPENAI_API_KEY or ANTHROPIC_API_KEY")
            print("   in your environment variables or .env file.")
            os.environ['MOCK_MODE'] = 'true'
        else:
            print("🚀 Using real AI services")
            os.environ['MOCK_MODE'] = 'false'
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=3000, debug=True)