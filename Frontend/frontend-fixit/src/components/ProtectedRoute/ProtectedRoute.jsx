import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // 1. Call GET /api/auth/me on load to verify token validity securely via httpOnly cookie or Auth Header
        // 2. We use fetch and promise chaining as per the frontend standard
        fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                // If using localStorage token as a fallback:
                'Authorization': `Bearer ${localStorage.getItem('fixitToken')}`
            },
            credentials: 'include'
        })
            .then(response => {
                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
                setLoading(false);
            });
    }, [location.pathname]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Verifying session...</div>;
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
