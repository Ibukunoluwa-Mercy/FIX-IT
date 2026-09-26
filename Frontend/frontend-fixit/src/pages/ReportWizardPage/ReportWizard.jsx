import { useState } from 'react';
import axios from 'axios';
import WizardIntro from './components/WizardIntro';
import WizardStepDetails from './components/WizardStepDetails';
import WizardStepLocation from './components/WizardStepLocation';
import WizardStepPhotos from './components/WizardStepPhotos';
import WizardStepReview from './components/WizardStepReview';
import './ReportWizard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
const steps = ['Issue Details', 'Location', 'Add Photos', 'Review & Submit'];

const getAuthToken = () => localStorage.getItem('fixitToken') || localStorage.getItem('token') || '';

const ReportWizard = ({ onClose, onSubmitted }) => {
  const [stage, setStage] = useState(0);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: '',
    description: '',
    severity: 'Medium',
    address: '',
    lat: '',
    lng: '',
    location: {
      latitude: null,
      longitude: null,
      accuracy: null,
      source: null,
      addressText: '',
      capturedAt: null,
    },
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [retryAction, setRetryAction] = useState(null);
  const [nearbyReportsCount, setNearbyReportsCount] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const choosePhotos = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    const validFiles = incomingFiles.filter((file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);
    if (!validFiles.length) return;

    const nextPhotos = [...photos, ...validFiles]
      .slice(0, 5)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setPhotos(nextPhotos);
    setUploadedUrls([]);
    event.target.value = '';
  };

  const uploadPhotos = async () => {
    if (!photos.length) return [];
    if (uploadedUrls.length === photos.length && uploadedUrls.length > 0) return uploadedUrls;

    const token = getAuthToken();
    if (!token) throw new Error('Please sign in before uploading photos.');

    const formData = new FormData();
    photos.forEach((photo) => {
      if (photo.file) formData.append('photos', photo.file);
    });

    const response = await axios.post(`${API_URL}/api/reports/upload-photos`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const urls = response.data?.urls || [];
    setUploadedUrls(urls);
    return urls;
  };

  const geocodeAddress = async (address) => {
    const nextAddress = address.trim();
    if (!nextAddress) return null;

    const response = await axios.get(`${API_URL}/api/reports/geocode`, {
      params: { address: nextAddress },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Unable to find that address.');
    }

    const result = response.data.result || {};
    const lat = Number(result.location?.lat);
    const lng = Number(result.location?.lng);
    const formattedAddress = result.formattedAddress || nextAddress;

    setForm((current) => ({
      ...current,
      address: formattedAddress,
      lat: Number.isFinite(lat) ? lat : '',
      lng: Number.isFinite(lng) ? lng : '',
    }));

    return { address: formattedAddress, lat, lng };
  };

  const retryCurrentStep = async () => {
    setError('');

    if (step === 2) {
      setRetryAction('geocode');
      try {
        await geocodeAddress(form.address);
        setRetryAction(null);
        setStep((current) => Math.min(4, current + 1));
      } catch (requestError) {
        setRetryAction('geocode');
        setError(requestError.response?.data?.message || requestError.message || 'Unable to verify this address.');
      }
      return;
    }

    if (step === 3) {
      setRetryAction('upload');
      try {
        await uploadPhotos();
        setRetryAction(null);
        setStep((current) => Math.min(4, current + 1));
      } catch (requestError) {
        setRetryAction('upload');
        setError(requestError.response?.data?.message || requestError.message || 'Unable to upload photos.');
      }
    }
  };

  const next = async () => {
    setError('');
    setRetryAction(null);

    if (step === 1 && (!form.category || !form.description.trim())) {
      return setError('Choose an issue type and describe the problem.');
    }

    if (step === 2) {
      if (!form.address.trim()) {
        return setError('Enter the issue location.');
      }

      if (form.location.latitude === null || form.location.longitude === null) {
        return setError('Choose a location using your device, search, or the map pin.');
      }
    }

    if (step === 3 && photos.length) {
      try {
        await uploadPhotos();
      } catch (requestError) {
        setRetryAction('upload');
        return setError(requestError.response?.data?.message || requestError.message || 'Unable to upload photos.');
      }
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = getAuthToken();
      if (!token) throw new Error('Please sign in before submitting a report.');

      const uploaded = photos.length ? await uploadPhotos() : [];
      const payload = {
        category: form.category,
        description: form.description.trim(),
        address: form.address.trim(),
        severity: form.severity,
        photos: uploaded,
        location: {
          latitude: form.location.latitude,
          longitude: form.location.longitude,
          accuracy: form.location.accuracy,
          source: form.location.source,
          addressText: form.location.addressText,
          capturedAt: form.location.capturedAt,
        },
      };

      await axios.post(`${API_URL}/api/reports`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (typeof onSubmitted === 'function') onSubmitted();
      if (typeof onClose === 'function') onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to submit this report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (stage === 0) {
    return <WizardIntro onStart={() => setStage(1)} onClose={onClose} />;
  }

  return (
    <div className="wizard-backdrop">
      <div className="wizard-shell" role="dialog" aria-modal="true">
        <header className="wizard-header">
          <button onClick={onClose}><i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i> Back to Dashboard</button>
          <button className="wizard-close" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark"></i></button>
        </header>

        <div className="wizard-title">
          <h2>Report a New Problem</h2>
          <p>Please provide the details about the issue you&apos;ve encountered.</p>
        </div>

        <div className="wizard-body">
          <aside className="wizard-stepper">
            {steps.map((label, index) => (
              <button
                key={label}
                className={step === index + 1 ? 'current' : step > index + 1 ? 'complete' : ''}
                onClick={() => step > index + 1 && setStep(index + 1)}
              >
                <span>{step > index + 1 ? <i className="fa-solid fa-check" style={{ fontSize: 13 }}></i> : index + 1}</span>
                {label}
              </button>
            ))}
          </aside>

          <section className="wizard-card">
            {step === 1 && (
              <WizardStepDetails
                form={form}
                onUpdate={update}
                onSeverityChange={(name) => setForm((current) => ({ ...current, severity: name }))}
              />
            )}

            {step === 2 && (
              <WizardStepLocation
                form={form}
                nearbyReportsCount={nearbyReportsCount}
                onNearbyReportsChange={(reports) => setNearbyReportsCount(reports.length)}
                onLocationSelect={(location) => {
                  setForm((current) => ({
                    ...current,
                    lat: location.latitude,
                    lng: location.longitude,
                    address: location.addressText,
                    location,
                  }));
                  setError('');
                  setRetryAction(null);
                }}
              />
            )}

            {step === 3 && (
              <WizardStepPhotos
                photos={photos}
                onChoosePhotos={choosePhotos}
                onRemovePhoto={(index) => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}
              />
            )}

            {step === 4 && <WizardStepReview form={form} photos={photos} />}

            {error && (
              <>
                <p className="wizard-error" role="alert">{error}</p>
                {(retryAction === 'geocode' || retryAction === 'upload') && (
                  <button className="wizard-secondary" type="button" onClick={retryCurrentStep}>
                    Retry {retryAction === 'geocode' ? 'location lookup' : 'photo upload'}
                  </button>
                )}
              </>
            )}

            <footer className="wizard-actions">
              {step > 1 && (
                <button className="wizard-secondary" onClick={() => setStep((current) => current - 1)}>
                  <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i> Back
                </button>
              )}

              {step < 4 ? (
                <button
                  className="wizard-primary"
                  disabled={step === 2 && (form.location.latitude === null || form.location.longitude === null)}
                  onClick={next}
                >
                  Next: {steps[step]} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                </button>
              ) : (
                <button className="wizard-primary" disabled={submitting} onClick={submit}>
                  {submitting ? 'Submitting...' : 'Submit Report'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                </button>
              )}
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReportWizard;
