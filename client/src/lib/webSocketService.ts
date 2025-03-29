// WebSocket service for real-time notifications

// Types for messages
export interface WebSocketMessage {
  type: string;
  message?: string;
  timestamp: Date;
  [key: string]: any;
}

// Message types
export enum MessageType {
  CONNECTION = "connection",
  IDENTIFY = "identify",
  CHATBOT_RESPONSE = "chatbot_response",
  DOCUMENT_GENERATED = "document_generated",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  SYSTEM_NOTIFICATION = "system_notification",
}

// Callback type for message handlers
type MessageCallback = (message: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();

  constructor() {
    // Initialize the message callback map
    Object.values(MessageType).forEach(type => {
      this.messageCallbacks.set(type, new Set());
    });
  }

  // Connect to the WebSocket server
  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log("WebSocket already connected or connecting");
      return;
    }

    try {
      // Determine the protocol and build the URL
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.socket = new WebSocket(wsUrl);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      console.log("WebSocket connecting to", wsUrl);
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
    }
  }

  // Identify the user to associate the connection with a user ID
  identify(userId: number) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot identify - WebSocket not connected");
      return;
    }

    const message = {
      type: MessageType.IDENTIFY,
      userId,
      timestamp: new Date()
    };

    this.socket.send(JSON.stringify(message));
  }

  // Subscribe to a specific message type
  subscribe(messageType: MessageType, callback: MessageCallback) {
    const callbacks = this.messageCallbacks.get(messageType) || new Set();
    callbacks.add(callback);
    this.messageCallbacks.set(messageType, callbacks);

    return () => {
      // Return unsubscribe function
      const callbacks = this.messageCallbacks.get(messageType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      // Clear event handlers first to prevent reconnection attempts
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
      this.reconnectAttempts = 0;
      console.log("WebSocket disconnected");
    }
  }

  // Handle WebSocket open event
  private handleOpen(event: Event) {
    console.log("WebSocket connected", event);
    this.reconnectAttempts = 0;
  }

  // Handle WebSocket message event
  private handleMessage(event: MessageEvent) {
    try {
      // Parse the message data
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Convert timestamp string to Date object if needed
      if (message.timestamp && typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }

      // Call the appropriate callbacks
      const callbacks = this.messageCallbacks.get(message.type);
      if (callbacks) {
        callbacks.forEach(callback => callback(message));
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent) {
    console.log("WebSocket closed:", event.code, event.reason);
    
    // Attempt to reconnect if the close wasn't intentional
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.warn("Maximum reconnect attempts reached. WebSocket will not reconnect automatically.");
    }
  }

  // Handle WebSocket error event
  private handleError(event: Event) {
    console.error("WebSocket error:", event);
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Function to create a notification handler that uses the toast system
export const useWebSocketNotifications = (toast: any) => {
  const handleNotification = (message: WebSocketMessage) => {
    let title = "Notification";
    let description = message.message || "You have a new notification";
    
    // Customize based on message type
    switch (message.type) {
      case MessageType.DOCUMENT_GENERATED:
        title = "Document Generated";
        description = `Your document "${message.templateName}" is ready for download.`;
        break;
        
      case MessageType.PAYMENT_SUCCESS:
        title = "Payment Successful";
        description = "Your payment has been successfully processed.";
        break;
        
      case MessageType.PAYMENT_FAILED:
        title = "Payment Failed";
        description = "Your payment could not be processed. Please try again.";
        break;
        
      case MessageType.CHATBOT_RESPONSE:
        title = "New Message";
        description = "You have a new message from the legal assistant.";
        break;
    }
    
    // Show toast notification
    toast({
      title,
      description,
      duration: 5000,
    });
  };
  
  return handleNotification;
};

export default webSocketService;