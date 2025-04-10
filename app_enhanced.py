"""
SmartDispute.ai Enhanced Document Analysis Application
A Flask application that handles document uploads, multi-model AI analysis, and payment processing
"""
from flask import Flask, request, render_template, redirect, url_for, send_file, jsonify, session
import os
import json
import stripe
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import logging
from fpdf import FPDF

# Import our enhanced document analyzer
from enhanced_document_analyzer import extract_content, analyze_document, generate_response_preview, is_mock_mode, initialize_clients

# Import our updated AI handler for better error handling
import ai_handler

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Check for API keys and enable mock mode if none exist
if not os.getenv('OPENAI_API_KEY') and not os.getenv('ANTHROPIC_API_KEY'):
    logger.warning("No API keys found. Setting MOCK_MODE to true.")
    os.environ['MOCK_MODE'] = 'true'
else:
    # Initialize AI clients
    initialize_clients()

# Initialize app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "smartdispute_dev_key")

# Configuration
UPLOAD_FOLDER = 'uploads'
PREVIEW_FOLDER = 'previews'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PREVIEW_FOLDER'] = PREVIEW_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY")
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_pdf_preview(analysis, output_path="draft_preview.pdf"):
    """
    Generate a PDF preview of the legal document based on the AI analysis
    
    Args:
        analysis (dict): Analysis results from the AI
        output_path (str): Path to save the PDF preview
        
    Returns:
        str: Path to the generated PDF
    """
    try:
        # Extract information for the preview
        issue_type = analysis.get('issue_type', 'Unknown Issue Type')
        classification = analysis.get('classification', 'Unknown Classification')
        recommended_forms = analysis.get('recommended_forms', 'No forms recommended')
        legal_references = analysis.get('legal_references', 'No legal references available')
        response_strategy = analysis.get('response_strategy', 'No strategy recommended')
        model_used = analysis.get('model_used', 'AI')
        confidence = analysis.get('confidence', 0)
        confidence_percentage = f"{int(confidence * 100)}%" if confidence else "N/A"
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        
        # Add SmartDispute.ai header
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "SmartDispute.ai Document Preview", 0, 1, 'C')
        pdf.set_font("Arial", 'I', 10)
        pdf.cell(0, 5, f"Analysis by {model_used.upper()} | Confidence: {confidence_percentage}", 0, 1, 'C')
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Add document information
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Document Analysis Summary", 0, 1)
        
        pdf.set_font("Arial", '', 10)
        pdf.cell(0, 10, f"Issue Type: {issue_type}", 0, 1)
        pdf.cell(0, 10, f"Classification: {classification}", 0, 1)
        pdf.ln(5)
        
        # Add legal references
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Legal References & Forms", 0, 1)
        
        pdf.set_font("Arial", '', 10)
        pdf.multi_cell(0, 10, f"Recommended Forms: {recommended_forms}")
        pdf.multi_cell(0, 10, f"Legal References: {legal_references}")
        pdf.ln(5)
        
        # Add response strategy
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Recommended Response Strategy", 0, 1)
        
        pdf.set_font("Arial", '', 10)
        pdf.multi_cell(0, 10, response_strategy)
        
        # Add purchase note
        pdf.ln(10)
        pdf.set_font("Arial", 'I', 8)
        pdf.set_text_color(100, 100, 100)
        pdf.multi_cell(0, 10, "This is a preview. Purchase the full document to receive a customized legal response drafted specifically for your situation.")
        
        # Output the PDF
        pdf.output(output_path)
        return output_path
        
    except Exception as e:
        logger.error(f"Error generating PDF preview: {e}")
        
        # Create a simple error PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Error Generating Preview", 0, 1, 'C')
        pdf.set_font("Arial", '', 12)
        pdf.multi_cell(0, 10, f"An error occurred: {e}")
        pdf.multi_cell(0, 10, "Please try again or contact support.")
        pdf.output(output_path)
        return output_path

@app.route('/')
def index():
    """Display the document upload form"""
    # Pass the mock mode status to the template
    mock_mode = os.environ.get('MOCK_MODE', 'false')
    return render_template('upload_form_enhanced.html', mock_mode=mock_mode)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle document upload and analysis"""
    if 'document' not in request.files:
        return 'No file part', 400
        
    file = request.files['document']
    if file.filename == '':
        return 'No selected file', 400
        
    if file and allowed_file(file.filename):
        # Get user selection for AI model
        ai_model = request.form.get('ai_model', 'openai').lower()
        province = request.form.get('province', 'ON')
        
        # Store selections in session for later use
        session['ai_model'] = ai_model
        session['province'] = province
        
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        session['filename'] = filename
        
        try:
            # Extract content from the document using the selected model
            extracted_text = extract_content(filepath, model=ai_model)
            session['extracted_text'] = extracted_text
            
            # Analyze the document content
            analysis_result = analyze_document(extracted_text, province=province, model=ai_model)
            session['analysis'] = analysis_result
            
            # Generate PDF preview
            preview_path = os.path.join(app.config['PREVIEW_FOLDER'], f"{filename}_preview.pdf")
            generate_pdf_preview(analysis_result, output_path=preview_path)
            
            # Get price from analysis
            price = analysis_result.get('price', 14.99)
            issue_type = analysis_result.get('issue_type', 'Legal Document')
            classification = analysis_result.get('classification', 'General')
            
            # Redirect to analysis results page
            return redirect(url_for('analysis_results', price=price))
            
        except Exception as e:
            logger.error(f"Error during document analysis: {e}")
            return render_template('error.html', error=str(e))
            
    return 'Invalid file type', 400

@app.route('/analysis-results')
def analysis_results():
    """Display analysis results and payment options"""
    # Get data from session
    analysis = session.get('analysis', {})
    filename = session.get('filename', 'document.pdf')
    price = request.args.get('price', analysis.get('price', 14.99))
    
    # If price is a string, convert to float
    if isinstance(price, str):
        price = float(price)
    
    issue_type = analysis.get('issue_type', 'Legal Document')
    classification = analysis.get('classification', 'General')
    confidence = analysis.get('confidence', 0)
    model_used = analysis.get('model_used', 'AI')
    
    return render_template(
        'analysis_results.html',
        filename=filename,
        price=price,
        issue_type=issue_type,
        classification=classification,
        confidence=confidence,
        model_used=model_used
    )

@app.route('/preview/<path:filename>')
def preview_file(filename):
    """Serve the PDF preview file"""
    return send_file(os.path.join(app.config['PREVIEW_FOLDER'], filename), as_attachment=False)

@app.route('/payment', methods=['POST'])
def payment_page():
    """Display payment options page"""
    filename = request.form.get('filename', session.get('filename'))
    price = float(request.form.get('price', 14.99))
    
    return render_template(
        'payment_choice.html', 
        filename=filename, 
        price=price,
        stripe_public_key=STRIPE_PUBLIC_KEY,
        paypal_client_id=PAYPAL_CLIENT_ID
    )

@app.route('/create-stripe-session', methods=['POST'])
def create_stripe_session():
    """Create a Stripe checkout session"""
    data = request.get_json()
    price_cents = int(float(data.get('price', 0)) * 100)  # Convert to cents
    filename = data.get('filename', session.get('filename', 'document.pdf'))
    
    try:
        checkout_session = stripe.checkout.Session.create(
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
            success_url=request.host_url + f'success?filename={filename}',
            cancel_url=request.host_url + 'payment',
        )
        return jsonify(id=checkout_session.id)
    except Exception as e:
        logger.error(f"Error creating Stripe session: {e}")
        return jsonify(error=str(e)), 403

@app.route('/record-paypal-payment', methods=['POST'])
def record_paypal_payment():
    """Record a successful PayPal payment"""
    data = request.get_json()
    order_id = data.get('orderId')
    filename = data.get('filename', session.get('filename'))
    
    # In a real app, you would verify the payment with PayPal API
    # For now, we'll just return success
    logger.info(f"PayPal payment recorded: Order {order_id} for file {filename}")
    return jsonify(success=True)

@app.route('/generate-full-document', methods=['POST'])
def generate_full_document():
    """Generate the full document after payment"""
    # Get data from session
    analysis = session.get('analysis', {})
    extracted_text = session.get('extracted_text', '')
    filename = session.get('filename', 'document.pdf')
    ai_model = session.get('ai_model', 'openai')
    
    # Get optional user information
    user_info = {
        'name': request.form.get('name', ''),
        'address': request.form.get('address', ''),
        'details': request.form.get('details', '')
    }
    
    try:
        # Generate the full response document
        response_html = generate_response_preview(analysis, extracted_text, user_info, model=ai_model)
        
        # Store the HTML response in session for the success page
        session['response_html'] = response_html
        
        # In a real app, we would generate a PDF from the HTML here
        # For now, we'll just redirect to the success page
        return redirect(url_for('success_page', filename=filename))
        
    except Exception as e:
        logger.error(f"Error generating full document: {e}")
        return render_template('error.html', error=str(e))

@app.route('/success')
def success_page():
    """Display success page after payment"""
    filename = request.args.get('filename', session.get('filename', 'document.pdf'))
    response_html = session.get('response_html', '<p>Document generated successfully.</p>')
    
    return render_template(
        'success_with_upsell.html',
        filename=filename,
        response_html=response_html
    )

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)