import ProgressTracker from "@/components/common/ProgressTracker";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useFormState } from "@/lib/formContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Payment() {
  const [formState] = useFormState();
  const [_, navigate] = useLocation();
  
  // Check if we have the necessary data to proceed
  useEffect(() => {
    if (!formState.selectedTemplate || !formState.documentData || !formState.documentId) {
      navigate("/document-selection");
    }
  }, [formState, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={5} />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Complete Your Purchase</h1>
        <p className="text-gray-600">Secure payment processing for your legal document</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <TemplateSidebar />
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <PaymentForm />
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-700 mb-2 flex items-center">
              <svg 
                className="w-4 h-4 mr-2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Secure Payment Processing
            </h4>
            <p className="text-sm text-blue-600">
              Your payment information is securely processed through Stripe. We never store your credit card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
