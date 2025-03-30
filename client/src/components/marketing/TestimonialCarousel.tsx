import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface Testimonial {
  id: string;
  name: string;
  title?: string;
  location?: string;
  avatarUrl?: string;
  quote: string;
  avatarFallback?: string;
  stars?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  className = '',
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle moving to next slide
  const next = useCallback(() => {
    setActiveIndex((current) => 
      current === testimonials.length - 1 ? 0 : current + 1
    );
  }, [testimonials.length]);
  
  // Handle moving to previous slide
  const prev = useCallback(() => {
    setActiveIndex((current) => 
      current === 0 ? testimonials.length - 1 : current - 1
    );
  }, [testimonials.length]);
  
  // Handle moving to a specific slide
  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [next, prev]);
  
  // Handle auto-play
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    
    const play = () => {
      autoPlayRef.current = setTimeout(() => {
        next();
      }, interval);
    };
    
    play();
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, interval, next, isPaused, activeIndex]);
  
  // If there are no testimonials, don't render anything
  if (!testimonials.length) return null;
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        {testimonials.map((testimonial, index) => (
          <div 
            key={testimonial.id || index}
            className={`transition-opacity duration-500 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
            }`}
          >
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                {testimonial.stars && (
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.stars! 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <blockquote className="text-lg mb-6 italic text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    {testimonial.avatarUrl && (
                      <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                    )}
                    <AvatarFallback>
                      {testimonial.avatarFallback || testimonial.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    {(testimonial.title || testimonial.location) && (
                      <div className="text-sm text-muted-foreground">
                        {testimonial.title}
                        {testimonial.title && testimonial.location && ', '}
                        {testimonial.location}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {showControls && testimonials.length > 1 && (
        <div className="flex justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 -ml-4 bg-background/80 shadow-sm hover:bg-background"
            onClick={prev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 -mr-4 bg-background/80 shadow-sm hover:bg-background"
            onClick={next}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {showIndicators && testimonials.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sample testimonials for Children's Aid Society section
export const childrenAidTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah M.",
    location: "Ontario",
    quote: "Using the templates from SmartDispute.ai helped me effectively respond to the Children's Aid Society. The clear formatting and professional language made a huge difference in how my case was handled.",
    avatarFallback: "SM",
    stars: 5
  },
  {
    id: "2",
    name: "Mark T.",
    title: "Father of three",
    location: "Alberta",
    quote: "When CAS arrived at my door, I was terrified. This platform guided me through every step of the documentation process and helped me understand my rights. My family is still together thanks to these resources.",
    avatarFallback: "MT",
    stars: 5
  },
  {
    id: "3",
    name: "Anita K.",
    location: "British Columbia",
    quote: "The affordable document templates saved me thousands in legal fees. The guidance provided was almost as good as having a lawyer, and I was able to successfully challenge unsubstantiated claims.",
    avatarFallback: "AK",
    stars: 4
  }
];

// Sample testimonials for Landlord-Tenant section
export const landlordTenantTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Jamal H.",
    location: "Toronto",
    quote: "My landlord tried to evict me with just two weeks' notice. Using SmartDispute.ai, I filed the correct documents with the Landlord and Tenant Board and won my case to stay in my home.",
    avatarFallback: "JH",
    stars: 5
  },
  {
    id: "2",
    name: "Kim L.",
    title: "Tenant",
    location: "Vancouver",
    quote: "After months of dealing with a serious repair issue, I used the Maintenance and Repairs documents from this platform. Within two weeks, my landlord finally fixed the problems I'd been reporting for months.",
    avatarFallback: "KL",
    stars: 5
  },
  {
    id: "3",
    name: "Devon P.",
    location: "Montreal",
    quote: "As someone on a limited income, I couldn't afford a lawyer when my rent was illegally increased. The templates and guidance here helped me successfully challenge the increase and save hundreds each month.",
    avatarFallback: "DP",
    stars: 4
  }
];

// Sample testimonials for legal advocacy section
export const legalAdvocacyTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya S.",
    title: "Self-Represented Litigant",
    quote: "The step-by-step guidance made navigating the legal system possible for me. I went from feeling completely overwhelmed to confident in representing myself.",
    avatarFallback: "PS",
    stars: 5
  },
  {
    id: "2",
    name: "Michael J.",
    location: "Nova Scotia",
    quote: "As a person with a disability on a fixed income, I couldn't afford traditional legal help. This platform made justice accessible to me at a price I could actually afford.",
    avatarFallback: "MJ",
    stars: 5
  },
  {
    id: "3",
    name: "Teresa C.",
    title: "Indigenous Rights Advocate",
    location: "Saskatchewan",
    quote: "The platform's focus on self-advocacy resonated with my community's needs. The templates helped us address systemic issues while respecting our cultural approaches to conflict resolution.",
    avatarFallback: "TC",
    stars: 5
  }
];