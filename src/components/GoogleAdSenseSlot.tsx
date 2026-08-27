import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdSenseSlotProps {
  id?: string;
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  width?: number | string;
  height?: number | string;
  title?: string;
}

export function GoogleAdSenseSlot({
  id = 'google-adsense-container',
  adSlot = '7391663215396578',
  adFormat = 'auto',
  className = '',
  width = '100%',
  height = 250,
  title = 'Anuncio Google AdSense'
}: GoogleAdSenseSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !isLoadedRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoadedRef.current = true;
      }
    } catch {
      // Catch AdSense already loaded or adblock errors
    }
  }, []);

  return (
    <div 
      id={id}
      className={`google-adsense-wrapper relative flex flex-col items-center justify-center bg-[#fafafa] border-2 border-dashed border-[#141414]/30 rounded-none overflow-hidden ${className}`}
      style={{ minHeight: typeof height === 'number' ? `${height}px` : height, width: typeof width === 'number' ? `${width}px` : width }}
    >
      {/* Top Label Google Ads */}
      <div className="absolute top-1 right-2 flex items-center gap-1 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest pointer-events-none select-none z-10">
        <span>Google AdSense</span>
      </div>

      {/* AdSense ins tag */}
      <ins
        ref={adRef}
        className="adsbygoogle block w-full h-full text-center"
        style={{ display: 'block', minHeight: typeof height === 'number' ? `${height}px` : height }}
        data-ad-client="ca-pub-7391663215396578"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />

      {/* Placeholder Frame / Cuadrado oficial en caso de que aún no cargue script */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none -z-0">
        <div className="w-8 h-8 rounded-none border border-[#141414] bg-white flex items-center justify-center font-mono font-black text-xs text-[#141414] shadow-[2px_2px_0px_#141414] mb-2">
          Ad
        </div>
        <div className="text-[11px] font-mono font-bold text-gray-600 uppercase">
          {title}
        </div>
        <div className="text-[9px] font-mono text-gray-400 mt-0.5">
          ca-pub-7391663215396578 • Slot: {adSlot}
        </div>
      </div>
    </div>
  );
}
