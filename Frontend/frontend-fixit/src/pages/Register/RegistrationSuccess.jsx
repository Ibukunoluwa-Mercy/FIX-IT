import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/fixit-logo-white.png';

const RegistrationSuccess = ({ email, verificationEndsAt }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!verificationEndsAt) return;
        
        const calculateTimeLeft = () => {
            const diff = new Date(verificationEndsAt).getTime() - Date.now();
            if (diff <= 0) return 0;
            return Math.floor(diff / 1000);
        };

        setTimeLeft(calculateTimeLeft());
        
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [verificationEndsAt]);

    const formatTime = (seconds) => {
        if (seconds === null) return null;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="register-page official-page">
            <div className="register-logo-bar">
                <Link to="/"><img src={logo} alt="Fixit" className="register-logo" /></Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="register-card" style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '56px', color: '#10b981', marginBottom: '16px', padding: '10px' }}></i>
                    <h2 className="register-card-title" style={{ color: '#0f172a', fontWeight: '700' }}>Registration Successful!</h2>
                    <p className="register-card-sub" style={{ marginTop: '16px', fontSize: '15px', color: '#475569', lineHeight: '1.5' }}>
                        Login in the next two minutes to have access to your dashboard. We're currently verifying your information.
                    </p>
                    {timeLeft !== null && timeLeft > 0 && (
                        <p style={{ marginTop: '12px', fontSize: '14px', color: '#f59e0b', fontWeight: '500' }}>
                            Ready in {formatTime(timeLeft)}
                        </p>
                    )}
                    <button 
                        className="reg-submit-btn" 
                        onClick={() => navigate('/login', { state: { email } })} 
                        style={{ marginTop: '28px' }}
                    >
                        Go to Login <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
