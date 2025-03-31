import React from 'react';
import { HubSpotContactForm } from '@/components/marketing/HubSpotContactForm';
import { useHubSpotTracking } from '@/hooks/use-hubspot-tracking';

export default function Contact() {
  const { trackPageView } = useHubSpotTracking();
  
  // Track this page view with additional metadata
  React.useEffect(() => {
    trackPageView('/contact', 'Contact Us - SmartDispute.ai');
  }, [trackPageView]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Our Legal Team</h1>
          <p className="text-lg text-gray-600">
            Have questions about your legal rights in Canada? Our team of legal experts is here to help.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Get Expert Legal Advice</h2>
            <p className="text-gray-600 mb-4">
              Whether you're dealing with family law issues, housing problems, employment concerns, 
              or other legal matters, our team of Canadian legal experts can provide guidance 
              tailored to your province's laws and regulations.
            </p>
            
            <h3 className="text-lg font-medium mt-6 mb-2">Our Services Include:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>Document preparation assistance</li>
              <li>Guidance on legal procedures in your province</li>
              <li>Review of your case details</li>
              <li>Connections to local legal resources</li>
              <li>Help with self-representation</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-6 mb-2">Office Hours:</h3>
            <p className="text-gray-600">Monday - Friday: 9am - 5pm EST</p>
            <p className="text-gray-600">Weekend support available for urgent matters</p>
          </div>
          
          <div>
            <HubSpotContactForm 
              formTitle="Contact Our Legal Team" 
              formDescription="Fill out this form with details about your legal issue, and our team will respond within 24 hours."
              onSubmitSuccess={(data) => {
                console.log('Form submitted successfully', data);
              }}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Need Immediate Assistance?</h2>
          <p className="text-gray-600 mb-4">
            For urgent legal matters requiring immediate attention, please use our live chat option 
            or call our support line. Our team is available to provide guidance for time-sensitive legal issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any)._hsq) {
                  (window as any)._hsq.push(['chatbot:open']);
                }
              }}
              className="inline-flex items-center justify-center bg-secondary text-white px-5 py-2 rounded-md hover:bg-secondary/80"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Start Live Chat
            </button>
            <a 
              href="tel:+18001234567" 
              className="inline-flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}