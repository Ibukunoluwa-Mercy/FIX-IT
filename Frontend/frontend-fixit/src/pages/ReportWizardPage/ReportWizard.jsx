import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Check, ImagePlus, MapPin, Plus, Upload, X } from 'lucide-react';
import './ReportWizard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
const steps = ['Issue Details', 'Location', 'Add Photos', 'Review & Submit'];
const categories = ['Potholes & Road Damage', 'Streetlight Outages', 'Garbage & Litter', 'Water Leaks', 'Others'];
const severities = [['Low', 'Minor issue'], ['Medium', 'Moderate issue'], ['High', 'Urgent issue']];

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
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [retryAction, setRetryAction] = useState(null);

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
    event.target.value = '';
  };

  const uploadPhotos = async () => {
    if (!photos.length) return [];

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

    return response.data?.urls || [];
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

      try {
        await geocodeAddress(form.address);
      } catch (requestError) {
        setRetryAction('geocode');
        return setError(requestError.response?.data?.message || requestError.message || 'Unable to verify this address.');
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

      const uploadedUrls = photos.length ? await uploadPhotos() : [];
      const payload = {
        category: form.category,
        description: form.description.trim(),
        address: form.address.trim(),
        severity: form.severity,
        photos: uploadedUrls,
        location: {
          address: form.address.trim(),
          lat: form.lat !== '' ? Number(form.lat) : undefined,
          lng: form.lng !== '' ? Number(form.lng) : undefined,
        },
      };

      await axios.post(`${API_URL}/api/reports/submit`, payload, {
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
    return (
      <div className="wizard-backdrop">
        <div className="wizard-intro" role="dialog" aria-modal="true">
          <button className="wizard-close" onClick={onClose} aria-label="Close"><X /></button>
          <span className="wizard-intro-icon"><ImagePlus /></span>
          <h2>Report a New Problem</h2>
          <p>Help keep our community safe and clean by letting us know what&apos;s happening.</p>
          {[['Quick & Easy', 'Report issues in just a few steps.'], ['Track Progress', 'We&apos;ll keep you updated on the status.'], ['Stronger Community', 'Your report helps make a difference.']].map(([title, text], index) => (
            <div className="intro-benefit" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </div>
          ))}
          <button className="wizard-primary" onClick={() => setStage(1)}>Report Now <ArrowRight size={17} /></button>
          <button className="wizard-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-backdrop">
      <div className="wizard-shell" role="dialog" aria-modal="true">
        <header className="wizard-header">
          <button onClick={onClose}><ArrowLeft size={15} /> Back to Dashboard</button>
          <button className="wizard-close" onClick={onClose} aria-label="Close"><X /></button>
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
                <span>{step > index + 1 ? <Check size={14} /> : index + 1}</span>
                {label}
              </button>
            ))}
          </aside>

          <section className="wizard-card">
            {step === 1 && (
              <>
                <label>
                  What type of issue is this?
                  <select name="category" value={form.category} onChange={update}>
                    <option value="">Select issue category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>

                <label>
                  Describe the issue
                  <textarea
                    name="description"
                    maxLength="500"
                    value={form.description}
                    onChange={update}
                    placeholder="Provide a clear description of the problem..."
                  />
                  <small className="counter">{form.description.length}/500</small>
                </label>

                <fieldset>
                  <legend>How severe is the issue?</legend>
                  <div className="severity-grid">
                    {severities.map(([name, note]) => (
                      <button
                        type="button"
                        className={`severity ${form.severity === name ? 'selected' : ''}`}
                        key={name}
                        onClick={() => setForm((current) => ({ ...current, severity: name }))}
                      >
                        <b className={name.toLowerCase()} />{name}
                        <small>{note}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <>
                <label>
                  Where is the issue located?
                  <input
                    name="address"
                    value={form.address}
                    onChange={update}
                    placeholder="Search for a street, landmark, or area"
                  />
                </label>
                <div className="wizard-map">
                  <MapPin size={38} />
                  <span>Map preview</span>
                </div>
                <div className="address-preview">
                  <MapPin size={15} />
                  {form.address || 'Your selected address will appear here'}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <label>Add photos to show the issue</label>
                <div className="drop-zone">
                  <Upload size={28} />
                  <strong>Drag and drop photos here</strong>
                  <small>JPG, PNG, WEBP. Max 5MB each.</small>
                  <label className="choose-files">
                    Choose Files
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choosePhotos} />
                  </label>
                </div>

                <div className="photo-grid">
                  {photos.map((photo, index) => (
                    <div key={`${photo.preview}-${index}`}>
                      <img src={photo.preview} alt="Report preview" />
                      <button type="button" onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  <label className="add-photo">
                    <Plus />
                    <small>Add more</small>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choosePhotos} />
                  </label>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="review-list">
                  <p><b>Issue Type</b><span>{form.category}</span></p>
                  <p><b>Location</b><span>{form.address}</span></p>
                  <p><b>Description</b><span>{form.description}</span></p>
                  <p><b>Severity</b><span className={`review-severity ${form.severity.toLowerCase()}`}>{form.severity}</span></p>
                </div>

                {photos.length > 0 && (
                  <div className="review-photos">
                    {photos.map((photo, index) => (
                      <img key={`${photo.preview}-${index}`} src={photo.preview} alt="Report preview" />
                    ))}
                  </div>
                )}
              </>
            )}

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
                  <ArrowLeft size={15} /> Back
                </button>
              )}

              {step < 4 ? (
                <button className="wizard-primary" onClick={next}>
                  Next: {steps[step]} <ArrowRight size={15} />
                </button>
              ) : (
                <button className="wizard-primary" disabled={submitting} onClick={submit}>
                  {submitting ? 'Submitting...' : 'Submit Report'} <ArrowRight size={15} />
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
