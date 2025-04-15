/**
 * Empathetic Loading Animations for Legal Processes
 * 
 * This module provides supportive, context-aware loading animations
 * with empathetic messages for users during legal document processing.
 * 
 * These animations aim to reduce stress and anxiety during wait times
 * while providing meaningful information about the legal process.
 */

// Collection of empathetic messages for different legal contexts
const empatheticMessages = {
  // Document generation context
  documentGeneration: [
    "We're carefully preparing your document with all the details you provided...",
    "Your document is being formatted according to legal standards...",
    "We're making sure your document has all the necessary legal elements...",
    "Taking the time to create a properly formatted document for your needs...",
    "Adding the appropriate legal references for your specific situation..."
  ],
  
  // Document analysis context
  documentAnalysis: [
    "Analyzing your document carefully to identify key legal points...",
    "Looking for important details that could affect your situation...",
    "Examining the legal implications of your document...",
    "Processing your document with care to provide accurate insights...",
    "Taking time to thoroughly understand the legal context of your situation..."
  ],
  
  // Email sending context
  emailSending: [
    "Securely preparing your document to be shared...",
    "Formatting your email with your document attached...",
    "Making sure your document is properly delivered...",
    "Securely packaging your legal document for delivery...",
    "Preparing your email with care to ensure it reaches the recipient..."
  ],
  
  // Payment processing context
  paymentProcessing: [
    "Securely processing your payment information...",
    "Preparing access to your premium legal resources...",
    "Finalizing your payment securely...",
    "Setting up your enhanced legal document services...",
    "Carefully processing your transaction with bank-level security..."
  ],
  
  // General waiting messages (fallback)
  general: [
    "We're working on your request with care...",
    "Taking the time to ensure everything is correct...",
    "Processing your information carefully...",
    "Working on your request, this won't take long...",
    "Almost there, making sure everything is in order..."
  ],
  
  // Supportive messages to intersperse
  supportive: [
    "You're taking an important step in addressing this situation.",
    "We understand legal matters can be stressful. We're here to help.",
    "Taking this step shows you're actively addressing this situation.",
    "Remember, you're not alone in navigating this process.",
    "Many people face similar situations. You're taking positive action."
  ]
};

/**
 * Creates and activates an empathetic loading animation
 * 
 * @param {Object} options Configuration options
 * @param {string} options.targetElementId ID of element to contain the loader
 * @param {string} options.context The loading context (documentGeneration, documentAnalysis, etc.)
 * @param {number} options.duration Expected duration in ms (for progress bar, default: 5000)
 * @param {boolean} options.showProgressBar Whether to show a progress bar (default: true)
 * @param {boolean} options.showSupportiveMessages Whether to include supportive messages (default: true)
 * @param {Function} options.onComplete Callback function when animation completes (optional)
 * @returns {Object} Control object with start(), update() and complete() methods
 */
function createEmpatheticLoader(options) {
  // Default options
  const config = {
    targetElementId: 'loading-container',
    context: 'general',
    duration: 5000,
    showProgressBar: true,
    showSupportiveMessages: true,
    onComplete: null,
    ...options
  };
  
  // Get the target element
  const targetElement = document.getElementById(config.targetElementId);
  if (!targetElement) {
    console.error(`Target element with ID "${config.targetElementId}" not found.`);
    return null;
  }
  
  // Store original content to restore later if needed
  const originalContent = targetElement.innerHTML;
  
  // Initialize variables
  let animationFrame;
  let startTime;
  let progressInterval;
  let messageInterval;
  let isRunning = false;
  let contextMessages = empatheticMessages[config.context] || empatheticMessages.general;
  let supportiveMessages = config.showSupportiveMessages ? empatheticMessages.supportive : [];
  let currentMessageIndex = 0;
  
  // Create the loader HTML
  const loaderHTML = `
    <div class="empathetic-loader">
      <div class="loader-animation">
        <div class="pulse-circle"></div>
        <div class="scale-symbol">⚖️</div>
      </div>
      <div class="message-area">
        <p id="${config.targetElementId}-message" class="primary-message">${contextMessages[0]}</p>
        ${config.showSupportiveMessages ? `<p id="${config.targetElementId}-supportive" class="supportive-message">${supportiveMessages[0]}</p>` : ''}
      </div>
      ${config.showProgressBar ? `
        <div class="progress-container">
          <div id="${config.targetElementId}-progress" class="progress-bar"></div>
        </div>
      ` : ''}
    </div>
  `;
  
  // Function to rotate through messages
  const updateMessage = () => {
    const messageElement = document.getElementById(`${config.targetElementId}-message`);
    if (messageElement) {
      currentMessageIndex = (currentMessageIndex + 1) % contextMessages.length;
      
      // Fade out
      messageElement.style.opacity = 0;
      
      // Change text and fade back in after transition
      setTimeout(() => {
        messageElement.textContent = contextMessages[currentMessageIndex];
        messageElement.style.opacity = 1;
      }, 300);
    }
    
    // Update supportive message if enabled (less frequently)
    if (config.showSupportiveMessages && Math.random() > 0.7) {
      const supportiveElement = document.getElementById(`${config.targetElementId}-supportive`);
      if (supportiveElement) {
        const randomSupportIndex = Math.floor(Math.random() * supportiveMessages.length);
        
        // Fade out
        supportiveElement.style.opacity = 0;
        
        // Change text and fade back in after transition
        setTimeout(() => {
          supportiveElement.textContent = supportiveMessages[randomSupportIndex];
          supportiveElement.style.opacity = 1;
        }, 300);
      }
    }
  };
  
  // Function to update progress bar
  const updateProgress = (elapsed) => {
    if (!config.showProgressBar) return;
    
    const progressBar = document.getElementById(`${config.targetElementId}-progress`);
    if (!progressBar) return;
    
    const percentage = Math.min(elapsed / config.duration * 100, 100);
    progressBar.style.width = `${percentage}%`;
    
    // Add pulse animation when near completion
    if (percentage > 80 && percentage < 95) {
      progressBar.classList.add('near-complete');
    } else if (percentage >= 95) {
      progressBar.classList.remove('near-complete');
      progressBar.classList.add('complete');
    }
  };
  
  // Animation loop
  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    
    updateProgress(elapsed);
    
    if (elapsed < config.duration) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Auto-complete if duration is reached
      if (isRunning) {
        complete();
      }
    }
  };
  
  // Start the loader
  const start = () => {
    if (isRunning) return;
    
    // Add CSS if not already added
    if (!document.getElementById('empathetic-loader-css')) {
      const style = document.createElement('style');
      style.id = 'empathetic-loader-css';
      style.textContent = `
        .empathetic-loader {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }
        .loader-animation {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }
        .pulse-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: rgba(108, 99, 255, 0.2);
          animation: pulse 1.5s ease-in-out infinite;
        }
        .scale-symbol {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 30px;
          animation: bounce 1.5s ease-in-out infinite;
        }
        .message-area {
          margin: 15px 0;
          min-height: 80px;
        }
        .primary-message {
          font-size: 16px;
          color: #333;
          margin-bottom: 10px;
          transition: opacity 0.3s ease;
        }
        .supportive-message {
          font-size: 14px;
          color: #6C63FF;
          font-style: italic;
          margin-top: 8px;
          transition: opacity 0.3s ease;
        }
        .progress-container {
          height: 6px;
          background-color: #eee;
          border-radius: 3px;
          margin-top: 20px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background-color: #6C63FF;
          width: 0;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        .progress-bar.near-complete {
          animation: progress-pulse 1s ease-in-out infinite;
        }
        .progress-bar.complete {
          background-color: #4CAF50;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Set the content
    targetElement.innerHTML = loaderHTML;
    
    // Start animation
    startTime = null;
    animationFrame = requestAnimationFrame(animate);
    
    // Set intervals for message updates
    messageInterval = setInterval(updateMessage, 3500);
    
    isRunning = true;
    
    return this;
  };
  
  // Update loader with new progress or messages
  const update = (data) => {
    if (!isRunning) return;
    
    if (data.percentage !== undefined && config.showProgressBar) {
      const progressBar = document.getElementById(`${config.targetElementId}-progress`);
      if (progressBar) {
        const percentage = Math.max(0, Math.min(100, data.percentage));
        progressBar.style.width = `${percentage}%`;
        
        // Cancel animation frame since we're manually controlling progress
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    }
    
    if (data.message) {
      const messageElement = document.getElementById(`${config.targetElementId}-message`);
      if (messageElement) {
        // Fade out
        messageElement.style.opacity = 0;
        
        // Change text and fade back in
        setTimeout(() => {
          messageElement.textContent = data.message;
          messageElement.style.opacity = 1;
        }, 300);
      }
    }
    
    if (data.supportiveMessage && config.showSupportiveMessages) {
      const supportiveElement = document.getElementById(`${config.targetElementId}-supportive`);
      if (supportiveElement) {
        // Fade out
        supportiveElement.style.opacity = 0;
        
        // Change text and fade back in
        setTimeout(() => {
          supportiveElement.textContent = data.supportiveMessage;
          supportiveElement.style.opacity = 1;
        }, 300);
      }
    }
    
    return this;
  };
  
  // Complete the loading animation
  const complete = (completeMessage) => {
    if (!isRunning) return;
    
    // Clear intervals and cancel animation frame
    clearInterval(messageInterval);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    // Update progress to 100%
    if (config.showProgressBar) {
      const progressBar = document.getElementById(`${config.targetElementId}-progress`);
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.classList.remove('near-complete');
        progressBar.classList.add('complete');
      }
    }
    
    // Show completion message if provided
    if (completeMessage) {
      const messageElement = document.getElementById(`${config.targetElementId}-message`);
      if (messageElement) {
        messageElement.textContent = completeMessage;
      }
      
      // Clear supportive message
      if (config.showSupportiveMessages) {
        const supportiveElement = document.getElementById(`${config.targetElementId}-supportive`);
        if (supportiveElement) {
          supportiveElement.textContent = "Thank you for your patience.";
        }
      }
    }
    
    // Set a timeout to allow the user to see the completed state
    setTimeout(() => {
      // If there's a completion callback, call it
      if (typeof config.onComplete === 'function') {
        config.onComplete();
      }
    }, 1000);
    
    isRunning = false;
    
    return this;
  };
  
  // Reset the loader
  const reset = () => {
    targetElement.innerHTML = originalContent;
    isRunning = false;
    
    return this;
  };
  
  // Return the control object
  return {
    start,
    update,
    complete,
    reset
  };
}

// Expose functions to the global scope
window.EmpatheticLoading = {
  create: createEmpatheticLoader,
  messageTypes: Object.keys(empatheticMessages)
};