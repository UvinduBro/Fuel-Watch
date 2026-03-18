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
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
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
