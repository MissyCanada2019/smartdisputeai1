interface ProgressTrackerProps {
  currentStep: number;
  totalSteps?: number;
  stepNames?: string[];
  title?: string;
}

export default function ProgressTracker({
  currentStep,
  totalSteps = 5,
  stepNames = ["User Info", "Document Type", "Template", "Review", "Payment"],
  title = "Filing a Government Agency Dispute"
}: ProgressTrackerProps) {
  const percentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-primary">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {stepNames.map((step, index) => (
          <span 
            key={index}
            className={index < currentStep ? "text-primary font-medium" : ""}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
