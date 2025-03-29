import ProgressTracker from "@/components/common/ProgressTracker";
import DocumentSelectionForm from "@/components/forms/DocumentSelection";
import TemplateSidebar from "@/components/forms/TemplateSidebar";

export default function DocumentSelection() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={2} />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Select Your Document Type</h1>
        <p className="text-gray-600">Choose the document that best suits your needs</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <TemplateSidebar />
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Document Types</h2>
            <p className="text-gray-600 mb-6">
              Browse our collection of document templates designed for various government agency disputes.
            </p>
            
            <DocumentSelectionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
