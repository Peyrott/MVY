import { useState, useCallback } from 'react';

/**
 * @typedef {Object} GeolocationState
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {string|null} error
 * @property {boolean} loading
 */

/**
 * Hook to get user geolocation
 * @returns {{
 *   location: GeolocationState,
 *   getLocation: () => void,
 *   clearError: () => void
 * }}
 */
export function useGeolocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
    loading: false
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocalização não é suportada pelo seu navegador'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false
        });
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo esgotado ao obter localização';
            break;
        }
        setLocation(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  const clearError = useCallback(() => {
    setLocation(prev => ({ ...prev, error: null }));
  }, []);

  return {
    location,
    getLocation,
    clearError
  };
}

export default useGeolocation;
