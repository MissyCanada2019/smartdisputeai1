/**
 * Utility functions for optimized resource loading
 */

/**
 * Dynamically load an external JavaScript file
 * 
 * @param url - URL of the script to load
 * @param async - Whether to load the script asynchronously
 * @param defer - Whether to defer loading until after page load
 * @param callback - Optional callback when script loads
 */
export function loadScript(url: string, async = true, defer = true, callback?: () => void): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = url;
  script.async = async;
  script.defer = defer;
  
  if (callback) {
    script.onload = callback;
  }
  
  document.body.appendChild(script);
  return script;
}

/**
 * Preload an image to cache it for future use
 * 
 * @param url - URL of the image to preload
 * @param callback - Optional callback when image loads
 */
export function preloadImage(url: string, callback?: () => void): HTMLImageElement {
  const img = new Image();
  
  if (callback) {
    img.onload = callback;
  }
  
  img.src = url;
  return img;
}

/**
 * Add a preload hint for a critical resource
 * 
 * @param url - URL of the resource to preload
 * @param as - Resource type (script, style, image, font, etc.)
 * @param type - MIME type of the resource
 */
export function addPreloadHint(url: string, as: 'script' | 'style' | 'image' | 'font' | 'fetch', type?: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  
  if (type) {
    link.type = type;
  }
  
  // For font preloading
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Lazy load CSS file only when needed
 * 
 * @param url - URL of the CSS file
 * @param media - Media query for when to load the CSS
 */
export function lazyLoadCSS(url: string, media = 'all'): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.media = 'print';
  link.setAttribute('onload', `this.media='${media}'`);
  
  document.head.appendChild(link);
  return link;
}

/**
 * Extract critical CSS and inject it inline
 * Used at build time, not runtime
 * 
 * @param css - CSS content to inline
 */
export function injectCriticalCSS(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Detect if a resource has already been loaded
 * 
 * @param url - URL of the resource to check
 * @param type - Resource type (script, style, link)
 */
export function isResourceLoaded(url: string, type: 'script' | 'style' | 'link'): boolean {
  let selector: string;
  
  switch (type) {
    case 'script':
      selector = `script[src="${url}"]`;
      break;
    case 'style':
      selector = `style[data-href="${url}"]`;
      break;
    case 'link':
      selector = `link[href="${url}"]`;
      break;
  }
  
  return !!document.querySelector(selector);
}