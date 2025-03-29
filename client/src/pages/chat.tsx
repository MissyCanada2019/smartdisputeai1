import { useEffect } from "react";
import ChatBot from "@/components/chatbot/ChatBot";

export default function Chat() {
  useEffect(() => {
    // Set page title
    document.title = "SmartDisputesAICanada - AI Legal Assistant";
  }, []);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Legal Assistant</h1>
      <div className="mb-6">
        <p className="text-center text-muted-foreground">
          Describe your situation, and our AI assistant will help you find the right document template
          for your legal needs. You can then customize and generate the appropriate legal document.
        </p>
      </div>
      <ChatBot />
    </div>
  );
}