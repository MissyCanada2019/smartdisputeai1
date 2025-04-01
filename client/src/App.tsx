import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormProvider } from "@/lib/formContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBotModal from "@/components/chatbot/ChatBotModal";
import AutomaticUpdates from "@/components/common/AutomaticUpdates";
import CookieConsentBanner from "@/components/common/CookieConsentBanner";
import { LeadCaptureProvider } from "@/components/marketing/LeadCaptureProvider";
import { useEffect } from "react";
import { webSocketService, MessageType, useWebSocketNotifications } from "@/lib/webSocketService";
import { useToast } from "@/hooks/use-toast";
import { trackPageView } from "@/lib/trackingService";
import { useLeadCapture } from "@/hooks/use-lead-capture";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UserInfo from "@/pages/user-info";
import DocumentSelection from "@/pages/document-selection";
import DocumentSelectionHierarchical from "@/pages/document-selection-hierarchical";
import TemplateCustomization from "@/pages/template-customization";
import DocumentReview from "@/pages/document-review";
import DocumentManagement from "@/pages/document-management";
import Payment from "@/pages/payment";
import Success from "@/pages/success";
import Subscribe from "@/pages/subscribe";
import About from "@/pages/about";
import Chat from "@/pages/chat";
import Resources from "@/pages/resources-new";
import ResourceSharing from "@/pages/resource-sharing";
import NewResource from "@/pages/new-resource";
import FAQ from "@/pages/faq";
import Community from "@/pages/community";
import NewPost from "@/pages/new-post";
import PostDetail from "@/pages/post-detail";
import CommunitySearch from "@/pages/community-search";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import CookiePolicy from "@/pages/cookie-policy";
import Disclaimer from "@/pages/disclaimer";
import AffiliateProgram from "@/pages/affiliate-program";
import FileUploaderDemo from "@/pages/file-uploader-demo";
import EvidenceUpload from "@/pages/evidence-upload";
import CaseAnalysis from "@/pages/case-analysis";
import Services from "@/pages/services";

// Marketing Funnel Pages
import MarketingIndex from "@/pages/marketing/index";
import ChildrenAidLandingPage from "@/pages/marketing/children-aid";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evidence-upload" component={EvidenceUpload} />
      <Route path="/case-analysis" component={CaseAnalysis} />
      <Route path="/user-info" component={UserInfo} />
      <Route path="/document-selection" component={DocumentSelection} />
      <Route path="/document-selection-hierarchical" component={DocumentSelectionHierarchical} />
      <Route path="/template-customization" component={TemplateCustomization} />
      <Route path="/document-review" component={DocumentReview} />
      <Route path="/document-review/:id" component={DocumentReview} />
      <Route path="/document-management" component={DocumentManagement} />
      <Route path="/payment" component={Payment} />
      <Route path="/success" component={Success} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/about" component={About} />
      <Route path="/chat" component={Chat} />
      <Route path="/resources" component={Resources} />
      <Route path="/services" component={Services} />
      <Route path="/faq" component={FAQ} />
      
      {/* Resource Sharing Routes */}
      <Route path="/resource-sharing" component={ResourceSharing} />
      <Route path="/resource-sharing/new" component={NewResource} />
      
      {/* Legal Pages */}
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/affiliate-program" component={AffiliateProgram} />
      
      {/* Community Routes */}
      <Route path="/community" component={Community} />
      <Route path="/community/new-post" component={NewPost} />
      <Route path="/community/post/:id" component={PostDetail} />
      <Route path="/community/search" component={CommunitySearch} />
      
      {/* Marketing Funnel Routes */}
      <Route path="/marketing" component={MarketingIndex} />
      <Route path="/marketing/children-aid" component={ChildrenAidLandingPage} />
      
      {/* Component Demos */}
      <Route path="/demos/file-uploader" component={FileUploaderDemo} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Track page views when location changes
  useEffect(() => {
    // Only track if user has consented to cookies
    const hasConsented = localStorage.getItem('cookieConsent') === 'true';
    if (hasConsented) {
      trackPageView(location);
    }
  }, [location]);
  
  useEffect(() => {
    // Initialize WebSocket connection
    webSocketService.connect();
    
    // Clean up on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);
  
  useEffect(() => {
    // Set up notification handlers
    const notificationHandler = useWebSocketNotifications(toast);
    
    // Subscribe to various notification types
    const documentSub = webSocketService.subscribe(
      MessageType.DOCUMENT_GENERATED, 
      notificationHandler
    );
    
    const paymentSuccessSub = webSocketService.subscribe(
      MessageType.PAYMENT_SUCCESS, 
      notificationHandler
    );
    
    const paymentFailedSub = webSocketService.subscribe(
      MessageType.PAYMENT_FAILED, 
      notificationHandler
    );
    
    const systemNotificationSub = webSocketService.subscribe(
      MessageType.SYSTEM_NOTIFICATION, 
      notificationHandler
    );
    
    // Clean up subscriptions on unmount
    return () => {
      documentSub();
      paymentSuccessSub();
      paymentFailedSub();
      systemNotificationSub();
    };
  }, [toast]);
  
  // Set up default lead capture configuration based on current page
  // Use banner on homepage, exit intent elsewhere
  const initialLeadCaptureConfig = {
    type: location === '/' ? 'banner' : 'exit_intent',
    resourceName: 'Legal Letter Template',
    title: 'Get Your Free Legal Template',
    description: 'Sign up to receive a free legal letter template that can help with your dispute.',
    delay: 5000, // Show after 5 seconds
    pageViewThreshold: 1 // Show after 1 page view
  };

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <LeadCaptureProvider initialConfig={initialLeadCaptureConfig}>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
            <ChatBotModal />
            <CookieConsentBanner />
            <AutomaticUpdates />
          </div>
          <Toaster />
        </LeadCaptureProvider>
      </FormProvider>
    </QueryClientProvider>
  );
}

export default App;
