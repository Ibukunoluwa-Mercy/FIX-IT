import React, { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icon
export const defaultIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="marker-pin" style="background-color: #ea580c;">
      <div class="marker-dot"></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Nearby report icon
export const nearbyIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="marker-pin" style="background-color: #3b82f6;">
      <div class="marker-dot" style="background-color: white;"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -32],
});

// Component to handle smooth flying to new locations
export const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// Component to capture map clicks and update marker
export const MapClickCapture = ({ onLocationSelected }) => {
  const map = useMap();
  useEffect(() => {
    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelected(lat, lng);
    };
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationSelected]);
  return null;
};

// Draggable Marker Component
export const DraggableMarker = ({ position, onDragEnd }) => {
  const markerRef = useRef(null);
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={defaultIcon}
    />
  );
};
