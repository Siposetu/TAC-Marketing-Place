import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Maps functionality will be disabled.');
      setLoadError('Google Maps API key not configured');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load()
      .then(() => {
        console.log('Google Maps loaded successfully');
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Google Maps loading error:', error);
        setLoadError('Failed to load Google Maps');
      });
  }, []);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!isLoaded || !window.google) {
      console.warn('Google Maps not loaded, cannot geocode address');
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = {
            lat: location.lat(),
            lng: location.lng()
          };
          console.log('Geocoded address:', address, 'to:', coords);
          resolve(coords);
        } else {
          console.warn('Geocoding failed for address:', address, 'Status:', status);
          resolve(null);
        }
      });
    });
  };

  const calculateDistance = (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): number => {
    if (!isLoaded || !window.google) {
      console.warn('Google Maps not loaded, cannot calculate distance');
      return 0;
    }

    const originLatLng = new window.google.maps.LatLng(origin.lat, origin.lng);
    const destLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);
    
    return window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng) / 1000; // km
  };

  return {
    isLoaded,
    loadError,
    geocodeAddress,
    calculateDistance
  };
}

declare global {
  interface Window {
    google: any;
  }
}