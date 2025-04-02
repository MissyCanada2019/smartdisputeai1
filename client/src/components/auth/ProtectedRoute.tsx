import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/authContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Short timeout to allow auth state to initialize from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      if (!isAuthenticated) {
        // Store the current path to redirect back after login
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        navigate("/login");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Checking authentication...</span>
      </div>
    );
  }

  // If authenticated, render the protected content
  return isAuthenticated ? <>{children}</> : null;
}