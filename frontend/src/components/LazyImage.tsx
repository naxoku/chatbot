import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  priority?: boolean; // Para imágenes Above the Fold
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video', 
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  aspectRatio,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Las imágenes prioritarias se cargan inmediatamente
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Precargar 50px antes de que la imagen entre en el viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    console.warn(`Error loading image: ${src}`);
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Placeholder mientras carga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Imagen real - solo se renderiza cuando está en vista */}
      {isInView && (
        <img
          {...props}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'hidden'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // Preload para imágenes prioritarias
          {...(priority && { fetchPriority: 'high' })}
        />
      )}

      {/* Fallback para errores */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <div className="text-center">
            <i className="fas fa-image text-2xl mb-2"></i>
            <p className="text-sm">Error al cargar imagen</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;