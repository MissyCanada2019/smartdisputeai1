import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    onProgress?: (progress: number) => void;
  }
): Promise<Response> {
  // Check if data is FormData and handle it differently
  const isFormData = data instanceof FormData;
  
  // Make sure API requests use the same protocol as the current page
  // to avoid mixed content issues
  let apiUrl = url;
  if (url.startsWith('/')) {
    // Always use relative URLs for API calls to match the current protocol
    apiUrl = url;
  }
  
  // If we have FormData and a progress handler, use XMLHttpRequest instead of fetch
  if (isFormData && options?.onProgress && typeof options.onProgress === 'function') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Handle progress events
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percentComplete);
        }
      });
      
      // Setup completion handlers
      xhr.addEventListener('load', () => {
        try {
          console.log(`XHR request completed with status: ${xhr.status}, responseType: ${xhr.responseType}`);
          
          // Get content type from headers
          const contentType = xhr.getResponseHeader('Content-Type') || 'application/json';
          console.log(`Response Content-Type: ${contentType}`);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            // For successful responses, attempt to create a Response object
            let responseBody;
            let responseData = xhr.response;
            
            // If we have responseText but no parsed response (when responseType is '')
            if (xhr.responseText && (!responseData || responseData === '')) {
              console.log(`Using responseText (length: ${xhr.responseText.length})`);
              // Try to parse as JSON if content type suggests JSON
              if (contentType.includes('application/json')) {
                try {
                  responseData = JSON.parse(xhr.responseText);
                  console.log('Successfully parsed response text as JSON');
                } catch (e) {
                  console.warn('Failed to parse response as JSON despite Content-Type', e);
                  responseData = xhr.responseText;
                }
              } else {
                // Use as text for non-JSON content types
                responseData = xhr.responseText;
              }
            }
            
            // Prepare the response body based on the type of data
            if (typeof responseData === 'object' && responseData !== null) {
              console.log('Creating Response with JSON data');
              responseBody = JSON.stringify(responseData);
            } else if (responseData instanceof Blob) {
              console.log('Creating Response with Blob data');
              responseBody = responseData;
            } else {
              console.log('Creating Response with text data');
              responseBody = String(responseData || '');
            }
            
            // Create the final Response object
            const response = new Response(responseBody, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers({
                'Content-Type': contentType
              })
            });
            
            resolve(response);
          } else {
            // Detailed error logging for non-2xx responses
            console.error(`XHR request failed with status ${xhr.status}: ${xhr.statusText}`);
            
            // Try to extract error details from response
            let errorDetail = '';
            try {
              if (xhr.responseText) {
                errorDetail = xhr.responseText.substring(0, 200);
                if (xhr.responseText.length > 200) errorDetail += '...';
              }
            } catch (e) {
              errorDetail = 'Error details unavailable';
            }
            
            console.error(`Error response body: ${errorDetail}`);
            reject(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        } catch (error) {
          // Log the specific error to help debugging
          console.error('Error processing XHR response:', error);
          reject(error);
        }
      });
      
      xhr.addEventListener('abort', () => {
        console.warn('XHR request was aborted');
        reject(new Error('Request was aborted'));
      });
      
      // Set up error handler logging
      xhr.addEventListener('error', (event) => {
        console.error('XHR network error:', event);
        reject(new Error('Network error occurred'));
      });
      
      // Open and send the request
      xhr.open(method, apiUrl);
      
      // Don't set responseType to allow automatic handling based on Content-Type
      // This helps with text/plain or other non-JSON responses
      xhr.responseType = '';
      
      xhr.withCredentials = true;
      
      console.log(`Sending FormData with ${data instanceof FormData ? (data.getAll('documents')?.length || 0) : 0} document files`);
      if (data instanceof FormData) {
        // More safely check for documents
        const documents = data.getAll('documents');
        if (documents && documents.length > 0) {
          const firstDoc = documents[0];
          if (firstDoc instanceof File) {
            console.log(`First document name: ${firstDoc.name}, type: ${firstDoc.type}, size: ${firstDoc.size} bytes`);
          } else {
            console.log(`First document is not a File object: ${typeof firstDoc}`);
          }
          console.log(`Document count: ${documents.length}`);
        }
        
        // Log all FormData keys for debugging
        console.log('FormData contains keys:');
        for (const key of Array.from(data.keys())) {
          console.log(` - ${key}: ${data.getAll(key).length} values`);
        }
      }
      
      xhr.send(data as FormData);
    });
  }
  
  // Use standard fetch API for non-FormData or when no progress tracking is needed
  const res = await fetch(apiUrl, {
    method,
    // Don't set Content-Type for FormData; browser will set it automatically with the boundary
    headers: data && !isFormData ? { "Content-Type": "application/json" } : {},
    // Don't stringify FormData; pass it directly
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
    // Indicate we want to use CORS mode to avoid SSL issues
    mode: "cors"
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the URL from the queryKey
    let url = queryKey[0] as string;
    
    // Use relative URLs to ensure we stay on the same protocol
    if (url.startsWith('/')) {
      // Leave URL as is to maintain current protocol
      url = url; 
    }
    
    const res = await fetch(url, {
      credentials: "include",
      mode: "cors" // Use CORS mode to avoid SSL issues
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
