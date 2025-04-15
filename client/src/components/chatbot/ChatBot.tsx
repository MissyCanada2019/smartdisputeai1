import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, X, BookOpen, MapPin, Info } from "lucide-react";
import { webSocketService, MessageType, WebSocketMessage } from "@/lib/webSocketService";
import { trackEvent, Events } from "@/lib/trackingService";

interface Message {
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Template {
  id: number;
  name: string;
}

interface ChatBotProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function ChatBot({ isModal = false, onClose }: ChatBotProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your Canadian legal document assistant. Tell me about your situation, and I'll help you find the right form or document for your needs. I specialize in Canadian provincial and federal laws, particularly for landlord-tenant issues, family law, and consumer protections.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState<number | undefined>(undefined);
  
  // Set up user ID and WebSocket connection
  useEffect(() => {
    // For demo purposes, we'll use a fake user ID of 1
    const demoUserId = 1;
    setUserId(demoUserId);
    
    // Disconnect any existing connections first
    webSocketService.disconnect();
    
    // Connect to WebSocket with a small delay to ensure clean connection
    setTimeout(() => {
      // Connect to the WebSocket server
      webSocketService.connect();
      
      // Wait a bit before identifying to make sure connection is established
      setTimeout(() => {
        if (demoUserId) {
          try {
            webSocketService.identify(demoUserId);
          } catch (error) {
            console.error("Error identifying with WebSocket:", error);
          }
        }
      }, 1000);
    }, 500);
    
    // Clean up function to disconnect when component unmounts
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    // Add user message to chat
    const userMessage: Message = {
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    
    // Track chatbot interaction with HubSpot
    const hasConsented = localStorage.getItem('cookieConsent') === 'true';
    if (hasConsented) {
      trackEvent(Events.CHATBOT_INTERACTION, {
        query: input,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Create context from previous messages
      const context = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Send message to API
      const response = await apiRequest("POST", "/api/chatbot", {
        message: input,
        context,
        userId // Include userId to enable WebSocket notifications
      });

      const data = await response.json();
      
      // Check for error state - note that we process errors with 200 status codes now
      if (!response.ok || data.isError) {
        // Still show the response message, but mark it as an error
        setMessages((prev) => [...prev, {
          content: data.response || "Sorry, I'm having trouble connecting right now. Please try again in a few minutes.",
          sender: "bot",
          timestamp: new Date(),
        }]);
        
        // If there are recommended templates, show them even in error state
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
        
        if (data.recommendedTemplateIds && Array.isArray(data.recommendedTemplateIds)) {
          // Use the keywords-based recommendations
          const filteredTemplates = data.templates.filter(
            (template: Template) => data.recommendedTemplateIds.includes(template.id)
          );
          setTemplates(filteredTemplates.length > 0 ? filteredTemplates : data.templates);
        }
        
        // End the function early since we've already set the messages
        return;
      }
      
      let botResponse = data.response;
      let recommendedTemplateIds = data.recommendedTemplateIds || [];

      // Add bot response to chat
      const botMessage: Message = {
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update available templates if they were returned
      if (data.templates && Array.isArray(data.templates)) {
        if (recommendedTemplateIds.length > 0) {
          // Filter to show only the recommended templates
          const filteredTemplates = data.templates.filter(
            (template: Template) => recommendedTemplateIds.includes(template.id)
          );
          setTemplates(filteredTemplates.length > 0 ? filteredTemplates : data.templates);
        } else {
          setTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error("ChatBot error:", error);
      toast({
        title: "Error",
        description: "Unable to reach chatbot service. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    // Track template selection with HubSpot if user consented
    const hasConsented = localStorage.getItem('cookieConsent') === 'true';
    if (hasConsented) {
      trackEvent(Events.DOCUMENT_CREATED, {
        templateId,
        source: 'chatbot',
        timestamp: new Date().toISOString()
      });
    }
    
    navigate(`/document-selection?template=${templateId}`);
  };
  
  // Quick prompt helper function
  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <Card className={`flex flex-col ${isModal ? "w-full max-w-md h-[500px]" : "w-full h-[600px]"}`}>
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-primary text-lg flex items-center">
            <BookOpen className="h-5 w-5 mr-2" /> 
            Canadian Legal Assistant
          </CardTitle>
          {isModal && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-secondary">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      {/* Quick Prompts */}
      {messages.length <= 2 && !isSending && (
        <div className="p-3 border-t bg-muted/10">
          <p className="text-xs font-medium mb-2">Common Canadian legal scenarios:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => handleQuickPrompt("My landlord wants to increase my rent by 15% in Toronto, Ontario.")}>
              <MapPin className="h-3 w-3 mr-1" /> Rent increase in Ontario
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => handleQuickPrompt("Children's Aid Society visited my child at school without my permission in Quebec.")}>
              <Info className="h-3 w-3 mr-1" /> CAS school visit
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => handleQuickPrompt("I found errors on my Equifax credit report and want to dispute them.")}>
              Credit report errors
            </Badge>
          </div>
        </div>
      )}
      
      {/* Recommended Templates */}
      {templates.length > 0 && (
        <div className="p-3 border-t border-b bg-muted/30">
          <p className="text-xs font-medium mb-2">Recommended templates:</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Badge
                key={template.id}
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => handleTemplateSelect(template.id)}
              >
                {template.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal question..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            size="icon"
            disabled={!input.trim() || isSending}
            onClick={handleSend}
            className="aspect-square"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}