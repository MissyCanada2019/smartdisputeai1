import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Gx from "./lib/mobileApiClient";
import { MobileDocumentAnalyzer } from "./lib/mobileDocumentAnalyzer";
import SmartDisputeDebug from "./debug";

// Make API utilities available globally for mobile components
declare global {
  interface Window {
    Gx: typeof Gx;
    MobileDocumentAnalyzer: typeof MobileDocumentAnalyzer;
    SmartDisputeDebug: typeof SmartDisputeDebug;
  }
}

// Expose utilities to the global window object
window.Gx = Gx;
window.MobileDocumentAnalyzer = MobileDocumentAnalyzer;
window.SmartDisputeDebug = SmartDisputeDebug;

// Log API client information on startup to help with debugging
if (import.meta.env.MODE === 'development') {
  console.log('SmartDispute.ai development mode active');
  setTimeout(() => {
    window.SmartDisputeDebug.logApiClientInfo();
  }, 1000);
}

createRoot(document.getElementById("root")!).render(<App />);
