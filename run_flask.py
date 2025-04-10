#!/usr/bin/env python3
"""
Simple Python script to run the Flask app in the background
"""
import os
import subprocess
import time
import signal
import sys

def run_flask_app():
    """Run the Flask app in the background"""
    print("Starting Flask app...")
    
    # Kill any existing Python processes
    try:
        os.system("pkill -f 'python app.py'")
    except:
        pass
    
    # Start the Flask app
    try:
        process = subprocess.Popen(['python', 'app.py'], 
                                  stdout=subprocess.PIPE,
                                  stderr=subprocess.PIPE)
        
        # Wait a bit to make sure it starts
        time.sleep(2)
        
        # Check if process is still running
        if process.poll() is None:
            print("Flask app started successfully.")
            print("You can access the OCR tool at: http://localhost:3000/ocr")
            print("Press Ctrl+C to stop the Flask app.")
            
            # Keep the script running
            try:
                while True:
                    line = process.stdout.readline()
                    if line:
                        print(line.decode('utf-8').strip())
                    else:
                        break
                    time.sleep(0.1)
            except KeyboardInterrupt:
                print("Stopping Flask app...")
                process.send_signal(signal.SIGINT)
                process.wait()
                print("Flask app stopped.")
        else:
            print("Failed to start Flask app.")
            stdout, stderr = process.communicate()
            print("Error:", stderr.decode('utf-8'))
    except Exception as e:
        print(f"Error starting Flask app: {e}")

if __name__ == "__main__":
    run_flask_app()