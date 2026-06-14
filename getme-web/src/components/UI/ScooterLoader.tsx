import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import animationData from '@/assets/branding/scooter-loader.json'; // Adjusted path mapping alias

interface ScooterLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

const ScooterLoader: React.FC<ScooterLoaderProps> = ({ size = 'md' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  const dimensions = {
    sm: { lottieSize: 60 },
    md: { lottieSize: 140 },
    lg: { lottieSize: 160 },
    hero: { lottieSize: '100%' },
  };

  const current = dimensions[size];

  useEffect(() => {
    if (containerRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div
        ref={containerRef}
        style={{
          width: current.lottieSize,
          height: current.lottieSize,
        }}
        // Using utility classes for responsive sizing and scaling SVGs cleanly
        className="relative z-10 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:mx-auto"
      />
    </div>
  );
};

export default ScooterLoader;