
import React, { useState } from 'react';

const GuidedTutorial = () => {
  const [currentStep, setCurrentStep] = useState('step1');

  const showStep = (stepId: string) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-4">Start Your Support Journey</h1>

          {/* Step 1: Choose a Topic */}
          <div className={currentStep === 'step1' ? '' : 'hidden'}>
            <h2 className="text-lg font-semibold mb-2">1. What do you need help with?</h2>
            <select className="w-full p-3 border rounded mb-6" id="topicSelect">
              <option value="">Select a topic...</option>
              <option value="housing">Housing Dispute</option>
              <option value="credit">Credit Report Error</option>
              <option value="cas">CAS Issue</option>
              <option value="police">Police Misconduct</option>
            </select>
            <button 
              onClick={() => showStep('step2')} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>

          {/* Step 2: Explore Resources / Community */}
          <div className={currentStep === 'step2' ? '' : 'hidden'}>
            <h2 className="text-lg font-semibold mb-2">2. Explore Support Options</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                className="bg-purple-600 text-white p-4 rounded hover:bg-purple-700 transition" 
                onClick={() => showStep('uploadSection')}
              >
                Tutorials & Guides
              </button>
              <button 
                className="bg-green-600 text-white p-4 rounded hover:bg-green-700 transition" 
                onClick={() => showStep('uploadSection')}
              >
                Community Help
              </button>
            </div>
          </div>

          {/* Step 3: Upload Evidence */}
          <div className={currentStep === 'uploadSection' ? '' : 'hidden'}>
            <h2 className="text-lg font-semibold mb-2">3. Upload Your Evidence</h2>
            <input type="file" className="mb-4" />
            <textarea 
              className="w-full p-3 border rounded mb-4" 
              placeholder="Add a note about your file (optional)..."
            />
            <button 
              onClick={() => showStep('pricingSection')} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>

          {/* Step 4: Plan Selection */}
          <div className={currentStep === 'pricingSection' ? '' : 'hidden'}>
            <h2 className="text-lg font-semibold mb-2">4. Choose a Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border p-4 rounded shadow hover:shadow-md transition">
                <h3 className="font-bold">Pay-per-Form</h3>
                <p>$5.99 per form</p>
              </div>
              <div className="border p-4 rounded shadow hover:shadow-md transition">
                <h3 className="font-bold">Monthly</h3>
                <p>$50/month - Unlimited Access</p>
              </div>
              <div className="border p-4 rounded shadow hover:shadow-md transition">
                <h3 className="font-bold">Annual</h3>
                <p>$1000/year - Unlimited Access</p>
              </div>
              <div className="border p-4 rounded shadow hover:shadow-md transition">
                <h3 className="font-bold">Low-Income</h3>
                <p>$25/year or $0.99 per form</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTutorial;
