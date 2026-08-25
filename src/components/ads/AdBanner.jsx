import { useEffect, useRef, useState, useCallback } from 'react';

const MIN_HEIGHTS = {
  auto: '90px',
  horizontal: '90px',
  vertical: '250px',
  rectangle: '250px',
};

export default function AdBanner({ slot, format = 'auto', className = '', showAds }) {
  const adRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleIntersection = useCallback((entries) => {
    if (entries[0]?.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!showAds) return;

    const node = adRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [showAds, handleIntersection]);

  useEffect(() => {
    if (!isVisible || !showAds) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setHasLoaded(true);
    } catch (err) {
      console.error('AdSense push failed:', err);
    }
  }, [isVisible, showAds]);

  if (!showAds) return null;

  const publisherId = window.ADSENSE_PUBLISHER_ID || 'ca-pub-7808849428453967';
  const minHeight = MIN_HEIGHTS[format] || MIN_HEIGHTS.auto;

  return (
    <div
      ref={adRef}
      className={`rounded-lg border border-gray-100 bg-gray-50/50 overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      <span className="block px-2 pt-1.5 text-[10px] font-medium tracking-wide text-gray-400 uppercase">
        Ad
      </span>

      {isVisible ? (
        <>
          {!hasLoaded && (
            <div
              className="animate-pulse bg-gray-200/60 rounded"
              style={{ height: minHeight }}
            />
          )}
          <ins
            className="adsbygoogle block"
            style={{ display: 'block', minHeight }}
            data-ad-client={publisherId}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </>
      ) : (
        <div
          className="animate-pulse bg-gray-200/60 rounded"
          style={{ height: minHeight }}
        />
      )}
    </div>
  );
}
