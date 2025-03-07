'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ src, alt, fallback, size = 'md' }: AvatarProps) {
  const [error, setError] = useState(false);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full bg-gray-200 ${sizeClasses[size]}`}>
      {src && !error ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-500 text-white font-medium">
          {fallback.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
} 