import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('fixitToken');
    const [loading, setLoading] = useState(!token);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));
    const location = useLocation();

    useEffect(() => {
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        })
            .then(response => {
                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('fixitToken');
                    localStorage.removeItem('fixitUser');
                    setIsAuthenticated(false);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Auth check failed:", error);
                // On temporary network glitch, rely on existing token state instead of logging out
                setLoading(false);
            });
    }, [location.pathname, token]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justify: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#031525',
                color: '#ffffff',
                fontFamily: 'sans-serif',
                gap: '16px'
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#f97316',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Verifying session...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
