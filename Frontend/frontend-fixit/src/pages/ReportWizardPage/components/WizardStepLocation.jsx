import LocationPickerMap from '../../../components/map/LocationPickerMap';

const WizardStepLocation = ({
  form,
  nearbyReportsCount,
  onNearbyReportsChange,
  onLocationSelect,
}) => {
  return (
    <>
      <label>Where is the issue located?</label>
      {nearbyReportsCount > 0 && (
        <div
          className="alert alert-info d-flex align-items-start gap-2 mb-3 px-3 py-2"
          style={{
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          <i className="fa-solid fa-circle-info text-primary mt-1"></i>
          <div>
            <strong>
              {nearbyReportsCount} similar report{nearbyReportsCount > 1 ? 's' : ''}
            </strong>{' '}
            found nearby.
            <a
              href="#wizard-map"
              className="ms-1 fw-bold text-primary text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                const mapElem = document.querySelector('.location-picker-container');
                if (mapElem) mapElem.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View on map
            </a>
          </div>
        </div>
      )}
      <LocationPickerMap
        initialAddress={form.address}
        initialLat={
          form.location.latitude !== null
            ? form.location.latitude
            : form.lat !== ''
            ? Number(form.lat)
            : undefined
        }
        initialLng={
          form.location.longitude !== null
            ? form.location.longitude
            : form.lng !== ''
            ? Number(form.lng)
            : undefined
        }
        initialAccuracy={form.location.accuracy}
        initialSource={form.location.source}
        onNearbyReportsChange={onNearbyReportsChange}
        onLocationSelect={onLocationSelect}
      />
    </>
  );
};

export default WizardStepLocation;
