import React, { useState, useEffect } from 'react';

export default function WatermarkPreview({ src, className = "", enableZoom = false, objectFit = "contain" }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({
    transform: 'scale(1)',
    transformOrigin: 'center'
  });

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse w-full h-64 border border-slate-200 dark:border-slate-800">
        <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
          Loading Image Preview...
        </span>
      </div>
    );
  }

  const handleImgError = (e) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc('/wild.jpg');
    }
  };

  const handleMouseMove = (e) => {
    if (!enableZoom) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transform: 'scale(2.5)',
      transformOrigin: `${x}% ${y}%`,
      transition: 'transform 0.05s ease-out'
    });
  };

  const handleMouseLeave = () => {
    if (!enableZoom) return;
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center',
      transition: 'transform 0.15s ease-in-out'
    });
  };

  const handleTouchMove = (e) => {
    if (!enableZoom || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    setZoomStyle({
      transform: 'scale(2.5)',
      transformOrigin: `${x}% ${y}%`,
      transition: 'transform 0.05s ease-out'
    });
  };

  const handleTouchEnd = () => {
    if (!enableZoom) return;
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center',
      transition: 'transform 0.15s ease-in-out'
    });
  };

  const isVideoSrc = src && (
    src.match(/\.(mp4|mov|webm|avi|mkv|m4v|3gp)(\?.*)?$/i) ||
    src.includes('/video/upload/') ||
    src.includes('/video/') ||
    src.includes('video_')
  );

  const fitClass = objectFit === 'cover' 
    ? 'w-full h-full object-cover object-left-top' 
    : 'max-w-full max-h-full w-auto h-auto object-contain mx-auto my-auto';

  return (
    <div 
      className={`relative overflow-hidden w-full h-full flex ${objectFit === 'cover' ? 'items-start justify-start' : 'items-center justify-center'} ${enableZoom && !isVideoSrc ? 'cursor-zoom-in touch-none select-none' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {isVideoSrc ? (
        <video 
          src={src} 
          autoPlay 
          loop 
          muted 
          playsInline 
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          preload="metadata"
          className={`pointer-events-none rounded-xl ${fitClass}`} 
        />
      ) : (
        <img 
          src={currentSrc || '/wild.jpg'} 
          alt="Image Preview" 
          onError={handleImgError}
          style={enableZoom ? zoomStyle : undefined}
          className={`rounded-xl ${fitClass}`} 
        />
      )}
    </div>
  );
}
