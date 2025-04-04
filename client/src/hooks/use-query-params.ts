import { useLocation } from 'wouter';

/**
 * A hook to get and parse query parameters from the URL
 * @returns An object with the query parameters
 */
export function useQueryParams() {
  const [location] = useLocation();
  
  // Parse query parameters from the URL
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  // Convert to a regular object
  const queryParams: Record<string, string> = {};
  
  params.forEach((value, key) => {
    queryParams[key] = value;
  });
  
  return queryParams;
}