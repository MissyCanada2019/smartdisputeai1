"""
SmartDispute.ai Document Upload Handler with Payment Integration
A Flask application that handles document uploads, AI analysis, and payment processing
"""
from flask import Flask, request, render_template, redirect, url_for, send_file, jsonify
import os
import json
import stripe
from werkzeug.utils import secure_filename
from ai_handler import extract_text_from_file, analyze_text_with_ai
from pricing_and_pdf import determine_price_and_type, generate_pdf_preview

# Initialize app
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "pk_test_yourkeyhere")
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "Ae4aYzkf6oRX1GtudHIm9UVWx-U55zBh92pgQKVWnvgel5MvWAW3FYh6nEQ5y-_wcpRCjs5omR4AXyZV")

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
                    
                    <form action="/payment" method="post" style="text-align: center;">
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

@app.route('/payment', methods=['POST'])
def payment_page():
    """Display payment options page"""
    filename = request.form.get('filename')
    price = float(request.form.get('price', 0))
    
    return render_template('payment_choice.html', 
                           filename=filename, 
                           price=price,
                           stripe_public_key=STRIPE_PUBLIC_KEY,
                           paypal_client_id=PAYPAL_CLIENT_ID)

@app.route('/create-stripe-session', methods=['POST'])
def create_stripe_session():
    """Create a Stripe checkout session"""
    data = request.get_json()
    price_cents = int(data.get('price', 0))
    filename = data.get('filename', 'document.pdf')
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'cad',
                    'product_data': {
                        'name': 'SmartDispute.ai Legal Document',
                    },
                    'unit_amount': price_cents,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.host_url + f'download?file={filename}_preview.pdf',
            cancel_url=request.host_url + 'payment',
        )
        return jsonify(sessionId=session.id)
    except Exception as e:
        return jsonify(error=str(e)), 403

@app.route('/record-paypal-payment', methods=['POST'])
def record_paypal_payment():
    """Record a successful PayPal payment"""
    data = request.get_json()
    order_id = data.get('orderId')
    filename = data.get('filename')
    
    # In a real app, verify the payment with PayPal API
    # For now, we'll just return success
    return jsonify(success=True)

@app.route('/download')
def download_final_pdf():
    """Download the purchased document"""
    file = request.args.get('file')
    if not file:
        return "No file specified", 400
        
    file_path = os.path.join(app.config['PREVIEW_FOLDER'], file)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return "File not found", 404

@app.route('/success')
def success_page():
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
                
                <a href="/download?file={filename}_preview.pdf" class="button" target="_blank">Download Your Document</a>
                <a href="/" class="button">Back to Home</a>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
    import os
from flask import Flask, request, render_template, session, redirect, url_for, send_file
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from pricing_and_pdf import generate_pdf_preview
from ocr_parser import run_ocr_pipeline

# Load environment variables
load_dotenv()

# Config
UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}

# App setup
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super_secret_fallback_key")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Create folders if missing
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# === ROUTES ===

@app.route('/')
def index():
    return render_template("form.html")

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'document' not in request.files:
        return "No file part", 400

    file = request.files['document']
    if file.filename == '':
        return "No selected file", 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # OCR + AI
        result = run_ocr_pipeline(filepath)

        # Generate preview PDF
        preview_filename = f"{filename}_preview.pdf"
        preview_path = os.path.join(app.config['PREVIEW_FOLDER'], preview_filename)
        generate_pdf_preview(result, output_path=preview_path)

        # Save preview filename to session
        session['preview_file'] = preview_filename

        # Go to payment page
        return render_template("payment.html", price=5.99, filename=preview_filename)

    return "Invalid file type", 400

@app.route('/download')
def download_preview():
    filename = session.get('preview_file')
    if not filename:
        return "Unauthorized or session expired", 403

    file_path = os.path.join(app.config['PREVIEW_FOLDER'], filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return "File not found", 404

@app.route('/paypal-success')
def paypal_success():
    # After PayPal confirms payment, user lands here
    return redirect(url_for('download_preview'))

# === RUN SERVER ===
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))        
