#!/bin/bash
# Start OCR server in the background
echo "Starting OCR server..."

# Kill any existing OCR server
pkill -f "python ocr_server.py" || true

# Start new OCR server
nohup python ocr_server.py > ocr_server_output.log 2>&1 &

# Check if it started successfully
sleep 2
if pgrep -f "python ocr_server.py" > /dev/null; then
    echo "OCR server started successfully!"
    echo "OCR server is running on: http://localhost:3001/ocr"
else
    echo "Failed to start OCR server. Check ocr_server_output.log for details."
    exit 1
fi