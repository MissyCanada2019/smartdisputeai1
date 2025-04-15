/**
 * Mobile API Client for SmartDispute.ai
 * This provides the Gx.apiRequest interface expected by some mobile components
 */

/**
 * API Request method that wraps the fetch API
 * 
 * @param url The URL to request
 * @param options Request options (method, body, etc.)
 * @returns Promise with the response
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // Log the request for debugging
    console.log(`Making API request to ${url}`, options);
    
    // Ensure URL starts with a slash if it's a relative URL
    const requestUrl = url.startsWith('http') ? url : url.startsWith('/') ? url : `/${url}`;
    
    // Make the request
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        ...options.headers,
      }
    });
    
    // Log the response status
    console.log(`API response status: ${response.status}`);
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Export the main API interface
const Gx = {
  apiRequest
};

export default Gx;