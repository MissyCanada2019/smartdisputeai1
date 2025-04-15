import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the types for our onboarding tutorial states
export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left';
  arrowPosition?: 'top' | 'right' | 'bottom' | 'left';
  spotlightRadius?: number;
  action?: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  nextCondition?: () => boolean; // Function that returns true if user can proceed
};

export type JourneyType = 'tenant' | 'cas' | 'general';

export type TutorialJourney = {
  id: string;
  name: string;
  type: JourneyType;
  description: string;
  steps: TutorialStep[];
};

// Define the context type
type OnboardingContextType = {
  isOnboardingActive: boolean;
  currentJourney: TutorialJourney | null;
  currentStepIndex: number;
  totalSteps: number;
  startOnboarding: (journeyId: string) => void;
  endOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (index: number) => void;
  availableJourneys: TutorialJourney[];
  hasCompletedOnboarding: (journeyId: string) => boolean;
  markJourneyAsCompleted: (journeyId: string) => void;
};

// Create the context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Define tutorial journeys
const tenantJourney: TutorialJourney = {
  id: 'tenant-journey',
  name: 'Tenant Legal Journey',
  type: 'tenant',
  description: 'Learn how to use SmartDispute.ai for tenant-landlord disputes',
  steps: [
    {
      id: 'tenant-welcome',
      title: 'Welcome to Tenant Advocacy',
      description: "This tutorial will guide you through using SmartDispute.ai tools for tenant-landlord disputes. We'll show you how to upload evidence, analyze your case, and generate legal documents.",
      nextButtonText: 'Start Journey',
      skipButtonText: 'Skip Tutorial'
    },
    {
      id: 'tenant-evidence',
      title: 'Evidence Collection',
      description: "Upload communication, pictures, videos, and documents related to your tenancy. These will help build your case and provide the necessary context for legal documents.",
      element: '.evidence-upload-section',
      position: 'bottom',
      spotlightRadius: 200,
      nextButtonText: 'Next'
    },
    {
      id: 'tenant-analysis',
      title: 'Case Analysis',
      description: "Our AI will analyze your evidence against tenant laws in your province, identifying potential violations and suggesting appropriate legal strategies.",
      element: '.case-analysis-section',
      position: 'right',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'tenant-documents',
      title: 'Document Generation',
      description: "Based on your case analysis, we'll help you create professional legal documents tailored to your specific situation and compliant with local regulations.",
      element: '.document-selection-section',
      position: 'left',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'tenant-resources',
      title: 'Specialized Resources',
      description: "Access our curated collection of tenant resources, templates, and guides specific to your province and situation.",
      element: '.ltb-resources-section',
      position: 'top',
      spotlightRadius: 150,
      nextButtonText: 'Next'
    },
    {
      id: 'tenant-completion',
      title: 'Ready to Start',
      description: "You now understand the key features to help with your tenant dispute. Remember, you can always access help through our chat feature if you have questions.",
      nextButtonText: 'Complete Tutorial'
    }
  ]
};

const casJourney: TutorialJourney = {
  id: 'cas-journey',
  name: "Children's Aid Society Journey",
  type: 'cas',
  description: "Navigate Children's Aid Society interactions with SmartDispute.ai",
  steps: [
    {
      id: 'cas-welcome',
      title: 'Welcome to CAS Navigation',
      description: "This tutorial will guide you through using SmartDispute.ai tools for navigating Children's Aid Society interactions. We'll help you understand your rights and prepare appropriate responses.",
      nextButtonText: 'Start Journey',
      skipButtonText: 'Skip Tutorial'
    },
    {
      id: 'cas-evidence',
      title: 'Secure Evidence Collection',
      description: "Upload relevant documentation, communications, and records related to your case. Our system keeps all your information private and secure.",
      element: '.evidence-upload-section',
      position: 'bottom',
      spotlightRadius: 200,
      nextButtonText: 'Next'
    },
    {
      id: 'cas-analysis',
      title: 'Case Analysis & Rights',
      description: "Our system will analyze your documents and help you understand your parental rights and the legal requirements CAS must follow in your province.",
      element: '.case-analysis-section',
      position: 'right',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'cas-documents',
      title: 'Response Documents',
      description: "Create appropriate response documents, meeting requests, and legal notices that protect your rights while maintaining a cooperative approach.",
      element: '.document-selection-section',
      position: 'left',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'cas-resources',
      title: 'Family Advocacy Resources',
      description: "Access specialized resources to help you understand CAS processes, your rights, and strategies for positive resolution.",
      element: '.cas-resources-section',
      position: 'top',
      spotlightRadius: 150,
      nextButtonText: 'Next'
    },
    {
      id: 'cas-completion',
      title: 'Ready to Navigate',
      description: "You're now equipped to navigate CAS interactions more effectively. Remember to document everything and use our tools to prepare for meetings and communications.",
      nextButtonText: 'Complete Tutorial'
    }
  ]
};

const generalJourney: TutorialJourney = {
  id: 'general-journey',
  name: 'Getting Started Tour',
  type: 'general',
  description: 'Quick setup guide for your legal journey',
  steps: [
    {
      id: 'general-welcome',
      title: 'Welcome to SmartDispute.ai',
      description: "Let's get you set up with everything you need. We'll help you select your province, organize your documents, and choose the right package for your needs.",
      nextButtonText: 'Start Setup',
      skipButtonText: 'Skip Setup'
    },
    {
      id: 'province-selection',
      title: 'Select Your Province',
      description: "First, let's set your province to ensure you get the right templates and legal information.",
      element: '.province-selector',
      position: 'bottom',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'document-organization',
      title: 'Document Organization',
      description: "Create folders to keep your documents organized by case or topic. Click 'New Folder' to get started.",
      element: '.folder-creation-section',
      position: 'right',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'first-upload',
      title: 'Upload Your First Document',
      description: "Let's upload your first document. You can drag and drop files or click to browse.",
      element: '.document-upload-section',
      position: 'bottom',
      spotlightRadius: 200,
      nextButtonText: 'Next'
    },
    {
      id: 'package-selection',
      title: 'Choose Your Package',
      description: "Select the package that best fits your needs. We offer different levels of analysis and support.",
      element: '.pricing-packages',
      position: 'left',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'completion',
      title: "You're All Set!",
      description: "You've completed the basic setup. Need help with specific topics? Check out our specialized guides for Tenant Rights, CAS Matters, or Credit Disputes.",
      nextButtonText: 'View Specialized Guides'
    }
  ]
};

// Additional steps journey
const additionalStepsJourney: TutorialJourney = {
  id: 'additional-steps-journey',
  name: 'Advanced Features Tour',
  type: 'general',
  description: 'Learn about advanced features to maximize your experience',
  steps: [
    {
      id: 'general-profile',
      title: 'Your Profile',
      description: "Complete your profile to streamline document generation. We'll save your information securely so you don't need to re-enter it.",
      element: '.user-profile-section',
      position: 'right',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'general-evidence',
      title: 'Evidence Management',
      description: "Upload, organize, and analyze documents, photos, and messages relevant to your case.",
      element: '.evidence-upload-section',
      position: 'bottom',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'general-document',
      title: 'Document Creation',
      description: "Create customized legal documents based on your situation and information. Our AI helps ensure they're relevant to your jurisdiction.",
      element: '.document-selection-section',
      position: 'left',
      spotlightRadius: 180,
      nextButtonText: 'Next'
    },
    {
      id: 'general-community',
      title: 'Community & Resources',
      description: "Access our community forum, resource library, and legal guides to better understand your situation.",
      element: '.community-resources-section',
      position: 'top',
      spotlightRadius: 150,
      nextButtonText: 'Next'
    },
    {
      id: 'general-help',
      title: 'Get Help Anytime',
      description: "Our AI assistant is available 24/7 to answer questions and guide you. For complex matters, we can connect you with affordable legal help.",
      element: '.chat-help-section',
      position: 'left',
      spotlightRadius: 120,
      nextButtonText: 'Complete Tour'
    }
  ]
};

// Create all available journeys
const tutorialJourneys: TutorialJourney[] = [
  generalJourney,
  additionalStepsJourney,
  tenantJourney,
  casJourney
];

// Create the provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [currentJourney, setCurrentJourney] = useState<TutorialJourney | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedJourneys, setCompletedJourneys] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedOnboardingJourneys');
    return saved ? JSON.parse(saved) : [];
  });

  // Save completed journeys to localStorage
  useEffect(() => {
    localStorage.setItem('completedOnboardingJourneys', JSON.stringify(completedJourneys));
  }, [completedJourneys]);

  const startOnboarding = (journeyId: string) => {
    const journey = tutorialJourneys.find(j => j.id === journeyId);
    if (journey) {
      setCurrentJourney(journey);
      setCurrentStepIndex(0);
      setIsOnboardingActive(true);
    }
  };

  const endOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentJourney(null);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentJourney && currentStepIndex < currentJourney.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Last step - complete the journey
      if (currentJourney) {
        markJourneyAsCompleted(currentJourney.id);
      }
      endOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    if (currentJourney && index >= 0 && index < currentJourney.steps.length) {
      setCurrentStepIndex(index);
    }
  };

  const hasCompletedOnboarding = (journeyId: string): boolean => {
    return completedJourneys.includes(journeyId);
  };

  const markJourneyAsCompleted = (journeyId: string) => {
    if (!completedJourneys.includes(journeyId)) {
      setCompletedJourneys(prev => [...prev, journeyId]);
    }
  };

  const totalSteps = currentJourney?.steps.length || 0;

  const contextValue: OnboardingContextType = {
    isOnboardingActive,
    currentJourney,
    currentStepIndex,
    totalSteps,
    startOnboarding,
    endOnboarding,
    nextStep,
    prevStep,
    jumpToStep,
    availableJourneys: tutorialJourneys,
    hasCompletedOnboarding,
    markJourneyAsCompleted
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};