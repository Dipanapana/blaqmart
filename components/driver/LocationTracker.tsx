'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation, MapPin, AlertCircle } from 'lucide-react';

interface LocationTrackerProps {
  orderId: string;
  isActive: boolean;
}

export default function LocationTracker({ orderId, isActive }: LocationTrackerProps) {
  const [tracking, setTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Check location permission
  useEffect(() => {
    if ('geolocation' in navigator && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as any);
      });
    }
  }, []);

  const updateLocation = useCallback(async () => {
    if (!isActive || !tracking) return;

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Send to API
      const res = await fetch('/api/driver/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          latitude,
          longitude,
        }),
      });

      if (res.ok) {
        setLastUpdate(new Date());
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update location');
      }
    } catch (err: any) {
      if (err.code === 1) {
        setError('Location permission denied');
        setTracking(false);
      } else if (err.code === 2) {
        setError('Location unavailable');
      } else if (err.code === 3) {
        setError('Location request timed out');
      } else {
        setError('Failed to get location');
      }
    }
  }, [orderId, isActive, tracking]);

  // Auto-update location every 30 seconds when tracking is enabled
  useEffect(() => {
    if (!tracking || !isActive) return;

    // Update immediately
    updateLocation();

    // Then update every 30 seconds
    const interval = setInterval(updateLocation, 30000);

    return () => clearInterval(interval);
  }, [tracking, isActive, updateLocation]);

  const handleToggleTracking = async () => {
    if (!tracking) {
      // Request permission and start tracking
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setTracking(true);
        setError('');
      } catch (err: any) {
        if (err.code === 1) {
          setError('Please enable location permissions to track delivery');
        } else {
          setError('Failed to access location');
        }
      }
    } else {
      // Stop tracking
      setTracking(false);
      setLastUpdate(null);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Navigation className={`w-5 h-5 ${tracking ? 'text-green-600' : 'text-gray-400'}`} />
          <h3 className="font-semibold">Location Tracking</h3>
        </div>
        {tracking && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {tracking
          ? 'Your location is being shared with the customer for real-time tracking.'
          : 'Enable location tracking to let customers see your location in real-time.'}
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {lastUpdate && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      )}

      <button
        onClick={handleToggleTracking}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          tracking
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {tracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>

      {locationPermission === 'denied' && !tracking && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Location permission denied. Please enable it in your browser settings.
        </p>
      )}
    </div>
  );
}
