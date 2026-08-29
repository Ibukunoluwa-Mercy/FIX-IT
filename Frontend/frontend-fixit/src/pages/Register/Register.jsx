import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Eye, EyeOff, FileCheck, Lock, Mail, MapPin, Phone, ShieldCheck, Upload, User, Users, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../../assets/fixit-logo-black.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import securityIllustration from '../../assets/security building illustration.png';
import './Register.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:0702';
const initialForm = { fullName: '', email: '', neighborhood: '', phone: '', password: '', office: '', position: '', lga: '', staffId: '', officialId: null };
const officialOptions = {
  office: ['Health Department', 'Public Works', 'Environmental Services', 'Transport Authority'],
  position: ['Environmental Health Officer', 'Community Liaison Officer', 'Infrastructure Officer', 'Public Safety Officer'],
  lga: ['Ikeja LGA', 'Surulere LGA', 'Lagos Island LGA', 'Yaba LGA', 'Alimosho LGA'],
};

const Register = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [role, setRole] = useState('resident');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [agreed, setAgreed] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };
  const selectRole = (nextRole) => { setRole(nextRole); setStep(1); setErrors({}); };
  const validatePersonal = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (role === 'official' && !form.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (role === 'resident' && !form.neighborhood.trim()) nextErrors.neighborhood = 'Neighborhood or zip code is required';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    return nextErrors;
  };
  const validateOfficial = () => {
    const nextErrors = {};
    ['office', 'position', 'lga'].forEach((field) => { if (!form[field]) nextErrors[field] = 'Please select an option'; });
    if (form.officialId && form.officialId.size > 5 * 1024 * 1024) nextErrors.officialId = 'File must be 5MB or smaller';
    return nextErrors;
  };
  const goNext = () => {
    const nextErrors = step === 1 ? validatePersonal() : validateOfficial();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setStep((current) => current + 1); setErrors({});
  };
  const acceptFile = (file) => {
    if (!file) return;
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) { setErrors((current) => ({ ...current, officialId: 'Upload a PDF, JPG, or PNG file' })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors((current) => ({ ...current, officialId: 'File must be 5MB or smaller' })); return; }
    setForm((current) => ({ ...current, officialId: file }));
    setErrors((current) => ({ ...current, officialId: '' }));
  };
  const handleFile = (event) => acceptFile(event.target.files?.[0]);
  const handleDrop = (event) => { event.preventDefault(); acceptFile(event.dataTransfer.files?.[0]); };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = role === 'official' ? (!reviewed ? { reviewed: 'Please confirm your information' } : {}) : { ...validatePersonal(), ...(!agreed ? { agreed: 'You must agree to the terms' } : {}) };
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: form.fullName, email: form.email, location: role === 'official' ? `${form.office}, ${form.lga}` : form.neighborhood, password: form.password, role, agreeToTerms: role === 'official' ? reviewed : agreed }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create account');
      localStorage.setItem('fixitToken', data.token);
      toast.success(role === 'official'
        ? `Welcome onboard, ${form.fullName.split(' ')[0]}! Your Local Official account has been created. Check your email to verify it.`
        : 'Welcome onboard! Your Fixit account has been created. Check your email to verify it.');
      navigate('/');
    } catch (error) {
      const message = error instanceof TypeError && error.message.toLowerCase().includes('fetch')
        ? 'Unable to reach the Fixit server. Start the backend and check its MongoDB connection.'
        : error.message;
      toast.error(message);
    } finally { setLoading(false); }
  };
  const input = (name, label, Icon, placeholder, type = 'text', extra = {}) => <div className="reg-field"><label className="reg-label" htmlFor={name}>{label}</label><div className={`reg-input-wrap ${errors[name] ? 'has-error' : ''}`}><Icon size={16} className="reg-input-icon" /><input id={name} name={name} type={type} className="reg-input" placeholder={placeholder} value={form[name]} onChange={updateField} {...extra} />{name === 'password' && <button type="button" className="reg-eye-btn" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>}</div>{errors[name] && <span className="reg-error">{errors[name]}</span>}</div>;
  const select = (name, label, options, placeholder) => <div className="reg-field"><label className="reg-label" htmlFor={name}>{label}</label><div className={`reg-input-wrap select-wrap ${errors[name] ? 'has-error' : ''}`}><select id={name} name={name} value={form[name]} onChange={updateField} className="reg-input"><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={16} className="select-icon" /></div>{errors[name] && <span className="reg-error">{errors[name]}</span>}</div>;
  const roleTabs = <div className="register-role-tabs"><button type="button" className={`role-tab ${role === 'resident' ? 'active' : ''}`} onClick={() => selectRole('resident')}><User size={20} /><span>Resident</span></button><button type="button" className={`role-tab ${role === 'official' ? 'active' : ''}`} onClick={() => selectRole('official')}><ShieldCheck size={20} /><span>Local Official</span></button></div>;
  const progress = role === 'official' && <div className="wizard-progress"><button type="button" className="wizard-back" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} aria-label="Go back"><ArrowLeft size={20} /></button>{['Personal Info', 'Official Details', 'Review & Create'].map((label, index) => { const number = index + 1; return <React.Fragment key={label}><div className={`wizard-step ${step === number ? 'active' : ''} ${step > number ? 'complete' : ''}`}><span className="wizard-dot">{step > number ? <Check size={14} /> : number}</span><span>{label}</span></div>{number < 3 && <span className={`wizard-line ${step > number ? 'complete' : ''}`} />}</React.Fragment>; })}</div>;
  const terms = <div className="reg-terms"><label className="reg-terms-label"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="reg-checkbox" /><span>I agree to the <Link to="/terms" className="reg-link">Terms of Service</Link> and <Link to="/privacy" className="reg-link">Privacy Policy</Link>.</span></label>{errors.agreed && <span className="reg-error">{errors.agreed}</span>}</div>;
  const personalStep = <><h2 className="register-card-title">Create your account</h2><p className="register-card-sub">I am joining as a:</p>{roleTabs}{role === 'resident' && <div className="register-admin-banner"><div className="admin-banner-left"><span className="admin-banner-label">Are you a local official?</span><button type="button" className="admin-banner-link" onClick={() => selectRole('official')}>Create an Admin Account <ArrowRight size={14} /></button></div><ShieldCheck size={20} className="admin-banner-icon" /></div>}<h3 className="step-section-title">Personal Information</h3>{input('fullName', 'Full Name', User, role === 'official' ? 'e.g. Adebola Johnson' : 'Jane Doe', 'text', { autoComplete: 'name' })}{input('email', 'Email Address', Mail, 'you@example.com', 'email', { autoComplete: 'email' })}{role === 'official' ? input('phone', 'Phone Number', Phone, 'e.g. +234 801 234 5678', 'tel', { autoComplete: 'tel' }) : input('neighborhood', 'Neighborhood / Zip Code', MapPin, 'e.g. 90210 or Downtown')}{input('password', 'Password', Lock, '••••••••', showPassword ? 'text' : 'password', { autoComplete: 'new-password' })}{role === 'official' && <p className="password-hint">Password must be at least 8 characters.</p>}{role === 'resident' && terms}<button type={role === 'resident' ? 'submit' : 'button'} className="reg-submit-btn" onClick={role === 'official' ? goNext : undefined} disabled={loading}>{loading ? 'Creating Account...' : role === 'official' ? <>Continue <ArrowRight size={18} /></> : <>Create Account <ArrowRight size={18} /></>}</button></>;
  const officialStep = <><h2 className="register-card-title">Create your account</h2><p className="register-card-sub">I am joining as a:</p>{roleTabs}<h3 className="step-section-title">Official Information</h3>{select('office', 'Office / Department', officialOptions.office, 'Select your office')}{select('position', 'Role / Position', officialOptions.position, 'Select your position')}{select('lga', 'Local Government Area', officialOptions.lga, 'Select your LGA')}{input('staffId', 'Employee / Staff ID (Optional)', Lock, 'e.g. LG/2024/001234')}<div className="reg-field"><label className="reg-label">Upload Official ID</label><button type="button" className={`upload-dropzone ${errors.officialId ? 'has-error' : ''}`} onClick={() => fileRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}><Upload size={18} /><strong>{form.officialId ? form.officialId.name : 'Click to upload or drag and drop'}</strong><span>PDF, JPG or PNG (Max. 5MB)</span></button><input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleFile} />{errors.officialId && <span className="reg-error">{errors.officialId}</span>}</div><div className="wizard-actions"><button type="button" className="wizard-secondary" onClick={() => setStep(1)}>Back</button><button type="button" className="reg-submit-btn" onClick={goNext}>Continue <ArrowRight size={18} /></button></div></>;
  const summary = (title, onEdit, items) => <section className="summary-card"><div className="summary-header"><strong>{title}</strong><button type="button" onClick={onEdit}>Edit</button></div>{items.map(([Icon, label, value]) => <div className="summary-row" key={label}><Icon size={14} /><span>{label}</span><strong>{value || 'Not provided'}</strong></div>)}</section>;
  const reviewStep = <><h2 className="review-title">Review your details</h2><p className="register-card-sub">Please confirm your information is correct.</p>{summary('Personal Information', () => setStep(1), [[User, 'Full Name', form.fullName], [Mail, 'Email Address', form.email], [Phone, 'Phone Number', form.phone]])}{summary('Official Information', () => setStep(2), [[Building2, 'Office / Department', form.office], [ShieldCheck, 'Role / Position', form.position], [MapPin, 'Local Government Area', form.lga], [FileCheck, 'Official ID', form.officialId?.name || 'Not uploaded']])}<label className="review-confirm"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /><span>I confirm that the information provided is true and accurate.</span></label>{errors.reviewed && <span className="reg-error">{errors.reviewed}</span>}<button type="submit" className="reg-submit-btn" disabled={loading}>{loading ? 'Creating Account...' : <>Create Account <Check size={18} /></>}</button></>;

  return <div className={`register-page ${role === 'official' ? 'official-page' : ''}`}><div className="register-logo-bar"><Link to="/"><img src={logo} alt="Fixit" className="register-logo" /></Link></div>{role === 'official' && <header className="official-page-heading"><h1>Local Official - Create Account</h1><p>A secure and simple sign up experience for verified local officials.</p></header>}<div className="register-split"><div className="register-hero"><div className="register-hero-content"><h1 className="register-hero-headline">Your community,<span className="hero-accent">built better together.</span></h1><p className="register-hero-subtitle">Connect with neighbors, report local issues, and collaborate with officials to create a safer, cleaner environment for everyone.</p><div className="register-badges"><div className="register-badge"><div className="badge-icon-wrap"><Building2 size={22} /></div><div><div className="badge-title">Local Impact</div><div className="badge-desc">See immediate changes in your neighborhood.</div></div></div><div className="register-badge"><div className="badge-icon-wrap"><Users size={22} /></div><div><div className="badge-title">Community Driven</div><div className="badge-desc">Join thousands making a difference daily.</div></div></div></div></div><div className="register-illustration-wrap"><img src={neighborhoodIllustration} alt="Connected neighborhood" className="register-illustration" /></div></div><div className="register-form-side"><div className="register-card">{progress}<form onSubmit={submit} className="register-form" noValidate>{role === 'official' && step === 2 ? officialStep : role === 'official' && step === 3 ? reviewStep : personalStep}</form><p className="reg-footer-link">Already have an account? <Link to="/login" className="reg-link">Log in here</Link></p></div></div></div>{role === 'official' && <div className="secure-strip"><ShieldCheck size={22} /><div><strong>Secure &amp; Verified</strong><span>All local official accounts are reviewed and verified before full access is granted.</span></div><Lock size={20} /><div><strong>Your data is encrypted and secure</strong><span>We take your privacy seriously.</span></div><img src={securityIllustration} alt="Secure Fixit community" /></div>}</div>;
};

export default Register;
