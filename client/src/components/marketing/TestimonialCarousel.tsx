import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title?: string;
  avatarSrc?: string;
  rating?: number;
  category?: string;
  location?: string;
}

// Sample testimonials for legal advocacy
export const legalAdvocacyTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: "SmartDispute.ai helped me navigate a complex landlord dispute when I was facing wrongful eviction. The clear templates and guidance made a huge difference.",
    name: "Sarah T.",
    title: "Tenant",
    location: "Toronto, ON",
    rating: 5,
    category: "Landlord-Tenant"
  },
  {
    id: '2',
    quote: "When I couldn't afford a lawyer for my custody case, SmartDispute.ai provided me with the tools I needed to represent myself confidently.",
    name: "Michael K.",
    title: "Parent",
    location: "Vancouver, BC",
    rating: 5,
    category: "Family Law"
  },
  {
    id: '3',
    quote: "After being denied social assistance benefits, I used SmartDispute.ai to draft an appeal letter. Two weeks later, my benefits were approved. This service is life-changing.",
    name: "Jessica M.",
    title: "Community Advocate",
    location: "Montreal, QC",
    rating: 5,
    category: "Social Services"
  },
  {
    id: '4',
    quote: "As an Indigenous woman fighting for fair housing, I felt the system was stacked against me. SmartDispute.ai helped me document discrimination and file a successful complaint.",
    name: "Diane R.",
    title: "Housing Rights Advocate",
    location: "Winnipeg, MB",
    rating: 5,
    category: "Housing Rights"
  },
  {
    id: '5',
    quote: "The credit dispute templates helped me fix errors on my credit report that were preventing me from getting approved for apartment rentals. Thank you!",
    name: "Robert L.",
    title: "Financial Recovery",
    location: "Halifax, NS",
    rating: 5,
    category: "Credit Disputes"
  }
];

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  cardClassName?: string;
  testimonialCategory?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = false,
  showIndicators = false,
  className = '',
  cardClassName = '',
  testimonialCategory
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseAutoPlay, setPauseAutoPlay] = useState(false);
  
  // Filter testimonials by category if specified
  const filteredTestimonials = testimonialCategory 
    ? testimonials.filter(t => t.category === testimonialCategory)
    : testimonials;
    
  // Use filtered testimonials if available, otherwise use all
  const displayTestimonials = filteredTestimonials.length > 0 
    ? filteredTestimonials 
    : testimonials;
  
  const nextSlide = useCallback(() => {
    setActiveIndex((current) => 
      current === displayTestimonials.length - 1 ? 0 : current + 1
    );
  }, [displayTestimonials.length]);
  
  const prevSlide = useCallback(() => {
    setActiveIndex((current) => 
      current === 0 ? displayTestimonials.length - 1 : current - 1
    );
  }, [displayTestimonials.length]);
  
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };
  
  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || pauseAutoPlay || displayTestimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide, pauseAutoPlay, displayTestimonials.length]);
  
  // Pause auto-play on mouse enter, resume on mouse leave
  const handleMouseEnter = () => setPauseAutoPlay(true);
  const handleMouseLeave = () => setPauseAutoPlay(false);
  
  if (displayTestimonials.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex transition-transform duration-500 ease-in-out" 
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {displayTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="w-full flex-shrink-0">
            <TestimonialCard 
              testimonial={testimonial} 
              className={cardClassName}
            />
          </div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      {showControls && displayTestimonials.length > 1 && (
        <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-4">
          <button 
            onClick={prevSlide}
            className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md text-gray-800"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextSlide}
            className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md text-gray-800"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Indicators */}
      {showIndicators && displayTestimonials.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0">
          <div className="flex justify-center gap-2">
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const { quote, name, title, avatarSrc, rating, location } = testimonial;
  
  return (
    <Card className={cn("mx-auto max-w-3xl", className)}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {/* Avatar or default initial */}
          <div className="flex-shrink-0 mr-4">
            {avatarSrc ? (
              <img 
                src={avatarSrc} 
                alt={name} 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Name, title, location */}
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            {title && <p className="text-gray-600 text-sm">{title}</p>}
            {location && <p className="text-gray-500 text-xs">{location}</p>}
          </div>
          
          {/* Rating stars if available */}
          {rating && (
            <div className="ml-auto flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Quote */}
        <blockquote className="mt-4 text-gray-700 italic leading-relaxed">
          "{quote}"
        </blockquote>
      </CardContent>
    </Card>
  );
}