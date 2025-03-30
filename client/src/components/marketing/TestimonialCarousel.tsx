import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Quote,
  Star
} from 'lucide-react';

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

  const handleNext = useCallback(() => {
    setActiveIndex((current) => 
      current === testimonials.length - 1 ? 0 : current + 1
    );
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((current) => 
      current === 0 ? testimonials.length - 1 : current - 1
    );
  }, [testimonials.length]);

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
  };

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, handleNext, interval, isPaused, testimonials.length]);

  // Early return if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Current testimonial to display
  const currentTestimonial = testimonials[activeIndex];

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-primary">
              <Quote size={36} />
            </div>
            
            <blockquote className="mb-8 text-lg italic leading-relaxed text-muted-foreground">
              "{currentTestimonial.quote}"
            </blockquote>
            
            {currentTestimonial.stars && (
              <div className="flex mb-4 text-amber-400">
                {Array.from({ length: currentTestimonial.stars }).map((_, i) => (
                  <Star key={i} fill="currentColor" className="w-5 h-5" />
                ))}
              </div>
            )}
            
            <Avatar className="h-16 w-16 mb-4">
              {currentTestimonial.avatarUrl ? (
                <AvatarImage src={currentTestimonial.avatarUrl} alt={currentTestimonial.name} />
              ) : null}
              <AvatarFallback>
                {currentTestimonial.avatarFallback || 
                  currentTestimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h4 className="font-semibold text-foreground">
                {currentTestimonial.name}
              </h4>
              
              {currentTestimonial.title && (
                <p className="text-sm text-muted-foreground">
                  {currentTestimonial.title}
                  {currentTestimonial.location && `, ${currentTestimonial.location}`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carousel Controls */}
      {showControls && testimonials.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 shadow-sm pointer-events-auto ml-2"
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 shadow-sm pointer-events-auto mr-2"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Indicators */}
      {showIndicators && testimonials.length > 1 && (
        <div className="flex justify-center mt-4 gap-1.5">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex 
                  ? 'w-6 bg-primary' 
                  : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sample testimonials for Children's Aid Society disputes
export const childrenAidTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Single Mother",
    location: "Toronto",
    quote: "I was overwhelmed facing the Children's Aid Society alone. SmartDispute.ai's templates helped me respond to allegations professionally and keep my family together.",
    avatarFallback: "SJ",
    stars: 5
  },
  {
    id: "2",
    name: "Michael Torres",
    title: "Father",
    location: "Ottawa",
    quote: "When CAS started investigating our family based on a false report, I was terrified. Using the dispute templates helped me present evidence clearly and the case was closed.",
    avatarFallback: "MT",
    stars: 5
  },
  {
    id: "3",
    name: "Aisha Patel",
    title: "Legal Guardian",
    location: "Vancouver",
    quote: "As a guardian for my niece, I needed to respond to CAS quickly. The platform guided me through every step and helped me maintain custody during a difficult time.",
    avatarFallback: "AP",
    stars: 4
  }
];

// Sample testimonials for landlord-tenant disputes
export const landlordTenantTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "David Chen",
    title: "Tenant",
    location: "Montreal",
    quote: "My landlord was refusing to fix serious issues in my apartment. Thanks to SmartDispute.ai, I filed a proper complaint with the Landlord and Tenant Board and finally got results.",
    avatarFallback: "DC",
    stars: 5
  },
  {
    id: "2",
    name: "Jennifer Williams",
    title: "Tenant",
    location: "Calgary",
    quote: "I was facing an unfair eviction during the pandemic. The templates helped me understand my rights and file a successful dispute that allowed me to stay in my home.",
    avatarFallback: "JW",
    stars: 5
  },
  {
    id: "3",
    name: "Omar Hassan",
    title: "Student",
    location: "Halifax",
    quote: "As an international student, I didn't understand tenant laws. SmartDispute.ai helped me recover my security deposit when my landlord tried to withhold it unfairly.",
    avatarFallback: "OH",
    stars: 4
  }
];

// Sample testimonials for legal advocacy
export const legalAdvocacyTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Maria Rodriguez",
    title: "Community Advocate",
    location: "Edmonton",
    quote: "SmartDispute.ai has been a game-changer for our community. We've empowered dozens of families to stand up for their rights without expensive legal fees.",
    avatarFallback: "MR",
    stars: 5
  },
  {
    id: "2",
    name: "Thomas Wilson",
    title: "Social Worker",
    location: "Winnipeg",
    quote: "I recommend this platform to all my clients facing legal challenges. It's helped so many people who would otherwise have no way to navigate the system.",
    avatarFallback: "TW",
    stars: 5
  },
  {
    id: "3",
    name: "Lisa Blackwood",
    title: "Indigenous Rights Advocate",
    location: "Saskatoon",
    quote: "As someone working with marginalized communities, I've seen firsthand how SmartDispute.ai levels the playing field and gives people a voice in the system.",
    avatarFallback: "LB",
    stars: 5
  }
];