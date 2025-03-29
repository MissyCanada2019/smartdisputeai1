import { useState } from "react";
import { useNavigate } from "wouter";
import ProgressTracker from "@/components/common/ProgressTracker";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import DocumentPreviewer from "@/components/forms/DocumentPreviewer";
import { useFormState } from "@/lib/formContext";

export default function TemplateCustomization() {
  const [formState] = useFormState();
  const [_, navigate] = useNavigate();
  
  // Check if we have a selected template
  if (!formState.selectedTemplate) {
    navigate("/document-selection");
    return null;
  }
  
  const handleContinue = () => {
    navigate("/document-review");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={3} />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Customize Your Document</h1>
        <p className="text-gray-600">Fill in the required information to create your {formState.selectedTemplate.name}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <TemplateSidebar />
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <DocumentPreviewer onComplete={handleContinue} />
          </div>
        </div>
      </div>
    </div>
  );
}
