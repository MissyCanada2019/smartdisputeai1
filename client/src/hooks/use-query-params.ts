import { useLocation } from 'wouter';

/**
 * A hook to get and parse query parameters from the URL
 * @returns Object with query parameter helpers
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
  
  /**
   * Get a specific query parameter by its key
   * @param key The parameter key to look for
   * @returns The parameter value or undefined if not found
   */
  const getParam = (key: string): string | undefined => {
    return queryParams[key];
  };
  
  return {
    queryParams,
    getParam,
  };
}