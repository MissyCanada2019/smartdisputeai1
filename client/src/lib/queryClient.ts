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
): Promise<Response> {
  // Check if data is FormData and handle it differently
  const isFormData = data instanceof FormData;
  
  // Force HTTP protocol for all API requests in development (avoids SSL issues)
  let apiUrl = url;
  if (window.location.protocol === 'https:' && url.startsWith('/')) {
    // Convert to absolute HTTP URL if needed
    const host = window.location.host;
    apiUrl = `http://${host}${url}`;
  }
  
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
    
    // Force HTTP protocol for all API requests in development (avoids SSL issues)
    if (window.location.protocol === 'https:' && url.startsWith('/')) {
      // Convert to absolute HTTP URL if needed
      const host = window.location.host;
      url = `http://${host}${url}`;
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
