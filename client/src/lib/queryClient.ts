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
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json'
          })
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(new Error(`Request failed with status ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Request was aborted'));
      });
      
      // Open and send the request
      xhr.open(method, apiUrl);
      xhr.responseType = 'blob';
      xhr.withCredentials = true;
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
