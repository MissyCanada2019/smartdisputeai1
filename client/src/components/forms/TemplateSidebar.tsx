import { useFormState } from "@/lib/formContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2Icon, CircleIcon, ArrowRightCircleIcon } from "lucide-react";

export default function TemplateSidebar() {
  const [formState] = useFormState();
  const { currentStep } = formState;
  
  const steps = [
    { id: 1, name: "Upload evidence", icon: currentStep >= 1 
      ? <CheckCircle2Icon size={16} className="mr-2" /> 
      : <ArrowRightCircleIcon size={16} className="mr-2" /> },
    { id: 2, name: "Personal information", icon: currentStep >= 2 
      ? <CheckCircle2Icon size={16} className="mr-2" /> 
      : (currentStep === 1 ? <ArrowRightCircleIcon size={16} className="mr-2" /> : <CircleIcon size={16} className="mr-2" />) },
    { id: 3, name: "Select document type", icon: currentStep >= 3 
      ? <CheckCircle2Icon size={16} className="mr-2" /> 
      : (currentStep === 2 ? <ArrowRightCircleIcon size={16} className="mr-2" /> : <CircleIcon size={16} className="mr-2" />) },
    { id: 4, name: "Customize template", icon: currentStep >= 4 
      ? <CheckCircle2Icon size={16} className="mr-2" /> 
      : (currentStep === 3 ? <ArrowRightCircleIcon size={16} className="mr-2" /> : <CircleIcon size={16} className="mr-2" />) },
    { id: 5, name: "Review document", icon: currentStep >= 5 
      ? <CheckCircle2Icon size={16} className="mr-2" /> 
      : (currentStep === 4 ? <ArrowRightCircleIcon size={16} className="mr-2" /> : <CircleIcon size={16} className="mr-2" />) },
    { id: 6, name: "Payment", icon: currentStep >= 6 
      ? <CheckCircle2Icon size={16} className="mr-2" /> 
      : (currentStep === 5 ? <ArrowRightCircleIcon size={16} className="mr-2" /> : <CircleIcon size={16} className="mr-2" />) }
  ];
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
        <ul className="space-y-3">
          {steps.map((step) => (
            <li 
              key={step.id} 
              className={`flex items-center ${
                currentStep >= step.id ? 'text-primary font-medium' : 
                (currentStep === step.id - 1 ? 'text-primary' : 'text-gray-400')
              }`}
            >
              {step.icon}
              <span>{step.name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
        <p className="text-gray-600 mb-4">Our support team is available to assist you with any questions.</p>
        <div className="space-y-3">
          <a href="#" className="flex items-center text-primary">
            <InfoIcon size={16} className="mr-2" />
            <span>Frequently Asked Questions</span>
          </a>
          <a href="#" className="flex items-center text-primary">
            <svg 
              className="w-4 h-4 mr-2"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Live Chat Support</span>
          </a>
          <a href="#" className="flex items-center text-primary">
            <svg 
              className="w-4 h-4 mr-2"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email: help@legalassist.ca</span>
          </a>
        </div>
      </div>
      
      {formState.caseAnalysis && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="font-semibold mb-2 flex items-center text-green-700">
            <CheckCircle2Icon className="h-4 w-4 mr-2" />
            Evidence Analyzed
          </h3>
          {formState.caseAnalysis.meritScore && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Case Merit Score:</div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${formState.caseAnalysis.meritScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 ml-2">
                  {formState.caseAnalysis.meritScore}%
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600">
            {formState.caseAnalysis.meritAssessment || 
              "We've analyzed your evidence and provided document recommendations based on your case details."}
          </p>
        </div>
      )}
      
      {formState.userInfo?.requestIncomeBased && (
        <Alert className="mt-6 bg-blue-50 border-l-4 border-blue-500">
          <AlertTitle className="flex items-center text-blue-700">
            <InfoIcon className="h-4 w-4 mr-2" />
            Income-Based Pricing
          </AlertTitle>
          <AlertDescription className="text-blue-600 text-sm">
            You've requested income-based pricing. Your discount will be applied at checkout.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
