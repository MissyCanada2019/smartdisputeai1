import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MaintenanceNotificationProps {
  position?: "top" | "bottom";
  dismissible?: boolean;
  autoHideDuration?: number | null; // null means don't auto-hide
}

export default function MaintenanceNotification({
  position = "top",
  dismissible = true,
  autoHideDuration = null
}: MaintenanceNotificationProps) {
  const [show, setShow] = useState(false);
  
  // On first render, check if the user has previously dismissed this notification
  useEffect(() => {
    const dismissed = localStorage.getItem("maintenanceNotificationDismissed");
    // Only show if not previously dismissed
    if (!dismissed || (dismissed && Date.now() > parseInt(dismissed) + 24 * 60 * 60 * 1000)) {
      setShow(true);
    }
  }, []);
  
  // Set up auto-hide if duration is provided
  useEffect(() => {
    if (autoHideDuration && show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, show]);
  
  const handleDismiss = () => {
    setShow(false);
    // Store the time when dismissed
    localStorage.setItem("maintenanceNotificationDismissed", Date.now().toString());
  };
  
  if (!show) return null;
  
  const positionClass = position === "top" 
    ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md" 
    : "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md";
  
  return (
    <div className={positionClass}>
      <Alert variant="default" className="border-2 border-blue-400 bg-blue-50 text-blue-900 shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-blue-600" />
          <div className="flex-1">
            <AlertTitle className="text-blue-800 font-semibold mb-1">Site Updates in Progress</AlertTitle>
            <AlertDescription className="text-blue-700">
              We're currently improving SmartDispute.ai to make it more user-friendly. 
              Thank you for your patience as we work to perfect your experience!
            </AlertDescription>
          </div>
          {dismissible && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-auto text-blue-700 hover:text-blue-900 hover:bg-blue-200"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}