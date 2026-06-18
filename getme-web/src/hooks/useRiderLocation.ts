import { useEffect, useRef } from 'react';

interface TrackingOptions {
  isActive: boolean; // Turn tracking on/off based on rider duty status
  onLocationUpdate: (coords: { lat: number; lng: number; heading: number | null; speed: number | null }) => void;
}

export function useRiderLocation({ isActive, onLocationUpdate }: TrackingOptions) {
  // Use a ref for lastUpdateTime so its value persists across renders without triggering updates
  const lastUpdateTime = useRef<number>(0);
  const TIME_THRESHOLD = 5000; // 5 seconds

  useEffect(() => {
    // If the rider is off duty or browser doesn't support geolocation, don't do anything
    if (!isActive || !('geolocation' in navigator)) return;

    console.log("🚀 Starting real-time GPS tracking stream...");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentTime = Date.now();

        // Throttling layer: Only fire if 5 seconds have elapsed
        if (currentTime - lastUpdateTime.current >= TIME_THRESHOLD) {
          
          onLocationUpdate({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
          });

          lastUpdateTime.current = currentTime;
        }
      },
      (error) => {
        console.error("GPS Error intercepted:", error.message);
      },
      {
        enableHighAccuracy: true, // Forces phone hardware GPS chip
        maximumAge: 0,            // Prevents pulling cached old positions
        timeout: 10000,           
      }
    );

    // CRITICAL CLEANUP: Shuts down GPS stream when component unmounts or rider goes off-duty
    return () => {
      console.log("Killing active GPS hardware stream.");
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isActive, onLocationUpdate]); // Restarts tracking gracefully if these flags change
}