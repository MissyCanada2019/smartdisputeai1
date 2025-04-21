"""
Pricing and PDF Generation Module for SmartDispute.ai
"""
import re
import json
from fpdf import FPDF

def determine_price_and_type(ai_analysis):
    """
    Determine document type and pricing based on AI analysis
    
    Args:
        ai_analysis (str): JSON string with AI analysis results
        
    Returns:
        tuple: (case_type, price)
    """
    try:
        # Parse the JSON analysis
        analysis = json.loads(ai_analysis)
        
        # Get information from the analysis
        issue_type = analysis.get('issue_type', '').lower()
        classification = analysis.get('classification', '').lower()
        complexity = analysis.get('complexity', '').lower()
        
        # Determine document type and price based on analysis
        if 'housing' in issue_type or 'tenant' in issue_type or 'landlord' in issue_type:
            if 't2' in classification or 'reasonable enjoyment' in classification or 'interference' in classification:
                case_type = "T2 - Interference with Enjoyment"
                price = 9.99
            elif 't6' in classification or 'maintenance' in classification or 'repair' in classification:
                case_type = "T6 - Maintenance or Repairs"
                price = 14.99
            else:
                case_type = "General Housing Dispute"
                price = 12.99
                
        elif 'credit' in issue_type or 'financial' in issue_type or 'debt' in issue_type:
            case_type = "Credit Dispute"
            price = 19.99
            
        elif 'cas' in issue_type or 'child' in issue_type or 'protection' in issue_type:
            case_type = "CAS Response Letter"
            price = 24.99
            
        elif 'cease' in issue_type or 'desist' in issue_type:
            case_type = "Cease and Desist Letter"
            price = 29.99
            
        else:
            case_type = "General Legal Draft"
            price = 12.99
        
        # Adjust price based on complexity
        if 'premium' in complexity:
            price += 10.00
        elif 'urgent' in complexity:
            price += 20.00
            
        return case_type, price
        
    except Exception as e:
        print(f"Error determining price and type: {e}")
        return "General Legal Document", 12.99


def generate_pdf_preview(analysis_json, output_path="draft_preview.pdf"):
    """
    Generate a PDF preview of the legal document based on the AI analysis
    
    Args:
        analysis_json (str): JSON string with AI analysis results
        output_path (str): Path to save the PDF preview
        
    Returns:
        str: Path to the generated PDF
    """
    try:
        # Parse the JSON analysis
        analysis = json.loads(analysis_json)
        
        # Extract information for the preview
        issue_type = analysis.get('issue_type', 'Unknown Issue Type')
        classification = analysis.get('classification', 'Unknown Classification')
        recommended_forms = analysis.get('recommended_forms', 'No forms recommended')
        legal_references = analysis.get('legal_references', 'No legal references available')
        response_strategy = analysis.get('response_strategy', 'No strategy recommended')
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        
        # Add SmartDispute.ai header
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "SmartDispute.ai Document Preview", 0, 1, 'C')
        pdf.line(10, 20, 200, 20)
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
        print(f"Error generating PDF preview: {e}")
        
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
        from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf_preview(data, output_path="output.pdf"):
    c = canvas.Canvas(output_path, pagesize=letter)
    text = c.beginText(40, 750)
    text.setFont("Helvetica", 12)

    text.textLine("SmartDispute.ai Legal Document Analysis")
    text.textLine("-" * 50)
    text.textLine(f"Document Type: {data['fields']['document_type']}")
    text.textLine(f"Date Found: {data['fields']['date']}")
    text.textLine(f"Tenant Name: {data['fields']['tenant_name']}")
    text.textLine(f"Landlord Name: {data['fields']['landlord_name']}")
    text.textLine("")

    text.textLine("Identified Issues:")
    for issue in data['fields']['issues']:
        text.textLine(f"- {issue['issue_type']}: {issue['description']}")

    c.drawText(text)
    c.showPage()
    c.save()
