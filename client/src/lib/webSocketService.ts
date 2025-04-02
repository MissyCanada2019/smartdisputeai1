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
  private maxReconnectAttempts = 10; // Increase max attempts
  private reconnectInterval = 1000; // Start with 1 second
  private failedConnectionAttempts = 0; // Track failed connection attempts separately
  private maxConsecutiveFailures = 3; // Number of consecutive failures before showing warning
  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();

  constructor() {
    // Initialize the message callback map
    Object.values(MessageType).forEach(type => {
      this.messageCallbacks.set(type, new Set());
    });
  }

  // Connect to the WebSocket server
  connect() {
    // If we already have an open connection, don't create a new one
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }
    
    // If the socket exists but isn't open, disconnect it first
    if (this.socket && (this.socket.readyState === WebSocket.CLOSING || this.socket.readyState === WebSocket.CLOSED)) {
      // We want to keep the reconnection state when reconnecting
      this.disconnect(true);
    }

    try {
      // Always use ws protocol regardless of page protocol to avoid SSL issues
      // This is a development-friendly approach
      const protocol = "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log("Connecting to WebSocket using URL:", wsUrl);
      
      // Create new WebSocket connection
      this.socket = new WebSocket(wsUrl);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      console.log("WebSocket connecting to", wsUrl);
      
      // Don't reset reconnect attempts here (keep the counter)
      // It gets reset in handleOpen when connection is successful
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.failedConnectionAttempts++;
      
      // Try to reconnect after a delay if there was an error
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        // Calculate backoff time using exponential strategy
        const backoffTime = Math.min(30000, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
        
        console.log(`Connection failed. Retrying in ${backoffTime}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        
        setTimeout(() => {
          this.connect();
        }, backoffTime);
      } else {
        console.warn("Maximum reconnect attempts reached. WebSocket will not reconnect automatically.");
        
        // Notify about connection failure
        const callbacks = this.messageCallbacks.get(MessageType.SYSTEM_NOTIFICATION);
        if (callbacks) {
          const message: WebSocketMessage = {
            type: MessageType.SYSTEM_NOTIFICATION,
            message: "Failed to establish a connection. Please refresh the page to try again.",
            timestamp: new Date(),
            status: "failed"
          };
          callbacks.forEach(callback => callback(message));
        }
      }
    }
  }

  // Identify the user to associate the connection with a user ID
  identify(userId: number, maxAttempts = 5) {
    if (!this.socket) {
      console.warn("Cannot identify - No WebSocket instance");
      return;
    }

    if (this.socket.readyState === WebSocket.CONNECTING) {
      // If the socket is still connecting, wait and try again
      if (maxAttempts > 0) {
        setTimeout(() => this.identify(userId, maxAttempts - 1), 500);
      }
      return;
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot identify - WebSocket not open, current state:", this.socket.readyState);
      // Try to reconnect if socket is closed or closing
      if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
        this.connect();
        if (maxAttempts > 0) {
          setTimeout(() => this.identify(userId, maxAttempts - 1), 1000);
        }
      }
      return;
    }

    try {
      const message = {
        type: MessageType.IDENTIFY,
        userId,
        timestamp: new Date()
      };

      this.socket.send(JSON.stringify(message));
      console.log("User identified with WebSocket, userId:", userId);
    } catch (error) {
      console.error("Error sending identify message:", error);
    }
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
  disconnect(keepReconnectState = false) {
    if (this.socket) {
      // Clear event handlers first to prevent reconnection attempts
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.close();
      this.socket = null;
      
      // Conditionally reset reconnect attempts
      if (!keepReconnectState) {
        this.reconnectAttempts = 0;
      }
      
      console.log("WebSocket disconnected");
    }
  }
  
  // Explicitly attempt to reconnect
  forceReconnect() {
    // First disconnect but keep the reconnect state
    this.disconnect(true);
    
    // Then immediately try to connect again
    setTimeout(() => {
      this.connect();
    }, 100);
  }

  // Handle WebSocket open event
  private handleOpen(event: Event) {
    console.log("WebSocket connected", event);
    // Reset counters on successful connection
    this.reconnectAttempts = 0;
    this.failedConnectionAttempts = 0;
    
    // Broadcast system status to any subscribed components
    const callbacks = this.messageCallbacks.get(MessageType.SYSTEM_NOTIFICATION);
    if (callbacks) {
      const message: WebSocketMessage = {
        type: MessageType.SYSTEM_NOTIFICATION,
        message: "Real-time connection established",
        timestamp: new Date(),
        status: "connected"
      };
      callbacks.forEach(callback => callback(message));
    }
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
    
    // Broadcast disconnection status to any subscribed components
    const callbacks = this.messageCallbacks.get(MessageType.SYSTEM_NOTIFICATION);
    if (callbacks) {
      const message: WebSocketMessage = {
        type: MessageType.SYSTEM_NOTIFICATION,
        message: "Real-time connection lost. Attempting to reconnect...",
        timestamp: new Date(),
        status: "disconnected"
      };
      callbacks.forEach(callback => callback(message));
    }
    
    // Attempt to reconnect with exponential backoff if not at max attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      // Calculate backoff time using exponential strategy (1s, 2s, 4s, 8s, etc.)
      const backoffTime = Math.min(30000, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}) in ${backoffTime}ms...`);
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.connect();
      }, backoffTime);
    } else {
      console.warn("Maximum reconnect attempts reached. WebSocket will not reconnect automatically.");
      
      // Final notification about no more automatic reconnects
      if (callbacks) {
        const message: WebSocketMessage = {
          type: MessageType.SYSTEM_NOTIFICATION,
          message: "Unable to establish a connection. Please refresh the page to try again.",
          timestamp: new Date(),
          status: "failed"
        };
        callbacks.forEach(callback => callback(message));
      }
    }
  }

  // Handle WebSocket error event
  private handleError(event: Event) {
    console.error("WebSocket error:", event);
    this.failedConnectionAttempts++;
    
    // If we have multiple consecutive errors, notify the user
    if (this.failedConnectionAttempts >= this.maxConsecutiveFailures) {
      const callbacks = this.messageCallbacks.get(MessageType.SYSTEM_NOTIFICATION);
      if (callbacks) {
        const message: WebSocketMessage = {
          type: MessageType.SYSTEM_NOTIFICATION,
          message: "Having trouble maintaining a connection to the server. This may affect real-time updates.",
          timestamp: new Date(),
          status: "error"
        };
        callbacks.forEach(callback => callback(message));
      }
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Function to create a notification handler that uses the toast system
export const useWebSocketNotifications = (toast: any) => {
  const handleNotification = (message: WebSocketMessage) => {
    let title = "Notification";
    let description = message.message || "You have a new notification";
    let variant: "default" | "destructive" | null = null;
    let duration = 5000;
    
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
        variant = "destructive";
        break;
        
      case MessageType.CHATBOT_RESPONSE:
        title = "New Message";
        description = "You have a new message from the legal assistant.";
        break;
        
      case MessageType.SYSTEM_NOTIFICATION:
        // Handle system status notifications
        if (message.status === "error" || message.status === "failed") {
          title = "Connection Issue";
          variant = "destructive";
          duration = 10000; // Show errors for longer
        } else if (message.status === "disconnected") {
          title = "Connection Lost";
          // Use default variant for disconnection
        } else if (message.status === "connected") {
          title = "Connected";
          duration = 3000; // Show brief connection confirmation
        }
        break;
    }
    
    // Show toast notification with appropriate variant
    toast({
      title,
      description,
      duration,
      variant: variant || "default",
    });
  };
  
  return handleNotification;
};

export default webSocketService;