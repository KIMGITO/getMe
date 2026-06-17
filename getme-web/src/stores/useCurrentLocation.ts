import { useState, useEffect } from 'react';

interface LocationState {
  city: string;
  country: string;
  loading: boolean;
  error: boolean;
  lat: number;
  lng: number;
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<LocationState>({
    city: 'Nairobi', 
    country: 'Kenya',
    loading: true,
    error: false,
    lat: -1.286389,
    lng: 36.817223,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, loading: false, error: true }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Hit OpenStreetMap's free reverse geocoding node
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            // Pick the best available spatial token from the API matrix
            const city = data.address.city || data.address.town || data.address.suburb || 'Nairobi';
            const country = data.address.country || 'Kenya';

            setLocation({ city, country, loading: false, error: false, lat: latitude, lng: longitude });
          } else {
            throw new Error('Invalid coordinates resolve');
          }
        } catch (err) {
          setLocation((prev) => ({ ...prev, loading: false, error: true }));
        }
      },
      (error) => {
        // Triggers if user denies location permissions across the prompt wire
        setLocation((prev) => ({ ...prev, loading: false, error: true }));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return location;
}