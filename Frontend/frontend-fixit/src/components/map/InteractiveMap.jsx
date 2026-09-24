import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

const COLORS = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#eab308',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
  Other: '#6b7280',
};

const getMarkerColor = (issue) => {
  if (issue.status === 'Resolved') return COLORS.Resolved;
  if (issue.status === 'In Progress') return COLORS['In Progress'];
  return COLORS[issue.severity] || COLORS.Other;
};

const createCustomIcon = (color, number = '', iconClass = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-pin" style="background-color: ${color};">
        ${number ? `<span class="marker-number">${number}</span>` : ''}
        ${iconClass ? `<i class="fa-solid ${iconClass} marker-fa"></i>` : ''}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36]
  });
};

const getIssueIcon = (issue, count = 1) => {
  const iconClass = count === 1
    ? (issue.status === 'Resolved' ? 'fa-check' : 'fa-exclamation')
    : '';
  return createCustomIcon(getMarkerColor(issue), count > 1 ? count : '', iconClass);
};

const userLocationIcon = L.divIcon({
  className: 'community-user-location-marker',
  html: '<span class="community-user-location-dot"><i></i></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const getClusterGroups = (issues) => {
  const groups = [];
  const threshold = 0.008;

  issues.forEach((issue) => {
    const existingGroup = groups.find((group) =>
      Math.abs(group.lat - issue.lat) <= threshold && Math.abs(group.lng - issue.lng) <= threshold
    );
    if (existingGroup) {
      existingGroup.issues.push(issue);
      existingGroup.lat = existingGroup.issues.reduce((sum, item) => sum + item.lat, 0) / existingGroup.issues.length;
      existingGroup.lng = existingGroup.issues.reduce((sum, item) => sum + item.lng, 0) / existingGroup.issues.length;
    } else {
      groups.push({ lat: issue.lat, lng: issue.lng, issues: [issue] });
    }
  });

  return groups;
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
        <i className="fa-solid fa-expand" style={{ fontSize: 16, color: '#374151' }}></i>
      </button>
    </div>
  );
};

const MapModeButton = ({ satellite, onToggle }) => (
  <button className="map-mode-button" type="button" onClick={onToggle} title={satellite ? 'Show map' : 'Show satellite'}>
    <i className={`fa-solid ${satellite ? 'fa-map' : 'fa-satellite'}`} />
    <span>{satellite ? 'Map' : 'Satellite'}</span>
  </button>
);

const ClusterMarker = ({ group }) => {
  const map = useMap();
  const representative = group.issues[0];
  const icon = getIssueIcon(representative, group.issues.length);

  if (group.issues.length === 1) {
    return (
      <Marker position={[group.lat, group.lng]} icon={icon}>
        <IssuePopup issue={representative} />
      </Marker>
    );
  }

  return (
    <Marker
      position={[group.lat, group.lng]}
      icon={icon}
      eventHandlers={{ click: () => map.setView([group.lat, group.lng], Math.min(map.getZoom() + 2, 18)) }}
      title={`${group.issues.length} reported issues`}
    />
  );
};

const IssuePopup = ({ issue }) => (
  <Popup className="custom-popup" maxWidth={300} minWidth={260}>
    <div className="popup-content">
      <div className="popup-heading-row">
        <h6>{issue.title || 'Reported issue'}</h6>
        <span className="popup-status" style={{ color: getMarkerColor(issue) }}>{issue.status || 'Other'}</span>
      </div>
      <div className="popup-meta">{issue.category || 'Other'} <span aria-hidden="true">•</span> {issue.severity || 'Other'}</div>
      <p className="popup-description">{issue.description || 'No description provided.'}</p>
      <div className="popup-date">Reported {issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : 'date unavailable'}</div>
      <Link to="/explore" className="popup-details-link">View details <i className="fa-solid fa-arrow-right" /></Link>
    </div>
  </Popup>
);

const EmptyMapState = () => (
  <div className="map-empty-state">
    <i className="fa-solid fa-location-dot" aria-hidden="true" />
    <strong>No issues match these filters</strong>
    <span>Try another category or search term.</span>
  </div>
);

const InteractiveMap = ({ center, issues = [], isLoading = false, userLocation = null, satellite = false, onToggleSatellite }) => {
  const groups = useMemo(() => getClusterGroups(issues), [issues]);
  const tileUrl = satellite
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : import.meta.env.VITE_MAPTILER_KEY && import.meta.env.VITE_MAPTILER_STYLE
    ? `https://api.maptiler.com/maps/${import.meta.env.VITE_MAPTILER_STYLE}/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = satellite
    ? 'Tiles &copy; Esri'
    : import.meta.env.VITE_MAPTILER_KEY && import.meta.env.VITE_MAPTILER_STYLE
      ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div
      className="map-wrapper position-relative rounded-4 overflow-hidden shadow-sm"
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
          url={tileUrl}
          attribution={tileAttribution}
          tileSize={512}
          zoomOffset={-1}
          minZoom={1}
        />

        {groups.map((group) => (
          <ClusterMarker key={group.issues.map((issue) => issue.id || issue._id).join('-')} group={group} />
        ))}

        {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon} title="You are here" />}

        <FullscreenButton />
        {onToggleSatellite && <MapModeButton satellite={satellite} onToggle={onToggleSatellite} />}
      </MapContainer>

      <div className="map-legend" aria-label="Map legend">
        {Object.entries(COLORS).map(([label, color]) => (
          <div className="legend-item" key={label}><span className="legend-dot" style={{ background: color }} />{label}</div>
        ))}
      </div>
      {isLoading && <div className="map-loading-overlay" aria-label="Loading map issues"><div className="map-loading-skeleton" /></div>}
      {!isLoading && issues.length === 0 && <EmptyMapState />}
    </div>
  );
};

export default InteractiveMap;
