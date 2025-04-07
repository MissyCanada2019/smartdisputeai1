# SmartDispute.ai Dispute Letter Email Sender

This module provides functionality for generating and sending legal dispute letters via email, with specific support for Gmail's SMTP service using App Passwords.

## Files Available

1. **`send_dispute_gmail.js`** - CommonJS module that generates PDFs and sends them via Gmail
2. **`test-gmail-sender.js`** - Test script for the Gmail module
3. **`send_dispute_letter.cjs`** - Enhanced version with more formatting options
4. **`test-dispute-letter.cjs`** - Test for the enhanced version
5. **`send_email_gmail.js`** - ES Module version for use with modern JavaScript

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Gmail Dispute Letter Sender (specific to dispute module)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your-gmail-app-password
```

### 2. Gmail App Password

To create a Gmail App Password:
1. Go to your Google Account > Security
2. Enable 2-Step Verification if not already enabled
3. Under "App passwords", create a new app password
4. Use the 16-character password generated there as your `GMAIL_APP_PASS`

### 3. Required Packages

Make sure to install the required packages:

```
npm install nodemailer dotenv pdfkit
```

## Usage Examples

### Basic Usage

```javascript
// CommonJS
const sendDisputeLetter = require('./send_dispute_gmail');

// Send using dynamically generated PDF
sendDisputeLetter(
  'client@example.com',
  'Client Name',
  null,  // No existing PDF, will generate one
  'This is the dispute text that will be formatted into a PDF.'
)
.then(result => {
  if (result.success) {
    console.log('Email sent successfully!');
  } else {
    console.error('Failed to send email:', result.error);
  }
})
.catch(error => {
  console.error('Exception occurred:', error);
});

// Send using existing PDF
sendDisputeLetter(
  'client@example.com',
  'Client Name',
  './path/to/existing.pdf'  // Use existing PDF
)
.then(result => {
  console.log('Email sent successfully!');
})
.catch(error => {
  console.error('Error:', error);
});
```

### ES Module Version

```javascript
// ES Module
import sendDisputeLetter from './send_email_gmail.js';

// Similar usage as above but with import syntax
sendDisputeLetter(
  'client@example.com',
  'Client Name',
  null,
  'This is the dispute text that will be formatted.'
);
```

## Testing

You can run the test scripts to verify everything works:

```
node test-gmail-sender.js client@example.com "Client Full Name"
```

## PDF Format

The generated PDFs will include:
- Current date
- Proper letter formatting
- Client name and dispute text
- Space for signature
- SmartDispute.ai footer

## Customization

You can customize the email template by modifying the HTML in the `mailOptions` object within the `sendDisputeLetter` function.

## Troubleshooting

1. **Authentication Errors**: Make sure you're using an App Password, not your regular Gmail password
2. **Email Not Received**: Check spam folders and verify the recipient email address
3. **PDF Generation Errors**: Ensure `pdfkit` is installed properly

## Integration

This module can be used independently or integrated with the main SmartDispute.ai application to provide email functionality for dispute letter delivery.