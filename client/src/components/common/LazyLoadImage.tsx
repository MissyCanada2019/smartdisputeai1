import React, { useState, useEffect, useRef } from 'react';
import OptimizedImage from './OptimizedImage';

interface LazyLoadImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  threshold?: number; // Visibility threshold for loading
  placeholderColor?: string;
}

/**
 * LazyLoadImage component that loads images only when they are about to enter the viewport
 * 
 * @param src - The source path to the image
 * @param alt - Alt text for the image
 * @param className - Optional CSS class
 * @param width - Optional width
 * @param height - Optional height
 * @param threshold - Intersection threshold (0 to 1) when to load the image
 * @param placeholderColor - CSS color for the placeholder
 */
export default function LazyLoadImage({
  src,
  alt,
  className,
  width,
  height,
  threshold = 0.1,
  placeholderColor = '#f3f4f6'
}: LazyLoadImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the image is about to enter the viewport, set it to visible
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '200px' // Start loading 200px before it becomes visible
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold]);
  
  // Handler for image load completion
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <div
      ref={imgRef}
      className={`relative ${className || ''}`}
      style={{
        width: width ? `${width}px` : '100%',
        // Remove fixed height constraint to avoid face cropping issues
        // Use aspect-ratio instead when available
        maxHeight: height ? `${height}px` : 'none',
        aspectRatio: width && height ? `${width} / ${height}` : 'auto',
        backgroundColor: placeholderColor,
        transition: 'opacity 0.3s ease-in-out',
        overflow: 'hidden'
      }}
    >
      {isVisible && (
        <>
          <div
            className="absolute inset-0 bg-gray-200 animate-pulse"
            style={{ opacity: isLoaded ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
          />
          <OptimizedImage
            src={src}
            alt={alt}
            className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 w-full h-auto object-contain`}
            width={width}
            height={height}
            loading="lazy"
            priority={false}
          />
          <img
            src={src}
            alt=""
            className="hidden"
            onLoad={handleImageLoad}
          />
        </>
      )}
    </div>
  );
}