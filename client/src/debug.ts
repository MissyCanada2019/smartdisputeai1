/**
 * Client-side Debug Utilities for SmartDispute.ai
 * These utilities help with troubleshooting and debugging
 */

// Debug namespace to avoid global clashes
const SmartDisputeDebug = {
  /**
   * Log API client info to help diagnose issues
   */
  logApiClientInfo() {
    console.group('SmartDispute API Client Info');
    
    // Check if we have the Gx global namespace
    console.log('Gx global object:', window.Gx ? 'Available ✅' : 'Missing ❌');
    if (window.Gx) {
      console.log('Gx.apiRequest:', typeof window.Gx.apiRequest === 'function' ? 'Function ✅' : 'Not a function ❌');
    }
    
    // Check if we have the MobileDocumentAnalyzer
    console.log('MobileDocumentAnalyzer:', window.MobileDocumentAnalyzer ? 'Available ✅' : 'Missing ❌');
    if (window.MobileDocumentAnalyzer) {
      console.log('MobileDocumentAnalyzer.analyzeDocument:', 
        typeof window.MobileDocumentAnalyzer.analyzeDocument === 'function' ? 'Function ✅' : 'Not a function ❌');
    }
    
    // Browser environment info
    console.log('User Agent:', navigator.userAgent);
    console.log('Window Inner Width:', window.innerWidth);
    console.log('Window Inner Height:', window.innerHeight);
    console.log('Device Pixel Ratio:', window.devicePixelRatio);
    
    console.groupEnd();
    
    return {
      gxAvailable: !!window.Gx,
      gxApiRequestAvailable: window.Gx && typeof window.Gx.apiRequest === 'function',
      mobileAnalyzerAvailable: !!window.MobileDocumentAnalyzer,
      userAgent: navigator.userAgent,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };
  },
  
  /**
   * Test API request to see if it works
   */
  async testApiRequest(url = '/api/health') {
    console.group('SmartDispute API Request Test');
    
    try {
      // Test using Gx if available
      if (window.Gx && typeof window.Gx.apiRequest === 'function') {
        console.log('Testing with Gx.apiRequest...');
        const start = performance.now();
        const response = await window.Gx.apiRequest(url, { method: 'GET' });
        const elapsed = performance.now() - start;
        console.log(`Gx.apiRequest response status: ${response.status} (${elapsed.toFixed(2)}ms)`);
        
        if (response.ok) {
          console.log('Gx.apiRequest success ✅');
        } else {
          console.error('Gx.apiRequest failed ❌', response.statusText);
        }
      } else {
        console.log('Skipping Gx.apiRequest test (not available)');
      }
      
      // Test using fetch
      console.log('Testing with fetch API...');
      const fetchStart = performance.now();
      const fetchResponse = await fetch(url);
      const fetchElapsed = performance.now() - fetchStart;
      console.log(`fetch response status: ${fetchResponse.status} (${fetchElapsed.toFixed(2)}ms)`);
      
      if (fetchResponse.ok) {
        console.log('fetch success ✅');
      } else {
        console.error('fetch failed ❌', fetchResponse.statusText);
      }
      
      console.log('API Request Test Complete');
    } catch (error) {
      console.error('Error testing API requests:', error);
    }
    
    console.groupEnd();
  }
};

// Export for module use
export default SmartDisputeDebug;

// Add to window for console use
declare global {
  interface Window {
    SmartDisputeDebug: typeof SmartDisputeDebug;
  }
}
window.SmartDisputeDebug = SmartDisputeDebug;