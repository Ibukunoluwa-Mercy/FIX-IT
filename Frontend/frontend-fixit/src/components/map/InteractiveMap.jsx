import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize, Camera } from 'lucide-react';

// Custom icons setup
const createCustomIcon = (color, number = '', iconClass = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-pin" style="background-color: ${color};">
        ${number ? `<span class="marker-number">${number}</span>` : ''}
        ${iconClass ? `<i class="fa ${iconClass} marker-fa"></i>` : ''}
        ${!number && !iconClass ? `<div class="marker-dot"></div>` : ''}
      </div>
      <div class="marker-shadow"></div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40]
  });
};

const icons = {
  high: createCustomIcon('#ef4444', '15'), // Red
  medium1: createCustomIcon('#f97316', '8'), // Orange
  medium2: createCustomIcon('#f97316', '4'), // Orange
  low: createCustomIcon('#eab308', '9'), // Yellow
  inProgress1: createCustomIcon('#3b82f6', '3'), // Blue
  inProgress2: createCustomIcon('#3b82f6', '7'), // Blue
  resolved: createCustomIcon('#22c55e', '', 'fa-check'), // Green
  other: createCustomIcon('#6b7280', '', 'fa-camera'), // Grayish
  camera: createCustomIcon('#9333ea', '', 'fa-camera'), // Purple
  highIcon: createCustomIcon('#ef4444', '', 'fa-exclamation'), // Red icon
};

// Component to handle map re-centering
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const InteractiveMap = ({ center }) => {
  return (
    <div className="map-wrapper position-relative rounded-4 overflow-hidden shadow-sm" style={{ height: '600px' }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <ChangeView center={center} zoom={13} />
        
        {/* We use a custom zoom control to match position */}
        <ZoomControl position="topleft" />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Dummy Markers matching the mock */}
        <Marker position={[center[0] + 0.04, center[1] - 0.06]} icon={icons.high}></Marker>
        <Marker position={[center[0] + 0.02, center[1] - 0.03]} icon={icons.medium1}></Marker>
        <Marker position={[center[0] - 0.01, center[1] - 0.05]} icon={icons.medium2}></Marker>
        <Marker position={[center[0] - 0.07, center[1] - 0.03]} icon={icons.low}></Marker>
        <Marker position={[center[0] - 0.05, center[1] - 0.08]} icon={icons.inProgress1}></Marker>
        <Marker position={[center[0] + 0.01, center[1] + 0.01]} icon={icons.inProgress2}></Marker>
        <Marker position={[center[0] - 0.04, center[1] + 0.08]} icon={icons.resolved}></Marker>
        <Marker position={[center[0] + 0.03, center[1] + 0.02]} icon={icons.camera}></Marker>
        
        {/* The specific popup marker */}
        <Marker position={[center[0] + 0.025, center[1] + 0.06]} icon={icons.highIcon}>
          <Popup className="custom-popup" maxWidth={300} minWidth={280}>
            <div className="popup-content">
              <div className="popup-img-wrapper mb-2 rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Broken Streetlight" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              </div>
              <h6 className="fw-bold mb-1">Broken Streetlight</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">Park Entrance</span>
                <span className="badge bg-warning text-dark opacity-75">Medium</span>
              </div>
              
              <div className="small text-muted mb-1 d-flex align-items-center gap-2">
                <i className="fas fa-map-marker-alt"></i> Riverside Park
              </div>
              <div className="small text-muted mb-2 d-flex align-items-center gap-2">
                <i className="fas fa-users"></i> 54 Confirmations
              </div>
              
              <div className="small fw-semibold text-primary mb-3 d-flex align-items-center gap-2">
                <i className="fas fa-tools"></i> In Progress
              </div>
              
              <div className="small text-muted mb-3">Reported 2 days ago</div>
              
              <button className="btn btn-dark w-100 rounded-3 py-2 btn-sm fw-medium">View Details</button>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Map UI Overlays */}
      <div className="position-absolute top-0 end-0 m-3 z-3 d-flex gap-2">
        <button className="btn btn-white shadow-sm rounded-3 p-2 bg-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
          <Maximize size={18} />
        </button>
      </div>

      {/* Legend Overlay at Bottom */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 z-3">
        <div className="bg-white px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-4 map-legend">
          <div className="legend-item"><span className="legend-dot bg-danger"></span> High</div>
          <div className="legend-item"><span className="legend-dot bg-warning"></span> Medium</div>
          <div className="legend-item"><span className="legend-dot bg-warning-subtle"></span> Low</div>
          <div className="legend-item"><span className="legend-dot bg-primary"></span> In Progress</div>
          <div className="legend-item"><span className="legend-dot bg-success"></span> Resolved</div>
          <div className="legend-item"><span className="legend-dot bg-secondary"></span> Other</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
