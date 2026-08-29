import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';
import { Maximize2 } from 'lucide-react';

// Custom icon factory
const createCustomIcon = (color, number = '', iconClass = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-pin" style="background-color: ${color};">
        ${number ? `<span class="marker-number">${number}</span>` : ''}
        ${iconClass ? `<i class="fa ${iconClass} marker-fa"></i>` : ''}
        ${!number && !iconClass ? `<div class="marker-dot"></div>` : ''}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36]
  });
};

const icons = {
  high:        createCustomIcon('#ef4444', '15'),
  medium1:     createCustomIcon('#f97316', '8'),
  medium2:     createCustomIcon('#f97316', '4'),
  low:         createCustomIcon('#eab308', '9'),
  inProgress1: createCustomIcon('#3b82f6', '3'),
  inProgress2: createCustomIcon('#3b82f6', '7'),
  resolved:    createCustomIcon('#22c55e', '', 'fa-check'),
  camera:      createCustomIcon('#9333ea', '12'),
  streetlight: createCustomIcon('#ef4444', '', 'fa-exclamation'),
};

// Smoothly fly to new centre whenever `center` prop changes
const FlyToLocation = ({ center, zoom }) => {
  const map = useMap();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      map.setView(center, zoom);
      return;
    }
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);

  return null;
};

// Fullscreen helper
const FullscreenButton = () => {
  const map = useMap();
  const handleFullscreen = () => {
    const container = map.getContainer();
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };
  return (
    <div
      className="position-absolute top-0 end-0 m-3 z-map-controls"
      style={{ zIndex: 1000 }}
    >
      <button
        className="btn bg-white shadow-sm rounded-3 p-2 d-flex align-items-center justify-content-center"
        style={{ width: 40, height: 40, border: '1px solid #e2e8f0' }}
        onClick={handleFullscreen}
        title="Fullscreen"
      >
        <Maximize2 size={18} color="#374151" />
      </button>
    </div>
  );
};

const InteractiveMap = ({ center }) => {
  return (
    <div
      className="map-wrapper position-relative rounded-4 overflow-hidden shadow-sm"
      style={{ height: '600px' }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <FlyToLocation center={center} zoom={13} />
        <ZoomControl position="topleft" />

        <TileLayer
          url={`https://api.maptiler.com/maps/${import.meta.env.VITE_MAPTILER_STYLE}/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`}
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          tileSize={512}
          zoomOffset={-1}
          minZoom={1}
        />

        {/* Issue Markers */}
        <Marker position={[center[0] + 0.040, center[1] - 0.060]} icon={icons.high} />
        <Marker position={[center[0] + 0.020, center[1] - 0.030]} icon={icons.medium1} />
        <Marker position={[center[0] - 0.010, center[1] - 0.050]} icon={icons.medium2} />
        <Marker position={[center[0] - 0.070, center[1] - 0.030]} icon={icons.low} />
        <Marker position={[center[0] - 0.050, center[1] - 0.080]} icon={icons.inProgress1} />
        <Marker position={[center[0] + 0.010, center[1] + 0.010]} icon={icons.inProgress2} />
        <Marker position={[center[0] - 0.040, center[1] + 0.080]} icon={icons.resolved} />
        <Marker position={[center[0] + 0.030, center[1] + 0.020]} icon={icons.camera} />

        {/* Popup Marker */}
        <Marker position={[center[0] + 0.025, center[1] + 0.060]} icon={icons.streetlight}>
          <Popup className="custom-popup" maxWidth={300} minWidth={280}>
            <div className="popup-content">
              <div className="popup-img-wrapper mb-2 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Broken Streetlight"
                  style={{ width: '100%', height: 140, objectFit: 'cover' }}
                />
              </div>
              <h6 className="fw-bold mb-1">Broken Streetlight</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">Park Entrance</span>
                <span className="badge bg-warning text-dark" style={{ opacity: 0.85 }}>Medium</span>
              </div>
              <div className="small text-muted mb-1 d-flex align-items-center gap-2">
                <i className="fas fa-map-marker-alt text-danger"></i> Riverside Park
              </div>
              <div className="small text-muted mb-2 d-flex align-items-center gap-2">
                <i className="fas fa-users text-primary"></i> 54 Confirmations
              </div>
              <div className="small fw-semibold text-primary mb-3 d-flex align-items-center gap-2">
                <i className="fas fa-tools"></i> In Progress
              </div>
              <div className="small text-muted mb-3">Reported 2 days ago</div>
              <button className="btn btn-dark w-100 rounded-3 py-2 btn-sm fw-medium">
                View Details
              </button>
            </div>
          </Popup>
        </Marker>

        <FullscreenButton />
      </MapContainer>

      {/* Legend */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3" style={{ zIndex: 1000 }}>
        <div className="bg-white px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-4 map-legend">
          <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }}></span>High</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }}></span>Medium</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }}></span>Low</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }}></span>In Progress</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }}></span>Resolved</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#6b7280' }}></span>Other</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
