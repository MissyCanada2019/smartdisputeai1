import React from 'react';
import { Link } from 'wouter';

type StickyCtaProps = {
  buttonText?: string;
  buttonLink?: string;
};

export default function StickyCta({ 
  buttonText = "Contact Us Now", 
  buttonLink = "/contact" 
}: StickyCtaProps) {
  // Function to track CTA click with dataLayer for GTM
  const trackCtaClick = () => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'cta_click',
        'cta_text': buttonText,
        'cta_location': 'sticky_footer'
      });
    }
  };

  return (
    <div className="sticky-cta fixed bottom-0 left-0 w-full bg-primary py-3 px-4 shadow-lg z-50 flex justify-center items-center">
      <Link href={buttonLink}>
        <a 
          id="cta-primary" 
          className="cta-button inline-block bg-white text-primary hover:bg-gray-100 font-bold py-2 px-6 rounded-full text-center shadow-md transition-all"
          onClick={trackCtaClick}
        >
          {buttonText}
        </a>
      </Link>
    </div>
  );
}