import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormProvider } from "@/lib/formContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBotModal from "@/components/chatbot/ChatBotModal";
import { useEffect } from "react";
import { webSocketService, MessageType, useWebSocketNotifications } from "@/lib/webSocketService";
import { useToast } from "@/hooks/use-toast";

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
import Resources from "@/pages/resources";
import FAQ from "@/pages/faq";
import Community from "@/pages/community";
import NewPost from "@/pages/new-post";
import PostDetail from "@/pages/post-detail";
import CommunitySearch from "@/pages/community-search";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
      <Route path="/faq" component={FAQ} />
      
      {/* Community Routes */}
      <Route path="/community" component={Community} />
      <Route path="/community/new-post" component={NewPost} />
      <Route path="/community/post/:id" component={PostDetail} />
      <Route path="/community/search" component={CommunitySearch} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toast } = useToast();
  
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
          <ChatBotModal />
        </div>
        <Toaster />
      </FormProvider>
    </QueryClientProvider>
  );
}

export default App;
