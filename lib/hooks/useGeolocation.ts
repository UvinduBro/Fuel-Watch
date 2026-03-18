import { useState, useEffect } from "react";

export interface Coordinates {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const newLat = position.coords.latitude;
      const newLng = position.coords.longitude;

      // Distance check to prevent jitter (Haversine formula)
      const R = 6371e3; // meters
      const lat1 = (location?.lat || 0) * Math.PI / 180;
      const lat2 = newLat * Math.PI / 180;
      const dLat = (newLat - (location?.lat || 0)) * Math.PI / 180;
      const dLon = (newLng - (location?.lng || 0)) * Math.PI / 180;

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Only update if moved more than 5 meters or if it's the first fix
      if (!location || distance > 5) {
        setLocation({ lat: newLat, lng: newLng });
        setError(null);
        setLoading(false);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      // Don't stop loading on the first timeout if we're just waiting for better signal
      if (err.code !== err.TIMEOUT) {
        setError(err.message);
        setLoading(false);
      }
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // Also do a one-time check for immediate results
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error, loading };
}
