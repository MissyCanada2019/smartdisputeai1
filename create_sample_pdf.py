"""
Create a sample PDF document for the payment success page demo
"""
import os
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch

def create_sample_letter():
    """Create a sample dispute letter PDF for demonstration purposes"""
    
    # Create the directory if it doesn't exist
    os.makedirs("static/samples", exist_ok=True)
    
    # Set up the document
    doc = SimpleDocTemplate(
        "static/samples/sample_letter.pdf",
        pagesize=LETTER,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='Justify',
        alignment=4,  # 4 is for justify
        fontName='Helvetica',
        fontSize=11,
        leading=14
    ))
    
    # Content elements
    elements = []
    
    # Header with sender information
    header_data = [
        ["Jane Smith", ""],
        ["123 Main Street", "Date: April 8, 2025"],
        ["Toronto, ON M5V 2H1", ""],
        ["Phone: (555) 123-4567", ""],
        ["Email: jane.smith@example.com", ""]
    ]
    
    header_table = Table(header_data, colWidths=[3*inch, 2.5*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Recipient information
    recipient_text = """<b>ABC Property Management</b><br/>
    456 Business Ave<br/>
    Toronto, ON M4B 1B3<br/>"""
    elements.append(Paragraph(recipient_text, styles["Normal"]))
    elements.append(Spacer(1, 0.3*inch))
    
    # Subject line
    subject = "<b>Subject: Notice Regarding Maintenance Issues at 123 Main Street, Apt 4B</b>"
    elements.append(Paragraph(subject, styles["Normal"]))
    elements.append(Spacer(1, 0.2*inch))
    
    # Salutation
    elements.append(Paragraph("Dear Property Manager:", styles["Normal"]))
    elements.append(Spacer(1, 0.1*inch))
    
    # Body paragraphs
    body_text = """
    I am writing to formally request repairs for several maintenance issues in my rental unit at 123 Main Street, Apt 4B. These issues have persisted despite my verbal notifications on March 15 and March 30, 2025.
    <br/><br/>
    According to the <i>Residential Tenancies Act, 2006, S.O. 2006, c. 17</i>, specifically Section 20(1), landlords are required to maintain rental units in a good state of repair and fit for habitation. The following issues require immediate attention:
    <br/><br/>
    1. Water leak under the kitchen sink causing damage to the cabinet and creating mold<br/>
    2. Non-functioning heating vent in the master bedroom<br/>
    3. Bathroom ceiling damage from upstairs water leak<br/>
    <br/>
    These issues impact the habitability of my unit and may pose health risks due to potential mold growth. I am requesting that these repairs be completed within 14 days of receipt of this letter, which is a reasonable timeframe as established by precedent cases such as <i>Smith v. Johnson Property Management, LTB-23456-19</i>.
    <br/><br/>
    If these repairs are not addressed within the specified timeframe, I will be forced to exercise my rights under the <i>Residential Tenancies Act</i>, which may include filing an application with the Landlord and Tenant Board and/or withholding rent as permitted by Section 29(1) of the Act.
    <br/><br/>
    Please contact me at your earliest convenience to schedule a time for inspection and repairs. I am available weekdays after 5:00 PM and all day on weekends.
    """
    elements.append(Paragraph(body_text, styles["Justify"]))
    elements.append(Spacer(1, 0.2*inch))
    
    # Closing
    closing_text = """Sincerely,<br/><br/><br/><br/>
    Jane Smith<br/>
    Tenant
    """
    elements.append(Paragraph(closing_text, styles["Normal"]))
    
    # Footer disclaimer
    elements.append(Spacer(1, 0.5*inch))
    disclaimer = """<font size="8">This letter was generated with the assistance of SmartDispute.ai - AI-powered legal assistance platform for Canadians. This document is not a substitute for professional legal advice.</font>"""
    elements.append(Paragraph(disclaimer, styles["Normal"]))
    
    # Build the document
    doc.build(elements)
    
    print(f"Sample letter created at: static/samples/sample_letter.pdf")

if __name__ == "__main__":
    create_sample_letter()