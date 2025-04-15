import React from 'react';
import { useLocation } from 'wouter';
import { trackCtaClick } from '@/lib/analytics';

type StickyCtaProps = {
  buttonText?: string;
  buttonLink?: string;
};

export default function StickyCta({ 
  buttonText = "Contact Us Now", 
  buttonLink = "/contact" 
}: StickyCtaProps) {
  const [, setLocation] = useLocation();
  
  // Function to track CTA click using our analytics library
  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Track the CTA click using our unified analytics function
    trackCtaClick(buttonText, 'sticky_footer', buttonLink);
    
    // Navigate after tracking is complete
    setLocation(buttonLink);
  };

  return (
    <div className="sticky-cta fixed bottom-0 left-0 w-full bg-primary py-3 px-4 shadow-lg z-50 flex justify-center items-center">
      <button 
        id="cta-primary" 
        className="cta-button inline-block bg-white text-primary hover:bg-gray-100 font-bold py-2 px-6 rounded-full text-center shadow-md transition-all"
        onClick={handleCtaClick}
        data-tracking="cta-click"
        aria-label={buttonText}
      >
        {buttonText}
      </button>
    </div>
  );
}