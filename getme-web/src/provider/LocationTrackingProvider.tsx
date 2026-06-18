// src/providers/LocationTrackingProvider.tsx
import React, { createContext, useEffect, useRef } from 'react';
// Assuming you use your Zustand store or an auth state to check if the rider is online
import { useRiderStore } from '@/store/useRiderStore'; 
import axios from 'axios';
import { apiClient } from '@/services/apiClient';

export const LocationTrackingContext = createContext(null);

export function LocationTrackingProvider({ children }: { children: React.ReactNode }) {
  // Let's assume your Zustand store tracks if the rider flipped the "Go Online" switch
  const isOnline = useRiderStore((state) => state.isOnline); 
  const lastUpdateTime = useRef<number>(0);
  const TIME_THRESHOLD = 5000; // 5 seconds

  useEffect(() => {
    // If rider is off-duty, do absolutely nothing
    if (!isOnline || !('geolocation' in navigator)) return;

    console.log("🌎 Global Tracking Activated");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentTime = Date.now();
        if (currentTime - lastUpdateTime.current >= TIME_THRESHOLD) {
          
          apiClient.post('/rider/location',{
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          }).then(res => console.log(res)).catch(err => console.error("Failed to update your location", err));

          lastUpdateTime.current = currentTime;
        }
      },
      (error) => console.error("Global GPS Error:", error.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // This only fires if the user logs out or flips the "Go Offline" switch
    return () => {
      console.log("Global Tracking Deactivated");
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline]);

  return (
    <LocationTrackingContext.Provider value={null}>
      {children}
    </LocationTrackingContext.Provider>
  );
}