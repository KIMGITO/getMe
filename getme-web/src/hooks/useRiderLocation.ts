import { useCurrentLocation } from '@/stores/useCurrentLocation';
import { useEffect, useRef } from 'react';

interface TrackingOptions {
  isActive: boolean; 
  onLocationUpdate: (coords: { lat: number; lng: number; heading: number | null; speed: number | null }) => void;
}

export function useRiderLocationSimulated({ isActive, onLocationUpdate }: TrackingOptions) {
  const onLocationUpdateRef = useRef(onLocationUpdate);
  const  {lat, lng} = useCurrentLocation();
  
  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!isActive) return;


    let currentLat = lat;
    let currentLng = lng;
    let currentAngle = 45;

    const MOVEMENT_OFFSET = 0.000345; 
    const ANGLE_OFFSET = Math.random() * 10;

    onLocationUpdateRef.current({
      lat: currentLat,
      lng: currentLng,
      heading: 45,
      speed: 15,
    });

    const intervalId = setInterval(() => {
      currentLat += MOVEMENT_OFFSET;
      currentLng += MOVEMENT_OFFSET;
      currentAngle += ANGLE_OFFSET;

      onLocationUpdateRef.current({
        lat: currentLat,
        lng: currentLng,
        heading: currentAngle,
        speed: 60, 
      });
      
    }, 5000);

    return () => {
      console.log("🛑 Killing SIMULATED GPS stream.");
      clearInterval(intervalId);
    };
  }, [isActive]); 
}




export function useRiderLocation({ isActive, onLocationUpdate }: TrackingOptions) {
  const onLocationUpdateRef = useRef(onLocationUpdate);
  const lastUpdateTime = useRef<number>(0);
  
  const TIME_THRESHOLD = 5000;
  
  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!isActive || !('geolocation' in navigator)) return;

    console.log("🚀 Starting real-time GPS ");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentTime = Date.now();

        // Throttling layer: Only fire if the time threshold has elapsed
        if (currentTime - lastUpdateTime.current >= TIME_THRESHOLD) {
          onLocationUpdateRef.current({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading, 
            speed: position.coords.speed,    
          });

          lastUpdateTime.current = currentTime;
        }
      },
      (error) => {
        console.warn("GPS tracking error intercepted:", error.message);
        // Optional: Handle specific error codes (e.g., PERMISSION_DENIED)
      },
      {
        enableHighAccuracy: true, 
        maximumAge: 0,            
        timeout: 10000,          
      }
    );

    // Cleanup: Stop tracking when the rider goes offline or component unmounts
    return () => {
      console.log("🛑 Killing active GPS hardware stream.");
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isActive]); 
}