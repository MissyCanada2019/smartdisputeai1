/**
 * Run the SmartDispute.ai Document Generator
 * 
 * This script starts the Flask-based document generation app and ensures
 * that the necessary environment variables are set.
 */

const { startFlaskApp } = require('./flask_email_integration.cjs');

// Check for required environment variables
const requiredEnvVars = [
  'EMAIL_PASSWORD', // Used for sending dispute letters
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET'
];

// Optional environment variables
const optionalEnvVars = [
  'EMAIL_USER',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
];

// Check required environment variables
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`Warning: Some required environment variables are missing: ${missingVars.join(', ')}`);
  console.warn('Some functionality may not work correctly.');
}

// Set up any defaults for missing optional variables
if (!process.env.EMAIL_HOST) {
  process.env.EMAIL_HOST = 'smtp.gmail.com';
}

if (!process.env.EMAIL_PORT) {
  process.env.EMAIL_PORT = '587';
}

// Set flag to enable email functionality if email credentials are available
if (process.env.EMAIL_PASSWORD && (process.env.EMAIL_USER || process.env.GMAIL_USER)) {
  process.env.EMAIL_ENABLED = 'true';
  console.log('Email functionality is enabled.');
} else {
  process.env.EMAIL_ENABLED = 'false';
  console.log('Email functionality is disabled. Set EMAIL_PASSWORD and EMAIL_USER to enable.');
}

// Start the Flask application
console.log('Starting SmartDispute.ai Document Generator...');
const flaskApp = startFlaskApp({
  port: process.env.PORT || 5000,
  debug: process.env.NODE_ENV !== 'production'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping SmartDispute.ai Document Generator...');
  flaskApp.kill();
  process.exit(0);
});

console.log(`
SmartDispute.ai Document Generator is running!
• Access the application at: http://localhost:${process.env.PORT || 5000}
• Select your province and dispute type to get started
• Generate customized legal dispute documents based on your needs
`);

// Extra information about available features
console.log('Available features:');
console.log('✓ Province-specific dispute letter generation');
console.log('✓ Custom templates for different dispute types');
console.log('✓ PDF document generation and download');
if (process.env.EMAIL_ENABLED === 'true') {
  console.log('✓ Email delivery of generated documents');
} else {
  console.log('✗ Email delivery (disabled - missing credentials)');
}

if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
  console.log('✓ AI-enhanced document analysis');
} else {
  console.log('✗ AI-enhanced analysis (disabled - missing API keys)');
}