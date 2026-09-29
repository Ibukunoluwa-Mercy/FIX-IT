import React from 'react';
import { Link } from 'react-router-dom';

// Reusable input component helper
export const InputField = ({ name, label, iconClass, placeholder, type = 'text', form, errors, updateField, showPassword, setShowPassword, extra = {} }) => (
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

export const Step1Personal = ({ form, errors, updateField, agreed, setAgreed, showPassword, setShowPassword, goNext }) => (
    <>
        <h2 className="register-card-title">Create Your Account</h2>
        <p className="register-card-sub">Join our artisan community and get access to more opportunities.</p>
        
        <h3 className="step-section-title">Personal Information</h3>
        <InputField name="fullName" label="Full Name *" iconClass="fa-solid fa-user" placeholder="Enter your full name" type="text" form={form} errors={errors} updateField={updateField} extra={{ autoComplete: 'name' }} />
        <InputField name="email" label="Email Address *" iconClass="fa-solid fa-envelope" placeholder="you@example.com" type="email" form={form} errors={errors} updateField={updateField} extra={{ autoComplete: 'email' }} />
        <InputField name="phone" label="Phone Number *" iconClass="fa-solid fa-phone" placeholder="+234 801 234 5678" type="tel" form={form} errors={errors} updateField={updateField} extra={{ autoComplete: 'tel' }} />
        <InputField name="neighborhood" label="Neighborhood / Zip Code *" iconClass="fa-solid fa-location-dot" placeholder="e.g. 90210 or Downtown" form={form} errors={errors} updateField={updateField} />
        <InputField name="password" label="Password *" iconClass="fa-solid fa-lock" placeholder="Create a strong password" type={showPassword ? 'text' : 'password'} form={form} errors={errors} updateField={updateField} showPassword={showPassword} setShowPassword={setShowPassword} extra={{ autoComplete: 'new-password' }} />
        
        <div className="reg-terms">
            <label className="reg-terms-label">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="reg-checkbox" />
                <span>I agree to the <Link to="/terms" className="reg-link">Terms of Service</Link> and <Link to="/privacy" className="reg-link">Privacy Policy</Link>.</span>
            </label>
            {errors.agreed && <span className="reg-error">{errors.agreed}</span>}
        </div>
        
        {errors.form && <span className="reg-error">{errors.form}</span>}
        
        <div className="wizard-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="reg-submit-btn" onClick={goNext}>
                Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
            </button>
        </div>
    </>
);

export const Step2Business = ({ form, errors, updateField, fileRef, handleDrop, removeFile, handleFile, goNext, setStep }) => (
    <>
        <h2 className="register-card-title">Business Information</h2>
        <p className="register-card-sub">Tell us about your brand and provide verification.</p>
        
        <InputField name="businessName" label="Brand / Business Name *" iconClass="fa-solid fa-store" placeholder="Enter your official brand or business name" form={form} errors={errors} updateField={updateField} />
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

const SummaryBlock = ({ title, onEdit, items }) => (
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

export const Step3Review = ({ form, errors, loading, setStep }) => (
    <>
        <h2 className="review-title">Review &amp; Create</h2>
        <p className="register-card-sub">Please confirm your information is correct before submitting.</p>
        
        <SummaryBlock title="Personal Information" onEdit={() => setStep(1)} items={[
            ['fa-solid fa-user', 'Full Name', form.fullName],
            ['fa-solid fa-envelope', 'Email Address', form.email],
            ['fa-solid fa-phone', 'Phone Number', form.phone],
            ['fa-solid fa-location-dot', 'Neighborhood', form.neighborhood]
        ]} />
        
        <SummaryBlock title="Business Information" onEdit={() => setStep(2)} items={[
            ['fa-solid fa-store', 'Business Name', form.businessName],
            ['fa-solid fa-file-lines', 'Certificate', form.certificateFile?.name || 'Not uploaded']
        ]} />
        
        {errors.form && <span className="reg-error">{errors.form}</span>}
        
        <div className="wizard-actions">
            <button type="button" className="wizard-secondary" onClick={() => setStep(2)}>Back</button>
            <button type="submit" className="reg-submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : <>Create Account <i className="fa-solid fa-check" style={{ marginLeft: 6 }}></i></>}
            </button>
        </div>
    </>
);
