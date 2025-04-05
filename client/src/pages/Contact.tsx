import React, { useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Helmet } from 'react-helmet';
import { trackEvent } from '@/lib/analytics';

export default function Contact() {
  useEffect(() => {
    // Track page view
    document.title = "Contact Us | SmartDispute.ai";
  }, []);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Push event to GTM dataLayer for form submission tracking
    trackEvent('form_submit', {
      event_category: 'engagement',
      form_name: 'contact_form',
      form_page: 'contact'
    });
    
    // Form will continue submitting to Formspree normally
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | SmartDispute.ai</title>
        <meta name="description" content="Have questions about our legal dispute services? Contact SmartDispute.ai today for assistance with document analysis, evidence management, and more." />
      </Helmet>

      <div className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our services? Need assistance with your legal dispute? 
              We're here to help you navigate the process.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <form 
              id="contact-form"
              action="mailto:smartdisputecanada@gmail.com"  
              method="POST"
              className="space-y-6"
              onSubmit={handleFormSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email address"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="What is this regarding?"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Please provide details about your inquiry..."
                  rows={6}
                  required
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                >
                  Send Message
                </Button>
              </div>

              {/* Hidden field for spam protection */}
              <input type="text" name="_gotcha" style={{ display: 'none' }} />
              
              {/* Redirect after submission */}
              <input type="hidden" name="_next" value="https://smartdispute.ai/thank-you" />
            </form>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">
                <a href="mailto:smartdisputecanada@gmail.com" className="text-primary hover:underline">
                  smartdisputecanada@gmail.com
                </a>
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Response Time</h3>
              <p className="text-gray-600">We aim to respond within 24-48 hours during business days</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600">Coming soon for immediate assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Script to track form submission with GTM */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('contact-form').addEventListener('submit', function() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'form_submit' });
          });
        `
      }} />
    </>
  );
}