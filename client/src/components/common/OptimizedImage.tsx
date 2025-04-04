import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

/**
 * OptimizedImage component that uses WebP with PNG fallback
 * 
 * @param src - The source path to the PNG image (without extension)
 * @param alt - Alt text for the image
 * @param className - Optional CSS class
 * @param width - Optional width
 * @param height - Optional height
 * @param loading - Optional loading strategy ('lazy' or 'eager')
 * @param priority - Whether this is a high priority image (loads eagerly)
 */
export default function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  priority = false,
}: OptimizedImageProps) {
  // Extract the base URL and extension
  const extension = src.split('.').pop()?.toLowerCase() || '';
  const baseUrl = src.substring(0, src.lastIndexOf('.'));
  
  // Check if WebP version exists - assume it does if we have generated it
  // Otherwise, fallback to original
  const webpPath = `/images/optimized/${baseUrl.split('/').pop()}.webp`;
  const originalPath = src;
  
  // If the source is already WebP, use it directly
  if (extension === 'webp') {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
      />
    );
  }
  
  return (
    <picture>
      <source srcSet={webpPath} type="image/webp" />
      <source srcSet={originalPath} type={`image/${extension}`} />
      <img
        src={originalPath}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
      />
    </picture>
  );
}