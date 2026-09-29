import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../../assets/fixit-logo-white.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import securityIllustration from '../../assets/security building illustration.png';
import './Register.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';
const initialForm = { fullName: '', email: '', phone: '', neighborhood: '', password: '', businessName: '', certificateFile: null };

const RegisterArtisan = () => {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false); // Used to show success screen

    // Update field state on change
    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
    };

    // Validate Step 1 - Personal Info
    const validateStep1 = () => {
        const nextErrors = {};
        if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
        if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
        if (!form.neighborhood.trim()) nextErrors.neighborhood = 'Neighborhood or zip code is required';
        if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
        if (!agreed) nextErrors.agreed = 'You must agree to the terms';
        return nextErrors;
    };

    // Validate Step 2 - Business & Verification
    const validateStep2 = () => {
        const nextErrors = {};
        if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required';
        if (!form.certificateFile) nextErrors.certificateFile = 'Certificate document is required';
        else if (form.certificateFile.size > 5 * 1024 * 1024) nextErrors.certificateFile = 'File must be 5MB or smaller';
        return nextErrors;
    };

    // Proceed to next step if validation passes
    const goNext = () => {
        const nextErrors = step === 1 ? validateStep1() : validateStep2();
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        setStep((current) => current + 1);
        setErrors({});
    };

    // Handle file selection and validation (must be PDF, JPG, or PNG, max 5MB)
    const acceptFile = (file) => {
        if (!file) return;
        const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!acceptedTypes.includes(file.type)) {
            setErrors((current) => ({ ...current, certificateFile: 'Upload a PDF, JPG, or PNG file' }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((current) => ({ ...current, certificateFile: 'File must be 5MB or smaller' }));
            return;
        }
        setForm((current) => ({ ...current, certificateFile: file }));
        setErrors((current) => ({ ...current, certificateFile: '' }));
    };

    const handleFile = (event) => acceptFile(event.target.files?.[0]);
    const handleDrop = (event) => {
        event.preventDefault();
        acceptFile(event.dataTransfer.files?.[0]);
    };
    const removeFile = (e) => {
        e.stopPropagation();
        setForm((current) => ({ ...current, certificateFile: null }));
        if (fileRef.current) fileRef.current.value = '';
    };

    // Submit form to API using promise chaining (no async/await)
    const submit = (event) => {
        event.preventDefault();
        
        // Prevent premature submission (e.g. if user hits Enter in an input on Step 1 or 2)
        if (step < 3) {
            goNext();
            return;
        }

        setLoading(true);
        setErrors({});

        const formData = new FormData();
        formData.append('fullName', form.fullName.trim());
        formData.append('email', form.email.trim());
        formData.append('phone', form.phone.trim());
        formData.append('neighborhood', form.neighborhood.trim());
        formData.append('password', form.password);
        formData.append('businessName', form.businessName.trim());
        formData.append('certificate', form.certificateFile);

        axios.post(`${API_URL}/api/auth/register-artisan`, formData)
            .then((response) => {
                setLoading(false);
                if (response.status === 201 || response.status === 200) {
                    setSuccess(true);
                } else {
                    setErrors({ form: 'Unexpected response from server' });
                }
            })
            .catch((error) => {
                setLoading(false);
                const message = error.response?.data?.message || 'Unable to reach the server. Please try again.';
                toast.error(message);
                setErrors({ form: message });
            });
    };

    // Reusable input component helper
    const input = (name, label, iconClass, placeholder, type = 'text', extra = {}) => (
        <div className="reg-field">
            <label className="reg-label" htmlFor={name}>{label}</label>
            <div className={`reg-input-wrap ${errors[name] ? 'has-error' : ''}`}>
                <i className={`${iconClass} reg-input-icon`}></i>
                <input
                    id={name} name={name} type={type} className="reg-input"
                    placeholder={placeholder} value={form[name]}
                    onChange={updateField} {...extra}
                />
                {name === 'password' && (
                    <button type="button" className="reg-eye-btn" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
                        {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                    </button>
                )}
            </div>
            {errors[name] && <span className="reg-error">{errors[name]}</span>}
        </div>
    );

    // Terms checkbox component
    const terms = (
        <div className="reg-terms">
            <label className="reg-terms-label">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="reg-checkbox" />
                <span>I agree to the <Link to="/terms" className="reg-link">Terms of Service</Link> and <Link to="/privacy" className="reg-link">Privacy Policy</Link>.</span>
            </label>
            {errors.agreed && <span className="reg-error">{errors.agreed}</span>}
        </div>
    );

    // Common Progress Indicator for Artisan
    const progress = (
        <div className="wizard-progress">
            <button type="button" className="wizard-back" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} aria-label="Go back">
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            {['Personal Info', 'Business & Verification', 'Review & Create'].map((label, index) => {
                const number = index + 1;
                return (
                    <React.Fragment key={label}>
                        <div className={`wizard-step ${step === number ? 'active' : ''} ${step > number ? 'complete' : ''}`}>
                            <span className="wizard-dot">{step > number ? <i className="fa-solid fa-check" style={{ fontSize: 12 }}></i> : number}</span>
                            <span>{label}</span>
                        </div>
                        {number < 3 && <span className={`wizard-line ${step > number ? 'complete' : ''}`} />}
                    </React.Fragment>
                );
            })}
        </div>
    );

    // Renders Step 1: Personal Info
    const personalStep = (
        <>
            <h2 className="register-card-title">Create Your Account</h2>
            <p className="register-card-sub">Join our artisan community and get access to more opportunities.</p>
            
            <h3 className="step-section-title">Personal Information</h3>
            {input('fullName', 'Full Name *', 'fa-solid fa-user', 'Enter your full name', 'text', { autoComplete: 'name' })}
            {input('email', 'Email Address *', 'fa-solid fa-envelope', 'you@example.com', 'email', { autoComplete: 'email' })}
            {input('phone', 'Phone Number *', 'fa-solid fa-phone', '+234 801 234 5678', 'tel', { autoComplete: 'tel' })}
            {input('neighborhood', 'Neighborhood / Zip Code *', 'fa-solid fa-location-dot', 'e.g. 90210 or Downtown')}
            {input('password', 'Password *', 'fa-solid fa-lock', 'Create a strong password', showPassword ? 'text' : 'password', { autoComplete: 'new-password' })}
            
            {terms}
            {errors.form && <span className="reg-error">{errors.form}</span>}
            
            <div className="wizard-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="reg-submit-btn" onClick={goNext}>
                    Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                </button>
            </div>
        </>
    );

    // Renders Step 2: Business Information and Certificate Upload
    const businessStep = (
        <>
            <h2 className="register-card-title">Business Information</h2>
            <p className="register-card-sub">Tell us about your brand and provide verification.</p>
            
            {input('businessName', 'Brand / Business Name *', 'fa-solid fa-store', 'Enter your official brand or business name')}
            <p className="password-hint" style={{ marginTop: '-8px', marginBottom: '12px' }}>This will be displayed on your profile and to customers.</p>
            
            <div className="reg-field">
                <label className="reg-label">Certificate Verification Upload *</label>
                <p className="password-hint">Upload your professional certification or qualification documents (e.g. trade test certificate, professional license).</p>
                
                <button type="button" className={`upload-dropzone ${errors.certificateFile ? 'has-error' : ''}`} onClick={() => fileRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
                    {form.certificateFile ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                            {form.certificateFile.type.startsWith('image/') && (
                                <img 
                                    src={URL.createObjectURL(form.certificateFile)} 
                                    alt="Preview" 
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                                />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-file-check" style={{ fontSize: 20, color: '#10b981' }}></i>
                                <strong>{form.certificateFile.name}</strong>
                                <span style={{ fontSize: '12px' }}>({(form.certificateFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', color: '#ef4444', padding: '4px' }} onClick={removeFile} aria-label="Remove file"></i>
                            </div>
                        </div>
                    ) : (
                        <>
                            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 20 }}></i>
                            <strong>Click to upload or drag and drop</strong>
                            <span>PDF, JPG or PNG (Max. 5MB)</span>
                        </>
                    )}
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleFile} />
                {errors.certificateFile && <span className="reg-error">{errors.certificateFile}</span>}
            </div>

            <div className="wizard-actions">
                <button type="button" className="wizard-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="reg-submit-btn" onClick={goNext}>
                    Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                </button>
            </div>
        </>
    );

    // Summary block helper for Step 3
    const summaryBlock = (title, onEdit, items) => (
        <section className="summary-card">
            <div className="summary-header">
                <strong>{title}</strong>
                <button type="button" onClick={onEdit}>Edit</button>
            </div>
            {items.map(([iconClass, label, value]) => (
                <div className="summary-row" key={label}>
                    <i className={`${iconClass}`} style={{ fontSize: 13 }}></i>
                    <span>{label}</span>
                    <strong>{value || 'Not provided'}</strong>
                </div>
            ))}
        </section>
    );

    // Renders Step 3: Review Details and Submit
    const reviewStep = (
        <>
            <h2 className="review-title">Review &amp; Create</h2>
            <p className="register-card-sub">Please confirm your information is correct before submitting.</p>
            
            {summaryBlock('Personal Information', () => setStep(1), [
                ['fa-solid fa-user', 'Full Name', form.fullName],
                ['fa-solid fa-envelope', 'Email Address', form.email],
                ['fa-solid fa-phone', 'Phone Number', form.phone],
                ['fa-solid fa-location-dot', 'Neighborhood', form.neighborhood]
            ])}
            
            {summaryBlock('Business Information', () => setStep(2), [
                ['fa-solid fa-store', 'Business Name', form.businessName],
                ['fa-solid fa-file-lines', 'Certificate', form.certificateFile?.name || 'Not uploaded']
            ])}
            
            {errors.form && <span className="reg-error">{errors.form}</span>}
            
            <div className="wizard-actions">
                <button type="button" className="wizard-secondary" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="reg-submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : <>Create Account <i className="fa-solid fa-check" style={{ marginLeft: 6 }}></i></>}
                </button>
            </div>
        </>
    );

    // Render Success Screen
    if (success) {
        return (
            <div className="register-page official-page">
                <div className="register-logo-bar">
                    <Link to="/"><img src={logo} alt="Fixit" className="register-logo" /></Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <div className="register-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}></i>
                        <h2 className="register-card-title">Registration Received</h2>
                        <p className="register-card-sub" style={{ marginTop: '12px' }}>Your artisan profile and certificate are currently under review. We will notify you once your account has been verified.</p>
                        <button className="reg-submit-btn" onClick={() => navigate('/')} style={{ marginTop: '24px' }}>Return to Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page official-page">
            <div className="register-logo-bar">
                <Link to="/"><img src={logo} alt="Fixit" className="register-logo" /></Link>
            </div>
            
            <header className="official-page-heading">
                <h1>Artisan - Create Account</h1>
                <p>A secure and simple sign up experience for verified artisans and skilled professionals.</p>
            </header>
            
            <div className="register-split">
                <div className="register-hero register-reveal register-reveal-hero">
                    <div className="register-hero-content">
                        <h1 className="register-hero-headline">
                            Your skill,<br/><span className="hero-accent">trusted by your community.</span>
                        </h1>
                        <p className="register-hero-subtitle">
                            Get verified, showcase your work and connect with customers who need your services.
                        </p>
                        
                        <div className="register-badges">
                            <div className="register-badge">
                                <div className="badge-icon-wrap">
                                    <i className="fa-solid fa-user-check" style={{ fontSize: 20 }}></i>
                                </div>
                                <div>
                                    <div className="badge-title">Get Verified</div>
                                    <div className="badge-desc">Showcase your qualifications to build trust.</div>
                                </div>
                            </div>
                            <div className="register-badge">
                                <div className="badge-icon-wrap">
                                    <i className="fa-solid fa-briefcase" style={{ fontSize: 20 }}></i>
                                </div>
                                <div>
                                    <div className="badge-title">Get Hired</div>
                                    <div className="badge-desc">Connect directly with customers in your area.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="register-illustration-wrap">
                        <img src={neighborhoodIllustration} alt="Connected neighborhood" className="register-illustration" />
                    </div>
                </div>
                
                <div className="register-form-side register-reveal register-reveal-card">
                    <div className="register-card">
                        {progress}
                        <form onSubmit={submit} className="register-form" noValidate>
                            {step === 1 ? personalStep : step === 2 ? businessStep : reviewStep}
                        </form>
                        <p className="reg-footer-link">Already have an account? <Link to="/login" className="reg-link">Log in here</Link></p>
                    </div>
                </div>
            </div>
            
            <div className="secure-strip register-reveal register-reveal-strip">
                <i className="fa-solid fa-shield-halved" style={{ fontSize: 24 }}></i>
                <div>
                    <strong>Secure &amp; Verified</strong>
                    <span>All artisan accounts are reviewed and verified before full access is granted.</span>
                </div>
                <i className="fa-solid fa-lock" style={{ fontSize: 20 }}></i>
                <div>
                    <strong>Your data is encrypted and secure</strong>
                    <span>We take your privacy seriously.</span>
                </div>
                <img src={securityIllustration} alt="Secure Fixit community" />
            </div>
        </div>
    );
};

export default RegisterArtisan;
