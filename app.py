"""
SmartDispute.ai Document Upload Handler
A Flask application that handles document uploads and AI analysis
"""
from flask import Flask, request, render_template, redirect, url_for, send_file
import os
from werkzeug.utils import secure_filename
from ai_handler import extract_text_from_file, analyze_text_with_ai
from pricing_and_pdf import determine_price_and_type, generate_pdf_preview

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('upload_form.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'document' not in request.files:
        return 'No file part', 400
    file = request.files['document']
    if file.filename == '':
        return 'No selected file', 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # AI analysis
            extracted_text = extract_text_from_file(filepath)
            analysis_result = analyze_text_with_ai(extracted_text)

            # Determine type and price
            case_type, price = determine_price_and_type(analysis_result)

            # Generate PDF preview
            preview_path = os.path.join(app.config['PREVIEW_FOLDER'], f"{filename}_preview.pdf")
            generate_pdf_preview(analysis_result, output_path=preview_path)

            return f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Document Analysis - SmartDispute.ai</title>
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #000; color: #fff; text-align: center; padding: 20px; }}
                    h1, h2, h3 {{ color: #ff0000; }}
                    .container {{ background-color: #111; padding: 20px; border-radius: 10px; max-width: 800px; margin: 0 auto; text-align: left; }}
                    .analysis {{ background-color: #222; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                    a {{ color: #ff0000; text-decoration: none; }}
                    .button, input[type="submit"] {{ background-color: #ff0000; color: #fff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px; text-align: center; border: none; cursor: pointer; font-size: 16px; }}
                    .price {{ background-color: #222; display: inline-block; padding: 10px 20px; border-radius: 5px; margin: 10px 0; font-weight: bold; font-size: 20px; }}
                    .pdf-preview {{ background-color: #333; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>SmartDispute.ai Document Analysis</h1>
                    <p>We've analyzed your document <strong>"{filename}"</strong> and identified the following:</p>
                    
                    <div class="analysis">
                        <h2>Case Type Detected:</h2>
                        <p><strong>{case_type}</strong></p>
                        
                        <div class="price">Price: ${price:.2f}</div>
                    </div>
                    
                    <div class="pdf-preview">
                        <h3>Preview Your Draft Letter</h3>
                        <p>We've generated a preview of your legal document based on our analysis.</p>
                        <a href="/preview/{filename}_preview.pdf" class="button" target="_blank">View PDF Preview</a>
                    </div>
                    
                    <form action="/pay" method="post" style="text-align: center;">
                        <input type="hidden" name="filename" value="{filename}">
                        <input type="hidden" name="price" value="{price}">
                        <input type="submit" value="Continue to Payment" class="button">
                    </form>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="/">Upload Another Document</a>
                    </div>
                </div>
            </body>
            </html>
            """
        except Exception as e:
            return f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Error - SmartDispute.ai</title>
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #000; color: #fff; text-align: center; padding: 50px; }}
                    h1 {{ color: #ff0000; }}
                    .container {{ background-color: #111; padding: 20px; border-radius: 10px; display: inline-block; }}
                    .error {{ background-color: #300; padding: 10px; border-radius: 5px; color: #faa; }}
                    a {{ color: #ff0000; text-decoration: none; }}
                    .button {{ background-color: #ff0000; color: #fff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Analysis Error</h1>
                    <p>Your file was uploaded successfully, but we encountered an error during processing:</p>
                    <div class="error">{str(e)}</div>
                    <a href="/" class="button">Try Again</a>
                </div>
            </body>
            </html>
            """, 500

    return 'Invalid file type', 400

@app.route('/preview/<path:filename>')
def preview_file(filename):
    """Serve the PDF preview file"""
    return send_file(os.path.join(app.config['PREVIEW_FOLDER'], filename), as_attachment=False)

@app.route('/pay', methods=['POST'])
def handle_payment():
    """Handle payment page for the document"""
    filename = request.form.get('filename')
    price = float(request.form.get('price', 0))
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Payment - SmartDispute.ai</title>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #000; color: #fff; text-align: center; padding: 20px; }}
            h1, h2 {{ color: #ff0000; }}
            .container {{ background-color: #111; padding: 20px; border-radius: 10px; max-width: 800px; margin: 0 auto; }}
            .payment-box {{ background-color: #222; padding: 20px; border-radius: 5px; margin: 20px 0; }}
            .price {{ font-size: 24px; font-weight: bold; margin: 20px 0; }}
            .payment-form {{ margin-top: 20px; }}
            input[type="text"], input[type="email"], select {{ padding: 10px; margin: 5px 0; width: 100%; border-radius: 5px; border: none; }}
            .button {{ background-color: #ff0000; color: #fff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px; text-align: center; border: none; cursor: pointer; font-size: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Complete Your Purchase</h1>
            <p>You're one step away from receiving your customized legal document.</p>
            
            <div class="payment-box">
                <h2>Order Summary</h2>
                <p>Document: <strong>{filename}</strong></p>
                <div class="price">Total: ${price:.2f}</div>
                
                <div class="payment-form">
                    <p>Payment Gateway Integration Coming Soon</p>
                    <p>For now, this is a demonstration of the payment flow.</p>
                    
                    <form action="/success" method="get">
                        <input type="hidden" name="filename" value="{filename}">
                        <input type="hidden" name="price" value="{price}">
                        <input type="submit" value="Simulate Payment" class="button">
                    </form>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

@app.route('/success')
def success():
    """Display success page after payment"""
    filename = request.args.get('filename', 'document.pdf')
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Payment Successful - SmartDispute.ai</title>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #000; color: #fff; text-align: center; padding: 20px; }}
            h1, h2 {{ color: #ff0000; }}
            .container {{ background-color: #111; padding: 20px; border-radius: 10px; max-width: 800px; margin: 0 auto; }}
            .success-box {{ background-color: #113311; padding: 20px; border-radius: 5px; margin: 20px 0; }}
            .button {{ background-color: #ff0000; color: #fff; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px; text-align: center; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Payment Successful!</h1>
            
            <div class="success-box">
                <h2>Thank You For Your Purchase</h2>
                <p>Your customized legal document has been generated and is ready for download.</p>
                
                <a href="/preview/{filename}_preview.pdf" class="button" target="_blank">Download Your Document</a>
                <a href="/" class="button">Back to Home</a>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)