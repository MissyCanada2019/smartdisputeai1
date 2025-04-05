import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { trackConversion } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function ThankYou() {
  // Track page view as a conversion event
  useEffect(() => {
    // Track this page view as a conversion
    trackConversion('form_submission_complete', 1, {
      form_name: 'contact_form',
      form_location: 'contact_page'
    });
    
    // Push directly to dataLayer for GTM
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'form_submit',
        'form_name': 'contact_form'
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Thank You | SmartDispute.ai</title>
        <meta name="description" content="Thank you for contacting SmartDispute.ai. We've received your message and will get back to you shortly." />
      </Helmet>

      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your message has been successfully sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We appreciate you taking the time to get in touch with us. Our team will review your message and get back to you as soon as possible, typically within 1-2 business days.
            </p>
            <p className="text-gray-700">
              In the meantime, feel free to explore our resources or check out our services for more information on how we can help you.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/resources">
                View Resources
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}