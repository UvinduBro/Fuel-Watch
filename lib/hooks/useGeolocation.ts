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

      // Only update if location hasn't been set yet, OR if user has moved > 10 meters
      setLocation(prev => {
        if (!prev) return { lat: newLat, lng: newLng };
        
        const R = 6371e3; // metres
        const φ1 = prev.lat * Math.PI/180;
        const φ2 = newLat * Math.PI/180;
        const Δφ = (newLat-prev.lat) * Math.PI/180;
        const Δλ = (newLng-prev.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;

        if (d < 10) return prev; // Less than 10m movement, don't trigger re-render
        return { lat: newLat, lng: newLng };
      });
      setError(null);
      setLoading(false);
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
