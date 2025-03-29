import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormProvider } from "@/lib/formContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UserInfo from "@/pages/user-info";
import DocumentSelection from "@/pages/document-selection";
import TemplateCustomization from "@/pages/template-customization";
import DocumentReview from "@/pages/document-review";
import Payment from "@/pages/payment";
import Success from "@/pages/success";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/user-info" component={UserInfo} />
      <Route path="/document-selection" component={DocumentSelection} />
      <Route path="/template-customization" component={TemplateCustomization} />
      <Route path="/document-review" component={DocumentReview} />
      <Route path="/payment" component={Payment} />
      <Route path="/success" component={Success} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </FormProvider>
    </QueryClientProvider>
  );
}

export default App;
