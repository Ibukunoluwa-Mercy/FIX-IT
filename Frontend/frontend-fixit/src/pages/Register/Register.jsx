import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../../assets/fixit-logo-white.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import securityIllustration from '../../assets/security building illustration.png';
import './Register.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
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
        if (!form.officialId) nextErrors.officialId = 'Official ID document is required';
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

        if (role === 'official') {
            const officialErrors = {};
            if (!reviewed) officialErrors.reviewed = 'Please confirm your information';
            if (!form.officialId) officialErrors.officialId = 'Official ID document is required';
            if (Object.keys(officialErrors).length) {
                setErrors(officialErrors);
                return;
            }
        } else {
            const residentErrors = { ...validatePersonal(), ...(!agreed ? { agreed: 'You must agree to the terms' } : {}) };
            if (Object.keys(residentErrors).length) {
                setErrors(residentErrors);
                return;
            }
        }

        setLoading(true);
        try {
            const requestBody = role === 'official' ? (() => {
                const body = new FormData();
                body.append('fullName', form.fullName.trim());
                body.append('email', form.email.trim());
                body.append('phone', form.phone.trim());
                body.append('password', form.password);
                body.append('department', form.office.trim());
                body.append('position', form.position.trim());
                body.append('lga', form.lga.trim());
                body.append('staffId', form.staffId.trim());
                body.append('isConfirmed', String(reviewed));
                body.append('officialIdFile', form.officialId, form.officialId.name);
                return body;
            })() : { fullName: form.fullName, email: form.email, location: form.neighborhood, password: form.password, role, agreeToTerms: agreed };

            const response = await axios.post(`${API_URL}/api/auth/${role === 'official' ? 'register-official' : 'register'}`, requestBody, role === 'official' ? {} : undefined);
            const data = response.data;
            localStorage.setItem('fixitToken', data.token);
            localStorage.setItem('fixitUser', JSON.stringify(data.user || data.profile || {}));
            localStorage.setItem('fixitDashboardGreeting', 'welcome');
            toast.success(role === 'official'
                ? `Welcome onboard, ${form.fullName.split(' ')[0]}! Your Local Official account has been created.`
                : 'Welcome onboard! Your Fixit account has been created.');

            if (role === 'official') {
                setForm(initialForm);
                setStep(1);
                setReviewed(false);
                setErrors({});
                setShowPassword(false);
            }

            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || (error instanceof TypeError && error.message.toLowerCase().includes('fetch')
                ? 'Unable to reach the Fixit server. Start the backend and check its MongoDB connection.'
                : error.message);
            toast.error(message);
            setErrors((current) => ({
                ...current,
                form: message,
            }));
        } finally { setLoading(false); }
    };
    const input = (name, label, iconClass, placeholder, type = 'text', extra = {}) => <div className="reg-field"><label className="reg-label" htmlFor={name}>{label}</label><div className={`reg-input-wrap ${errors[name] ? 'has-error' : ''}`}><i className={`${iconClass} reg-input-icon`}></i><input id={name} name={name} type={type} className="reg-input" placeholder={placeholder} value={form[name]} onChange={updateField} {...extra} />{name === 'password' && <button type="button" className="reg-eye-btn" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}</button>}</div>{errors[name] && <span className="reg-error">{errors[name]}</span>}</div>;
    const select = (name, label, options, placeholder) => <div className="reg-field"><label className="reg-label" htmlFor={name}>{label}</label><div className={`reg-input-wrap select-wrap ${errors[name] ? 'has-error' : ''}`}><select id={name} name={name} value={form[name]} onChange={updateField} className="reg-input"><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><i className="fa-solid fa-chevron-down select-icon"></i></div>{errors[name] && <span className="reg-error">{errors[name]}</span>}</div>;
    const roleTabs = <div className="register-role-tabs"><button type="button" className={`role-tab ${role === 'resident' ? 'active' : ''}`} onClick={() => selectRole('resident')}><i className="fa-solid fa-user" style={{ fontSize: 18 }}></i><span>Resident</span></button><button type="button" className={`role-tab ${role === 'official' ? 'active' : ''}`} onClick={() => selectRole('official')}><i className="fa-solid fa-shield-halved" style={{ fontSize: 18 }}></i><span>Local Official</span></button></div>;
    const progress = role === 'official' && <div className="wizard-progress"><button type="button" className="wizard-back" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} aria-label="Go back"><i className="fa-solid fa-arrow-left"></i></button>{['Personal Info', 'Official Details', 'Review & Create'].map((label, index) => { const number = index + 1; return <React.Fragment key={label}><div className={`wizard-step ${step === number ? 'active' : ''} ${step > number ? 'complete' : ''}`}><span className="wizard-dot">{step > number ? <i className="fa-solid fa-check" style={{ fontSize: 12 }}></i> : number}</span><span>{label}</span></div>{number < 3 && <span className={`wizard-line ${step > number ? 'complete' : ''}`} />}</React.Fragment>; })}</div>;
    const terms = <div className="reg-terms"><label className="reg-terms-label"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="reg-checkbox" /><span>I agree to the <Link to="/terms" className="reg-link">Terms of Service</Link> and <Link to="/privacy" className="reg-link">Privacy Policy</Link>.</span></label>{errors.agreed && <span className="reg-error">{errors.agreed}</span>}</div>;
    const personalStep = <><h2 className="register-card-title">Create your account</h2><p className="register-card-sub">I am joining as a:</p>{roleTabs}{role === 'resident' && <div className="register-admin-banner"><div className="admin-banner-left"><span className="admin-banner-label">Are you a local official?</span><button type="button" className="admin-banner-link" onClick={() => selectRole('official')}>Create an Admin Account <i className="fa-solid fa-arrow-right" style={{ fontSize: 12, marginLeft: 4 }}></i></button></div><i className="fa-solid fa-shield-halved admin-banner-icon" style={{ fontSize: 20 }}></i></div>}<h3 className="step-section-title">Personal Information</h3>{input('fullName', 'Full Name', 'fa-solid fa-user', role === 'official' ? 'e.g. Adebola Johnson' : 'Jane Doe', 'text', { autoComplete: 'name' })}{input('email', 'Email Address', 'fa-solid fa-envelope', 'you@example.com', 'email', { autoComplete: 'email' })}{role === 'official' ? input('phone', 'Phone Number', 'fa-solid fa-phone', 'e.g. +234 801 234 5678', 'tel', { autoComplete: 'tel' }) : input('neighborhood', 'Neighborhood / Zip Code', 'fa-solid fa-location-dot', 'e.g. 90210 or Downtown')}{input('password', 'Password', 'fa-solid fa-lock', '••••••••', showPassword ? 'text' : 'password', { autoComplete: 'new-password' })}{role === 'official' && <p className="password-hint">Password must be at least 8 characters.</p>}{role === 'resident' && terms}{errors.form && <span className="reg-error">{errors.form}</span>}<button type={role === 'resident' ? 'submit' : 'button'} className="reg-submit-btn" onClick={role === 'official' ? goNext : undefined} disabled={loading}>{loading ? 'Creating Account...' : role === 'official' ? <>Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i></> : <>Create Account <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i></>}</button></>;
    const officialStep = <><h2 className="register-card-title">Create your account</h2><p className="register-card-sub">I am joining as a:</p>{roleTabs}<h3 className="step-section-title">Official Information</h3>{select('office', 'Office / Department', officialOptions.office, 'Select your office')}{select('position', 'Role / Position', officialOptions.position, 'Select your position')}{select('lga', 'Local Government Area', officialOptions.lga, 'Select your LGA')}{input('staffId', 'Employee / Staff ID (Optional)', 'fa-solid fa-id-badge', 'e.g. LG/2024/001234')}<div className="reg-field"><label className="reg-label">Upload Official ID</label><button type="button" className={`upload-dropzone ${errors.officialId ? 'has-error' : ''}`} onClick={() => fileRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}><i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 20 }}></i><strong>{form.officialId ? form.officialId.name : 'Click to upload or drag and drop'}</strong><span>PDF, JPG or PNG (Max. 5MB)</span></button><input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleFile} />{errors.officialId && <span className="reg-error">{errors.officialId}</span>}</div><div className="wizard-actions"><button type="button" className="wizard-secondary" onClick={() => setStep(1)}>Back</button><button type="button" className="reg-submit-btn" onClick={goNext}>Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i></button></div></>;
    const summary = (title, onEdit, items) => <section className="summary-card"><div className="summary-header"><strong>{title}</strong><button type="button" onClick={onEdit}>Edit</button></div>{items.map(([iconClass, label, value]) => <div className="summary-row" key={label}><i className={`${iconClass}`} style={{ fontSize: 13 }}></i><span>{label}</span><strong>{value || 'Not provided'}</strong></div>)}</section>;
    const reviewStep = <><h2 className="review-title">Review your details</h2><p className="register-card-sub">Please confirm your information is correct.</p>{summary('Personal Information', () => setStep(1), [['fa-solid fa-user', 'Full Name', form.fullName], ['fa-solid fa-envelope', 'Email Address', form.email], ['fa-solid fa-phone', 'Phone Number', form.phone]])}{summary('Official Information', () => setStep(2), [['fa-solid fa-building', 'Office / Department', form.office], ['fa-solid fa-shield-halved', 'Role / Position', form.position], ['fa-solid fa-location-dot', 'Local Government Area', form.lga], ['fa-solid fa-file-lines', 'Official ID', form.officialId?.name || 'Not uploaded']])}<label className="review-confirm"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /><span>I confirm that the information provided is true and accurate.</span></label>{errors.reviewed && <span className="reg-error">{errors.reviewed}</span>}{errors.form && <span className="reg-error">{errors.form}</span>}<button type="submit" className="reg-submit-btn" disabled={loading}>{loading ? 'Creating Account...' : <>Create Account <i className="fa-solid fa-check" style={{ marginLeft: 6 }}></i></>}</button></>;

    return <div className={`register-page ${role === 'official' ? 'official-page' : ''}`}><div className="register-logo-bar"><Link to="/"><img src={logo} alt="Fixit" className="register-logo" /></Link></div>{role === 'official' && <header className="official-page-heading"><h1>Local Official - Create Account</h1><p>A secure and simple sign up experience for verified local officials.</p></header>}<div className="register-split"><div className="register-hero register-reveal register-reveal-hero"><div className="register-hero-content"><h1 className="register-hero-headline">Your community,<span className="hero-accent">built better together.</span></h1><p className="register-hero-subtitle">Connect with neighbors, report local issues, and collaborate with officials to create a safer, cleaner environment for everyone.</p><div className="register-badges"><div className="register-badge"><div className="badge-icon-wrap"><i className="fa-solid fa-building" style={{ fontSize: 20 }}></i></div><div><div className="badge-title">Local Impact</div><div className="badge-desc">See immediate changes in your neighborhood.</div></div></div><div className="register-badge"><div className="badge-icon-wrap"><i className="fa-solid fa-users" style={{ fontSize: 20 }}></i></div><div><div className="badge-title">Community Driven</div><div className="badge-desc">Join thousands making a difference daily.</div></div></div></div></div><div className="register-illustration-wrap"><img src={neighborhoodIllustration} alt="Connected neighborhood" className="register-illustration" /></div></div><div className="register-form-side register-reveal register-reveal-card"><div className="register-card">{progress}<form onSubmit={submit} className="register-form" noValidate>{role === 'official' && step === 2 ? officialStep : role === 'official' && step === 3 ? reviewStep : personalStep}</form><p className="reg-footer-link">Already have an account? <Link to="/login" className="reg-link">Log in here</Link></p></div></div></div>{role === 'official' && <div className="secure-strip register-reveal register-reveal-strip"><i className="fa-solid fa-shield-halved" style={{ fontSize: 24 }}></i><div><strong>Secure &amp; Verified</strong><span>All local official accounts are reviewed and verified before full access is granted.</span></div><i className="fa-solid fa-lock" style={{ fontSize: 20 }}></i><div><strong>Your data is encrypted and secure</strong><span>We take your privacy seriously.</span></div><img src={securityIllustration} alt="Secure Fixit community" /></div>}</div>;
};

export default Register;
