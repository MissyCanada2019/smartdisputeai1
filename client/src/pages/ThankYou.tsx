import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { trackEvent } from '@/lib/analytics';

export default function ThankYou() {
  useEffect(() => {
    // Track thank you page view as a conversion
    document.title = "Thank You | SmartDispute.ai";
    
    // Track form submission completion event
    trackEvent('form_submission_complete', {
      event_category: 'conversion',
      form_name: 'contact_form',
      conversion: true
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Thank You | SmartDispute.ai</title>
        <meta name="description" content="Thank you for contacting SmartDispute.ai. We've received your message and will be in touch soon." />
        <meta name="robots" content="noindex, nofollow" /> {/* Don't index thank you page */}
      </Helmet>

      <div className="bg-gray-50 flex flex-col items-center justify-center py-16 md:py-24 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="text-green-600 mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We've received your message and will get back to you as soon as possible, 
            usually within 24-48 hours during business days.
          </p>
          
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-xl font-semibold mb-4">While you wait...</h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                You might be interested in exploring these resources:
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link href="/resources">
                  <Button variant="outline" className="w-full md:w-auto">
                    Browse Resources
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="w-full md:w-auto">
                    Our Services
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" className="w-full md:w-auto">
                    FAQ
                  </Button>
                </Link>
              </div>
            </div>
            
            <Link href="/">
              <Button className="mt-2 w-full md:w-auto">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}