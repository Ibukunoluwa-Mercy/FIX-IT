import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Check, ImagePlus, MapPin, Plus, Upload, X } from 'lucide-react';
import './ReportWizard.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
const steps = ['Issue Details', 'Location', 'Add Photos', 'Review & Submit'];
const categories = ['Potholes & Road Damage', 'Streetlight Outages', 'Garbage & Litter', 'Water Leaks', 'Others'];
const severities = [['Low', 'Minor issue'], ['Medium', 'Moderate issue'], ['High', 'Urgent issue']];

const ReportWizard = ({ onClose, onSubmitted }) => {
  const [stage, setStage] = useState(0);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ category: '', description: '', severity: 'Medium', address: '' });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const choosePhotos = (event) => Array.from(event.target.files || []).forEach((file) => {
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader(); reader.onload = () => setPhotos((current) => [...current, { file, preview: reader.result }].slice(0, 5)); reader.readAsDataURL(file);
  });
  const next = () => { setError(''); if (step === 1 && (!form.category || !form.description.trim())) return setError('Choose an issue type and describe the problem.'); if (step === 2 && !form.address.trim()) return setError('Enter the issue location.'); setStep((current) => Math.min(4, current + 1)); };
  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      let coordinates = {};
      if (navigator.geolocation) coordinates = await new Promise((resolve) => navigator.geolocation.getCurrentPosition((position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }), () => resolve({}), { timeout: 2500 }));
      await axios.post(`${API_URL}/api/reports`, { title: form.category, description: form.description, address: form.address, imageUrl: photos[0]?.preview || '', ...coordinates }, { headers: { Authorization: `Bearer ${localStorage.getItem('fixitToken')}` } });
      onSubmitted();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to submit this report.'); }
    finally { setSubmitting(false); }
  };
  if (stage === 0) return <div className="wizard-backdrop"><div className="wizard-intro" role="dialog" aria-modal="true"><button className="wizard-close" onClick={onClose} aria-label="Close"><X /></button><span className="wizard-intro-icon"><ImagePlus /></span><h2>Report a New Problem</h2><p>Help keep our community safe and clean by letting us know what&apos;s happening.</p>{[['Quick & Easy', 'Report issues in just a few steps.'], ['Track Progress', 'We&apos;ll keep you updated on the status.'], ['Stronger Community', 'Your report helps make a difference.']].map(([title, text], index) => <div className="intro-benefit" key={title}><span>{index + 1}</span><div><strong>{title}</strong><small>{text}</small></div></div>)}<button className="wizard-primary" onClick={() => setStage(1)}>Report Now <ArrowRight size={17} /></button><button className="wizard-cancel" onClick={onClose}>Cancel</button></div></div>;
  return <div className="wizard-backdrop"><div className="wizard-shell" role="dialog" aria-modal="true"><header className="wizard-header"><button onClick={onClose}><ArrowLeft size={15} /> Back to Dashboard</button><button className="wizard-close" onClick={onClose} aria-label="Close"><X /></button></header><div className="wizard-title"><h2>Report a New Problem</h2><p>Please provide the details about the issue you&apos;ve encountered.</p></div><div className="wizard-body"><aside className="wizard-stepper">{steps.map((label, index) => <button key={label} className={step === index + 1 ? 'current' : step > index + 1 ? 'complete' : ''} onClick={() => step > index + 1 && setStep(index + 1)}><span>{step > index + 1 ? <Check size={14} /> : index + 1}</span>{label}</button>)}</aside><section className="wizard-card">{step === 1 && <><label>What type of issue is this?<select name="category" value={form.category} onChange={update}><option value="">Select issue category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Describe the issue<textarea name="description" maxLength="500" value={form.description} onChange={update} placeholder="Provide a clear description of the problem..." /><small className="counter">{form.description.length}/500</small></label><fieldset><legend>How severe is the issue?</legend><div className="severity-grid">{severities.map(([name, note]) => <button type="button" className={`severity ${form.severity === name ? 'selected' : ''}`} key={name} onClick={() => setForm((current) => ({ ...current, severity: name }))}><b className={name.toLowerCase()} />{name}<small>{note}</small></button>)}</div></fieldset></>}{step === 2 && <><label>Where is the issue located?<input name="address" value={form.address} onChange={update} placeholder="Search for a street, landmark, or area" /></label><div className="wizard-map"><MapPin size={38} /><span>Map preview</span></div><div className="address-preview"><MapPin size={15} />{form.address || 'Your selected address will appear here'}</div></>}{step === 3 && <><label>Add photos to show the issue</label><div className="drop-zone"><Upload size={28} /><strong>Drag and drop photos here</strong><small>JPG, PNG, WEBP. Max 5MB each.</small><label className="choose-files">Choose Files<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choosePhotos} /></label></div><div className="photo-grid">{photos.map((photo, index) => <div key={photo.preview}><img src={photo.preview} alt="Report preview" /><button type="button" onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}><X size={13} /></button></div>)}<label className="add-photo"><Plus /><small>Add more</small><input type="file" accept="image/*" multiple onChange={choosePhotos} /></label></div></>}{step === 4 && <><div className="review-list"><p><b>Issue Type</b><span>{form.category}</span></p><p><b>Location</b><span>{form.address}</span></p><p><b>Description</b><span>{form.description}</span></p><p><b>Severity</b><span className={`review-severity ${form.severity.toLowerCase()}`}>{form.severity}</span></p></div>{photos.length > 0 && <div className="review-photos">{photos.map((photo) => <img key={photo.preview} src={photo.preview} alt="Report preview" />)}</div>}</>}{error && <p className="wizard-error" role="alert">{error}</p>}<footer className="wizard-actions">{step > 1 && <button className="wizard-secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={15} /> Back</button>}{step < 4 ? <button className="wizard-primary" onClick={next}>Next: {steps[step]} <ArrowRight size={15} /></button> : <button className="wizard-primary" disabled={submitting} onClick={submit}>{submitting ? 'Submitting...' : 'Submit Report'} <ArrowRight size={15} /></button>}</footer></section></div></div></div>;
};

export default ReportWizard;
