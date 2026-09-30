import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../../assets/fixit-logo-white.png';
import neighborhoodIllustration from '../../assets/neighborhood_illustration.png';
import securityIllustration from '../../assets/security building illustration.png';
import './Register.css';
import { Step1Personal, Step2Business, Step3Review } from './ArtisanFormSteps';
import RegistrationSuccess from './RegistrationSuccess';

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
    const [success, setSuccess] = useState(false); 

    
    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
    };

    
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

    
    const validateStep2 = () => {
        const nextErrors = {};
        if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required';
        if (!form.certificateFile) nextErrors.certificateFile = 'Certificate document is required';
        else if (form.certificateFile.size > 5 * 1024 * 1024) nextErrors.certificateFile = 'File must be 5MB or smaller';
        return nextErrors;
    };

    const [lastStepChange, setLastStepChange] = useState(0);

    
    const goNext = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const nextErrors = step === 1 ? validateStep1() : validateStep2();
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        setStep((current) => current + 1);
        setLastStepChange(Date.now());
        setErrors({});
    };

    
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

    
    const submit = (event) => {
        if (event && event.preventDefault) event.preventDefault();
        
        
        if (Date.now() - lastStepChange < 500) {
            return;
        }
        
        
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

        axios.post(`${API_URL}/api/artisans/register`, formData)
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

    
    if (success) {
        
        const verificationEndsAt = Date.now() + 2 * 60 * 1000;
        return <RegistrationSuccess email={form.email} verificationEndsAt={verificationEndsAt} />;
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
                            {step === 1 && (
                                <Step1Personal 
                                    form={form} errors={errors} updateField={updateField} 
                                    agreed={agreed} setAgreed={setAgreed} 
                                    showPassword={showPassword} setShowPassword={setShowPassword} 
                                    goNext={goNext} 
                                />
                            )}
                            {step === 2 && (
                                <Step2Business 
                                    form={form} errors={errors} updateField={updateField} 
                                    fileRef={fileRef} handleDrop={handleDrop} removeFile={removeFile} handleFile={handleFile} 
                                    goNext={goNext} setStep={setStep} 
                                />
                            )}
                            {step === 3 && (
                                <Step3Review 
                                    form={form} errors={errors} loading={loading} setStep={setStep} 
                                />
                            )}
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
