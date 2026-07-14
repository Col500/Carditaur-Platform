import React, { useState, useEffect, useRef } from "react";

interface ScalingIframeProps {
  src: string;
  width: number;
  height: number;
  className?: string;
}

export function ScalingIframe({ src, width, height, className = "" }: ScalingIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setDimensions({
        w: el.clientWidth,
        h: el.clientHeight
      });
    };

    update();

    // ResizeObserver tracks container resize reactively
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Compute the exact scale factor to fit inside container
  const scale = dimensions.w > 0 && dimensions.h > 0 
    ? Math.min(dimensions.w / width, dimensions.h / height) 
    : 1;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}
    >
      <iframe
        title="Scaling Flyer Preview"
        src={src}
        className="pointer-events-none absolute"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
          top: "50%",
          left: "50%",
          border: "none",
        }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
