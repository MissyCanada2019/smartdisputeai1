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
import MaintenanceNotification from "@/components/common/MaintenanceNotification";
import { LeadCaptureProvider } from "@/components/marketing/LeadCaptureProvider";
import { AnalyticsProvider, RouteTracker } from "@/components/analytics";
import { useEffect } from "react";
import { webSocketService, MessageType, useWebSocketNotifications } from "@/lib/webSocketService";
import { useToast } from "@/hooks/use-toast";
import { trackPageView } from "@/lib/analytics";
import { useLeadCapture, LeadCaptureType } from "@/hooks/use-lead-capture";
import { AuthProvider } from "@/context/authContext";

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
import LTBResourcesPage from "@/pages/ltb-resources";
import CASResourcesPage from "@/pages/cas-resources";
import ResourceDetail from "@/pages/resource-detail";
import Login from "@/pages/login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Marketing Funnel Pages
import MarketingIndex from "@/pages/marketing/index";
import ChildrenAidLandingPage from "@/pages/marketing/children-aid";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evidence-upload">
        <ProtectedRoute>
          <EvidenceUpload />
        </ProtectedRoute>
      </Route>
      <Route path="/case-analysis">
        <ProtectedRoute>
          <CaseAnalysis />
        </ProtectedRoute>
      </Route>
      <Route path="/user-info" component={UserInfo} />
      <Route path="/document-selection">
        <ProtectedRoute>
          <DocumentSelection />
        </ProtectedRoute>
      </Route>
      <Route path="/document-selection-hierarchical">
        <ProtectedRoute>
          <DocumentSelectionHierarchical />
        </ProtectedRoute>
      </Route>
      <Route path="/template-customization">
        <ProtectedRoute>
          <TemplateCustomization />
        </ProtectedRoute>
      </Route>
      <Route path="/document-review">
        <ProtectedRoute>
          <DocumentReview />
        </ProtectedRoute>
      </Route>
      <Route path="/document-review/:id">
        <ProtectedRoute>
          <DocumentReview />
        </ProtectedRoute>
      </Route>
      <Route path="/document-management">
        <ProtectedRoute>
          <DocumentManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/payment">
        <ProtectedRoute>
          <Payment />
        </ProtectedRoute>
      </Route>
      <Route path="/success">
        <ProtectedRoute>
          <Success />
        </ProtectedRoute>
      </Route>
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/about" component={About} />
      <Route path="/chat">
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      </Route>
      <Route path="/resources" component={Resources} />
      <Route path="/resources/ltb" component={LTBResourcesPage} />
      <Route path="/resources/cas" component={CASResourcesPage} />
      <Route path="/services" component={Services} />
      <Route path="/faq" component={FAQ} />
      <Route path="/login" component={Login} />
      
      {/* Resource Sharing Routes */}
      <Route path="/resource-sharing" component={ResourceSharing} />
      <Route path="/resource-sharing/new">
        <ProtectedRoute>
          <NewResource />
        </ProtectedRoute>
      </Route>
      <Route path="/resource-sharing/:id" component={ResourceDetail} />
      
      {/* Legal Pages */}
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/affiliate-program" component={AffiliateProgram} />
      
      {/* Community Routes */}
      <Route path="/community" component={Community} />
      <Route path="/community/new-post">
        <ProtectedRoute>
          <NewPost />
        </ProtectedRoute>
      </Route>
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
  } as const; // Use const assertion to make TypeScript infer more specific types

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <AuthProvider>
          <LeadCaptureProvider initialConfig={initialLeadCaptureConfig}>
            <AnalyticsProvider>
              {/* RouteTracker component for automatic page view tracking */}
              <RouteTracker />
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <main className="flex-grow">
                  <Router />
                </main>
                <Footer />
                <ChatBotModal />
                <CookieConsentBanner />
                <AutomaticUpdates />
                <MaintenanceNotification />
              </div>
              <Toaster />
            </AnalyticsProvider>
          </LeadCaptureProvider>
        </AuthProvider>
      </FormProvider>
    </QueryClientProvider>
  );
}

export default App;
