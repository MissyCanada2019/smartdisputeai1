import ProgressTracker from "@/components/common/ProgressTracker";
import UserInfoForm from "@/components/forms/UserInfoForm";
import TemplateSidebar from "@/components/forms/TemplateSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ShieldAlert } from "lucide-react";

export default function UserInfo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressTracker currentStep={1} />
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Create Your Legal Documents</h1>
        <p className="text-gray-600">Simple, affordable legal solutions for government agency disputes in Canada</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 order-2 md:order-1">
          <TemplateSidebar />
        </div>
        
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <p className="text-gray-600 mb-6">This information will be used to complete your legal documents.</p>
            
            <UserInfoForm />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Alert className="bg-blue-50 rounded-lg p-4 border-l-4 border-info">
              <AlertTitle className="font-medium text-info mb-2 flex items-center">
                <InfoIcon className="mr-1 h-4 w-4" /> Why We Need This Information
              </AlertTitle>
              <AlertDescription className="text-sm text-gray-600">
                Your personal details help us complete the legal documents accurately. All information is kept secure and confidential.
              </AlertDescription>
            </Alert>
            
            <Alert variant="warning" className="bg-yellow-50 rounded-lg p-4 border-l-4 border-warning">
              <AlertTitle className="font-medium text-warning mb-2 flex items-center">
                <ShieldAlert className="mr-1 h-4 w-4" /> Income Verification
              </AlertTitle>
              <AlertDescription className="text-sm text-gray-600">
                We offer reduced fees based on income. Documentation may be requested later to verify eligibility.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
