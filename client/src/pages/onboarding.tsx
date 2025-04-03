import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useOnboarding } from '@/context/onboardingContext';
import JourneySelector from '@/components/onboarding/JourneySelector';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { availableJourneys, startOnboarding, hasCompletedOnboarding } = useOnboarding();
  const [location, setLocation] = useLocation();
  
  // Check for journey param in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const journeyId = params.get('journey');
    
    if (journeyId) {
      const journey = availableJourneys.find(j => j.id === journeyId);
      if (journey) {
        startOnboarding(journeyId);
        // Remove the journey param from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [availableJourneys, startOnboarding]);
  
  // Check if all journeys are completed
  const allJourneysCompleted = availableJourneys.every(journey => 
    hasCompletedOnboarding(journey.id)
  );
  
  // Check if no journeys are completed
  const noJourneysCompleted = availableJourneys.every(journey => 
    !hasCompletedOnboarding(journey.id)
  );
  
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
          >
            <ChevronLeft size={16} className="mr-2" />
            Back to Home
          </Button>
          
          {!noJourneysCompleted && (
            <Button 
              variant="link" 
              onClick={() => {
                // Reset all completed journeys in localStorage
                localStorage.removeItem('completedOnboardingJourneys');
                // Force a page reload to update state
                window.location.reload();
              }}
            >
              Reset All Progress
            </Button>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 dark:text-white">Interactive Legal Journey</h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore guided walkthroughs of our platform tailored to your specific legal needs. 
                Each journey will help you understand how to use SmartDispute.ai for your specific situation.
              </p>
              
              {allJourneysCompleted && (
                <div className="mt-6 inline-block bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100 rounded-lg px-4 py-2">
                  🎉 You've completed all available journey tutorials!
                </div>
              )}
            </div>
            
            <JourneySelector />
            
            <div className="mt-12 border-t dark:border-gray-700 pt-6">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Why Take A Journey?</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <h4 className="font-medium mb-2 dark:text-white">Specialized Knowledge</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Learn exactly what you need based on your specific legal situation.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <h4 className="font-medium mb-2 dark:text-white">Save Time</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Quickly understand how to use our platform without trial and error.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                  </div>
                  <h4 className="font-medium mb-2 dark:text-white">Better Outcomes</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Learn best practices that lead to more effective legal self-representation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Need more help? Contact our support team at support@smartdispute.ai
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;