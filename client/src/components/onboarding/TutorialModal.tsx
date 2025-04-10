import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, TutorialStep } from '@/context/onboardingContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface SpotlightProps {
  step: TutorialStep;
  onClose: () => void;
}

const TutorialModal: React.FC = () => {
  const {
    isOnboardingActive,
    currentJourney,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    endOnboarding,
  } = useOnboarding();
  const navigate = useNavigate(); // Initialize useNavigate

  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Short delay before showing the modal to allow for transitions
    if (isOnboardingActive) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOnboardingActive]);

  useEffect(() => {
    if (!isOnboardingActive || !currentJourney) return;

    const currentStep = currentJourney.steps[currentStepIndex];

    // If there's no element specified, center in the viewport
    if (!currentStep.element) {
      setTargetElement(null);
      setSpotlightPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      return;
    }

    // Find the target element
    const element = document.querySelector(currentStep.element);
    if (element) {
      setTargetElement(element);

      // Calculate positions after a short delay to ensure the DOM is updated
      setTimeout(() => {
        const rect = element.getBoundingClientRect();

        // Calculate the center point of the element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        setSpotlightPosition({ x: centerX, y: centerY });

        // Calculate modal position based on specified position or smart positioning
        const position = currentStep.position || calculateOptimalPosition(rect);
        positionModal(rect, position);
      }, 50);
    } else {
      console.warn(`Element not found: ${currentStep.element}`);
      setTargetElement(null);
    }
  }, [currentStepIndex, currentJourney, isOnboardingActive]);

  // Calculate the best position for the modal
  const calculateOptimalPosition = (elementRect: DOMRect): 'top' | 'right' | 'bottom' | 'left' => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;

    // Calculate available space in each direction
    const spaceAbove = elementRect.top;
    const spaceBelow = viewportHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = viewportWidth - elementRect.right;

    // Find the direction with the most space
    const maxSpace = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);

    if (maxSpace === spaceBelow) return 'bottom';
    if (maxSpace === spaceAbove) return 'top';
    if (maxSpace === spaceRight) return 'right';
    return 'left';
  };

  // Position the modal relative to the target element
  const positionModal = (elementRect: DOMRect, position: 'top' | 'right' | 'bottom' | 'left') => {
    if (!modalRef.current) return;

    const modalRect = modalRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;

    switch (position) {
      case 'top':
        top = elementRect.top - modalRect.height - 20;
        left = elementCenterX - modalRect.width / 2;
        break;
      case 'right':
        top = elementCenterY - modalRect.height / 2;
        left = elementRect.right + 20;
        break;
      case 'bottom':
        top = elementRect.bottom + 20;
        left = elementCenterX - modalRect.width / 2;
        break;
      case 'left':
        top = elementCenterY - modalRect.height / 2;
        left = elementRect.left - modalRect.width - 20;
        break;
    }

    // Keep the modal within viewport bounds
    if (left < 20) left = 20;
    if (left + modalRect.width > window.innerWidth - 20) {
      left = window.innerWidth - modalRect.width - 20;
    }
    if (top < 20) top = 20;
    if (top + modalRect.height > window.innerHeight - 20) {
      top = window.innerHeight - modalRect.height - 20;
    }

    setModalPosition({ top, left });
  };

  if (!isOnboardingActive || !currentJourney) return null;

  const currentStep = currentJourney.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleComplete = () => {
    if (currentJourney) {
      markJourneyAsCompleted(currentJourney.id);

      // If this was the general journey, show specialized guide options
      if (currentJourney.id === 'general-journey') {
        navigate('/specialized-guides');
      }
    }
    endOnboarding();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => endOnboarding()}
          />

          {/* Spotlight */}
          <Spotlight step={currentStep} onClose={endOnboarding} />

          {/* Tutorial Modal */}
          <motion.div
            ref={modalRef}
            className="fixed z-[60] w-[400px] max-w-[90vw] bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 200, 
              damping: 20 
            }}
          >
            {/* Header with journey type indicator */}
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentJourney.type === 'tenant' ? 'bg-blue-500' :
                  currentJourney.type === 'cas' ? 'bg-purple-500' : 'bg-green-500'
                }`}></div>
                <h4 className="font-medium text-sm">{currentJourney.name}</h4>
              </div>
              <button 
                onClick={endOnboarding}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{currentStep.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{currentStep.description}</p>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="mt-4 mb-6">
                <Progress value={progress} className="h-1" />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Step {currentStepIndex + 1}</span>
                  <span>{totalSteps} steps total</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center mt-4">
                <div>
                  {currentStepIndex > 0 && (
                    <Button
                      variant="outline" 
                      size="sm" 
                      onClick={prevStep}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {currentStepIndex === 0 && (
                    <Button
                      variant="outline" 
                      size="sm" 
                      onClick={endOnboarding}
                    >
                      {currentStep.skipButtonText || "Skip"}
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    onClick={currentStepIndex === totalSteps -1 ? handleComplete : nextStep} // Use handleComplete on last step
                  >
                    {currentStepIndex === totalSteps - 1 ? (
                      <>
                        {currentStep.nextButtonText || "Complete"}
                        <Check size={16} className="ml-1" />
                      </>
                    ) : (
                      <>
                        {currentStep.nextButtonText || "Next"}
                        <ChevronRight size={16} className="ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// The spotlight component creates a spotlight effect around the target element
const Spotlight: React.FC<SpotlightProps> = ({ step, onClose }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [radius, setRadius] = useState(step.spotlightRadius || 150);

  useEffect(() => {
    if (!step.element) {
      // If no element specified, center in viewport with default size
      setPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setRadius(step.spotlightRadius || 200);
      return;
    }

    const element = document.querySelector(step.element);
    if (!element) return;

    const updateSpotlight = () => {
      const rect = element.getBoundingClientRect();

      // Add some padding around the element
      const padding = 10;
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      // Set dimensions to viewport size
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Calculate radius based on element size and specified spotlight radius
      const elementRadius = Math.max(rect.width, rect.height) / 2;
      setRadius(step.spotlightRadius || elementRadius + padding);
    };

    // Update on load and on resize
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [step]);

  // Early return if no dimensions
  if (!dimensions.width || !dimensions.height) return null;

  return (
    <motion.svg
      className="fixed inset-0 z-[55] pointer-events-none"
      width={dimensions.width}
      height={dimensions.height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <motion.circle
            cx={position.x}
            cy={position.y}
            r={radius}
            fill="black"
            initial={{ r: 0 }}
            animate={{ r: radius }}
            transition={{ duration: 0.5, type: "spring" }}
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.5)"
        mask="url(#spotlight-mask)"
      />
    </motion.svg>
  );
};

export default TutorialModal;