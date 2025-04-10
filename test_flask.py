#!/usr/bin/env python3
"""
Simple Flask test app
"""
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Flask is running!"

@app.route('/ocr-test')
def ocr_test():
    return "OCR Test Route"

if __name__ == '__main__':
    print("Starting test Flask app on port 3000...")
    app.run(host='0.0.0.0', port=3000, debug=False)