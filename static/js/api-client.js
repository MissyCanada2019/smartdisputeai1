/**
 * SmartDispute.ai API Client
 * Handles all API requests for document analysis and other features
 */

// Global API client namespace
const ApiClient = {
  /**
   * Make an API request with error handling and loading state management
   * 
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @param {Function} onSuccess - Success callback function
   * @param {Function} onError - Error callback function
   * @param {HTMLElement} errorElement - Element to display errors in
   * @param {HTMLElement} loadingElement - Element to manage loading state
   */
  request: function(url, options, onSuccess, onError, errorElement, loadingElement) {
    // Show loading state if element provided
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
    
    // Clear any previous errors
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.innerHTML = '';
    }
    
    fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(data);
        }
      })
      .catch(error => {
        console.error("API request failed", error);
        if (errorElement) {
          errorElement.style.display = 'block';
          errorElement.innerHTML = `Analysis failed<br>${error.message}`;
        }
        if (onError && typeof onError === 'function') {
          onError(error);
        }
      })
      .finally(() => {
        // Hide loading state
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
      });
  },
  
  /**
   * Upload and analyze a document
   * 
   * @param {FormData} formData - Form data containing the document and analysis options
   * @param {Function} onSuccess - Success callback function
   * @param {Function} onError - Error callback function
   * @param {HTMLElement} errorElement - Element to display errors in
   * @param {HTMLElement} loadingElement - Element to manage loading state
   */
  analyzeDocument: function(formData, onSuccess, onError, errorElement, loadingElement) {
    this.request(
      "/api/advanced-analysis/upload",
      {
        method: "POST",
        body: formData
      },
      onSuccess,
      onError,
      errorElement,
      loadingElement
    );
  }
};

// Backwards compatibility with any existing Gx.apiRequest calls
const Gx = {
  apiRequest: function(url, options) {
    return fetch(url, options);
  }
};