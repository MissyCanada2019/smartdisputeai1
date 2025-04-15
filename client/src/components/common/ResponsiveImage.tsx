import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

/**
 * ResponsiveImage component that uses srcSet for responsive images
 * 
 * @param src - The source path to the image
 * @param alt - Alt text for the image
 * @param className - Optional CSS class
 * @param width - Optional width
 * @param height - Optional height
 * @param sizes - Optional sizes attribute for responsive images
 * @param loading - Optional loading strategy ('lazy' or 'eager')
 * @param priority - Whether this is a high priority image
 */
export default function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
}: ResponsiveImageProps) {
  // Extract the base URL and extension
  const extension = src.split('.').pop()?.toLowerCase() || '';
  const baseUrl = src.substring(0, src.lastIndexOf('.'));
  
  // Get file extension
  const isWebpSupported = extension === 'webp';
  
  // Common image styles to ensure faces aren't cropped
  const imgClasses = `${className || ''} object-contain`;
  const imgStyle = { maxWidth: '100%', objectFit: 'contain' as const };

  // If the image is already WebP, use it directly
  if (isWebpSupported) {
    return (
      <img
        src={src}
        alt={alt}
        className={imgClasses}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        sizes={sizes}
        style={imgStyle}
      />
    );
  }
  
  // For other image types, provide WebP with fallback
  const webpSrc = `/images/optimized/${baseUrl.split('/').pop()}.webp`;
  
  // Create srcSet for different viewport widths (responsive images)
  const srcSets = {
    webp: `${webpSrc} 1x`,
    original: `${src} 1x`
  };
  
  return (
    <picture>
      <source srcSet={srcSets.webp} type="image/webp" sizes={sizes} />
      <source srcSet={srcSets.original} type={`image/${extension}`} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        className={imgClasses}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        sizes={sizes}
        style={imgStyle}
      />
    </picture>
  );
}