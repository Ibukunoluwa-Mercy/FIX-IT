import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import logoWhite from '../../assets/fixit-white-logo.png';
import ArtisanReportsPage from './ArtisanReportsPage';
import './ArtisanDashboard.css';

// The main layout and dashboard component for Artisans
const ArtisanDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isReportsRoute = location.pathname.includes('/reports');

    // State for user data (from localStorage cache first, then updated via /api/auth/me)
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('fixitUser');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // State for dashboard summary data
    const [stats, setStats] = useState({
        totalReports: 0,
        totalEarnings: 0,
        totalReviews: 0,
        unreadMessages: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100';

    // Toggle sidebar on mobile
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    
    // Check authentication and user role on mount
    useEffect(() => {
        // We use fetch with credentials as requested (no async/await)
        fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('fixitToken')}`,
                'Content-Type': 'application/json'
            },
        })
        .then((response) => {
            if (response.status === 401) {
                // Not authenticated, redirect to login
                navigate('/login');
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then((data) => {
            const fetchedUser = data.user || data;
            
            // Check if role is artisan, otherwise redirect
            const userRole = String(fetchedUser.role || '').toLowerCase();
            if (userRole !== 'artisan') {
                navigate('/dashboard'); // Let the main app router handle standard dashboards based on role
                return;
            }
            setUser(fetchedUser);
            try {
                localStorage.setItem('fixitUser', JSON.stringify(fetchedUser));
            } catch {
                // Ignore storage write issues
            }
        })
        .catch((err) => {
            console.error('Auth error:', err);
            // If token is missing, redirect to login
            if (!localStorage.getItem('fixitToken')) {
                navigate('/login');
            }
        });
    }, [navigate, API_URL]);

    // Fetch dashboard summary (stats, recent activity)
    const fetchDashboardSummary = () => {
        setIsLoadingStats(true);
        setStatsError(false);

        fetch(`${API_URL}/api/artisans/dashboard/summary`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('fixitToken')}`,
                'Content-Type': 'application/json'
            },
        })
        .then((response) => {
            if (response.status === 401) {
                // Redirect to login on 401 Unauthorized
                localStorage.removeItem('fixitToken');
                localStorage.removeItem('fixitUser');
                navigate('/login');
                throw new Error('Unauthorized');
            }
            if (response.status === 403 || response.status === 500 || !response.ok) {
                return response.json().then((errData) => {
                    throw new Error(errData.message || `Server returned status ${response.status}`);
                }).catch((jsonErr) => {
                    throw new Error(jsonErr.message || `Request failed with status ${response.status}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            // Dev-only logging to verify API field path matching
            if (process.env.NODE_ENV !== 'production') {
                console.log('[Dev Debug] Raw Artisan Dashboard Summary API Response:', data);
                console.log('[Dev Debug] Field data.stats.totalReports:', data.stats?.totalReports);
            }

            // Replace stats and activity state directly from server response (no default 0 hiding errors)
            if (data && data.stats) {
                setStats({
                    totalReports: data.stats.totalReports ?? 0,
                    totalEarnings: data.stats.totalEarnings ?? 0,
                    totalReviews: data.stats.totalReviews ?? 0,
                    unreadMessages: data.stats.unreadMessages ?? 0,
                });
            }
            if (data && data.artisan && data.artisan.avatarUrl) {
                setUser((prev) => ({
                    ...prev,
                    avatarUrl: data.artisan.avatarUrl,
                    profilePhoto: data.artisan.avatarUrl,
                }));
            }
            setRecentActivity(data.recentActivity || []);
            setIsLoadingStats(false);
            setStatsError(false);
        })
        .catch((err) => {
            console.error('Artisan dashboard summary fetch failed:', err.message);
            setIsLoadingStats(false);
            // Set error message for user retry state (never reset stats to fake 0)
            setStatsError(err.message || 'Could not load summary');
        });
    };

    // Set up polling for real-time updates (every 30s) and refresh on browser tab focus
    useEffect(() => {
        // Initial fetch
        fetchDashboardSummary();

        // Polling interval every 30 seconds
        const intervalId = setInterval(() => {
            fetchDashboardSummary();
        }, 30000);

        // Fetch when browser tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchDashboardSummary();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup interval and event listener on unmount
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [API_URL, navigate]);

    // Logout function
    const handleLogout = () => {
        fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('fixitToken')}`,
                'Content-Type': 'application/json'
            },
        })
        .then(() => {
            localStorage.removeItem('fixitToken');
            localStorage.removeItem('fixitUser');
            navigate('/login');
        })
        .catch((err) => {
            console.error('Logout error:', err);
            // Even if API fails, clear local storage and redirect
            localStorage.removeItem('fixitToken');
            localStorage.removeItem('fixitUser');
            navigate('/login');
        });
    };

    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return 'A';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    if (!user) {
        // Render a loading state until user is verified
        return <div className="artisan-dashboard-loading">Loading...</div>;
    }

    // Determine verification badge content based on status
    const status = user.verificationStatus || 'pending';
    let verifyBadge = null;
    if (status === 'pending') {
        verifyBadge = (
            <div className="verification-badge pending">
                <div className="badge-icon"><i className="fa-solid fa-check" /></div>
                <div className="badge-text">
                    <strong>Account Under Review</strong>
                    <span>We'll notify you once your information is verified.</span>
                </div>
            </div>
        );
    } else if (status === 'approved') {
        verifyBadge = (
            <div className="verification-badge approved">
                <div className="badge-icon"><i className="fa-solid fa-check-circle" /></div>
                <div className="badge-text">
                    <strong>Account Verified</strong>
                </div>
            </div>
        );
    } else if (status === 'rejected') {
        verifyBadge = (
            <div className="verification-badge rejected">
                <div className="badge-icon"><i className="fa-solid fa-times-circle" /></div>
                <div className="badge-text">
                    <strong>Verification Rejected</strong>
                    <span>{user.verificationReason || 'Please review your documents.'} <a href="/settings">Re-upload certificate</a></span>
                </div>
            </div>
        );
    }

    return (
        <div className="artisan-layout artisan-dashboard">
            {/* Dark Navy Sidebar */}
            {/* Backdrop for mobile to close sidebar */}
            {isSidebarOpen && (
                <div 
                    className="artisan-sidebar-backdrop" 
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            <aside className={`artisan-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <Link to="/dashboard/artisan" className="artisan-brand" aria-label="Fixit dashboard" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setIsSidebarOpen(false)}>
                        <img src={logoWhite} alt="FixIt" className="brand-logo-img" style={{height: '32px'}} />
                        <span className="brand-word">
                            Fix<span style={{ color: '#f59e0b' }}>It</span>
                        </span>
                    </Link>
                    {/* Close button for mobile inside sidebar */}
                    <button className="mobile-close-btn" onClick={toggleSidebar} aria-label="Close sidebar">
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>
                
                <nav className="sidebar-nav" aria-label="Main Navigation">
                    <NavLink to="/dashboard/artisan" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end onClick={() => setIsSidebarOpen(false)}>
                        <i className="fa-solid fa-house nav-icon"></i>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/dashboard/artisan/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
                        <i className="fa-solid fa-file-lines nav-icon"></i>
                        <span>Reports</span>
                    </NavLink>
                    <NavLink to="/dashboard/artisan/messages" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
                        <div className="nav-icon-wrapper">
                            <i className="fa-solid fa-envelope nav-icon"></i>
                        </div>
                        <span>Messages</span>
                        {stats.unreadMessages > 0 && (
                            <span className="nav-badge-dot">{stats.unreadMessages}</span>
                        )}
                    </NavLink>
                    <NavLink to="/dashboard/artisan/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
                        <i className="fa-solid fa-gear nav-icon"></i>
                        <span>Settings</span>
                    </NavLink>
                    <NavLink to="/dashboard/artisan/reviews" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => setIsSidebarOpen(false)}>
                        <i className="fa-solid fa-star nav-icon"></i>
                        <span>Reviews</span>
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="need-help-card">
                        <div className="help-header">
                            <i className="fa-solid fa-headset help-icon"></i>
                            <div>
                                <strong>Need Help?</strong>
                                <span>Contact our support team.</span>
                            </div>
                        </div>
                        <button className="help-btn" onClick={() => navigate('/help-center')}>
                            Help Center <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="artisan-main">
                {/* Top Bar */}
                <header className="artisan-topbar">
                    <div className="topbar-left">
                        {/* Mobile hamburger button */}
                        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Open sidebar">
                            <i className="fa-solid fa-bars"></i>
                        </button>
                    </div>
                    <div className="topbar-right">
                        <button className="notification-btn" aria-label="Notifications">
                            <i className="fa-regular fa-bell"></i>
                            {stats.unreadMessages > 0 && (
                                <span className="notification-badge">{stats.unreadMessages}</span>
                            )}
                        </button>
                        
                        <div className="profile-dropdown-wrapper">
                            <button 
                                className="profile-trigger" 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                aria-expanded={isProfileMenuOpen}
                                aria-haspopup="true"
                            >
                                {user.avatarUrl || user.profilePhoto ? (
                                    <img 
                                        src={(user.avatarUrl || user.profilePhoto).startsWith('/uploads/') ? `${API_URL}${user.avatarUrl || user.profilePhoto}` : (user.avatarUrl || user.profilePhoto)} 
                                        alt="Profile" 
                                        className="avatar-img" 
                                    />
                                ) : (
                                    <div className="avatar-initials">{getInitials(user.fullName || user.name)}</div>
                                )}
                                <span className="profile-name">{user.fullName || user.name}</span>
                                <i className="fa-solid fa-chevron-down dropdown-icon"></i>
                            </button>
                            
                            {isProfileMenuOpen && (
                                <div className="artisan-profile-menu">
                                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/dashboard/artisan/settings'); }}>
                                        Profile
                                    </button>
                                    <button onClick={() => { setIsProfileMenuOpen(false); navigate('/dashboard/artisan/settings'); }}>
                                        Settings
                                    </button>
                                    <button onClick={handleLogout} className="logout-btn">
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="artisan-content">
                    {isReportsRoute ? (
                        <ArtisanReportsPage onReportStatusChanged={fetchDashboardSummary} />
                    ) : (
                        <>
                            {/* Welcome Section */}
                            <section className="welcome-section">
                        <div className="welcome-text">
                            {/* Greeting using static Welcome */}
                            <h1>Welcome {user.fullName ? user.fullName.split(' ')[0] : user.name}👋</h1>
                            <p>Welcome to your artisan dashboard. Stay on top of your jobs, track your progress and manage your profile.</p>
                        </div>
                        <div className="welcome-badge-wrapper">
                            {verifyBadge}
                        </div>
                    </section>

                    {/* Stat Cards Grid */}
                    <section className="stats-grid">
                        {/* Reports Card */}
                        <div className="stat-card reports-card">
                            <div className="stat-icon-wrapper">
                                <i className="fa-regular fa-calendar-check stat-icon"></i>
                            </div>
                            <div className="stat-info">
                                {isLoadingStats ? (
                                    <div className="skeleton skeleton-number"></div>
                                ) : (
                                    <h2 className="stat-number">{stats.totalReports}</h2>
                                )}
                                <span className="stat-title">Reports</span>
                                <span className="stat-sub">Total reports submitted</span>
                            </div>
                        </div>

                        {/* Earnings Card */}
                        <div className="stat-card earnings-card">
                            <div className="stat-icon-wrapper">
                                <i className="fa-solid fa-wallet stat-icon"></i>
                            </div>
                            <div className="stat-info">
                                {isLoadingStats ? (
                                    <div className="skeleton skeleton-number"></div>
                                ) : (
                                    <h2 className="stat-number">
                                        {Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(stats.totalEarnings)}
                                    </h2>
                                )}
                                <span className="stat-title">Total Earnings</span>
                                <span className="stat-sub">From completed reports</span>
                            </div>
                        </div>

                        {/* Reviews Card */}
                        <div className="stat-card reviews-card">
                            <div className="stat-icon-wrapper">
                                <i className="fa-solid fa-star stat-icon"></i>
                            </div>
                            <div className="stat-info">
                                {isLoadingStats ? (
                                    <div className="skeleton skeleton-number"></div>
                                ) : (
                                    <h2 className="stat-number">{stats.totalReviews}</h2>
                                )}
                                <span className="stat-title">Reviews</span>
                                <span className="stat-sub">From satisfied customers</span>
                            </div>
                        </div>

                        {/* Messages Card */}
                        <div className="stat-card messages-card">
                            <div className="stat-icon-wrapper">
                                <i className="fa-solid fa-comment-dots stat-icon"></i>
                            </div>
                            <div className="stat-info">
                                {isLoadingStats ? (
                                    <div className="skeleton skeleton-number"></div>
                                ) : (
                                    <h2 className="stat-number">{stats.unreadMessages}</h2>
                                )}
                                <span className="stat-title">New Messages</span>
                                <span className="stat-sub">From customers</span>
                            </div>
                        </div>

                        {statsError && (
                            <div className="stats-error-banner">
                                <span><i className="fa-solid fa-triangle-exclamation ms-1"></i> {typeof statsError === 'string' ? statsError : 'Could not load dashboard stats'}</span>
                                <button onClick={fetchDashboardSummary} className="retry-btn">
                                    <i className="fa-solid fa-rotate-right ms-1"></i> Retry
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Recent Activity Card */}
                    <section className="recent-activity-card">
                        <div className="card-header">
                            <div className="header-left">
                                <i className="fa-regular fa-clock header-icon"></i>
                                <h2>Recent Activity</h2>
                            </div>
                            <button className="view-all-btn" onClick={() => navigate('/dashboard/artisan/reports')}>
                                View All
                            </button>
                        </div>
                        
                        <div className="activity-list">
                            {isLoadingStats ? (
                                <div className="activity-skeleton">
                                    <div className="skeleton skeleton-row"></div>
                                    <div className="skeleton skeleton-row"></div>
                                </div>
                            ) : recentActivity.length > 0 ? (
                                recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-details">
                                            <strong>{activity.title}</strong>
                                            <span>{activity.category} • {activity.neighborhood}</span>
                                        </div>
                                        <div className="activity-time">
                                            {activity.relativeTime || "Just now"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* Empty State */
                                <div className="empty-state">
                                    <div className="empty-illustration">
                                        <i className="fa-solid fa-magnifying-glass illustration-icon"></i>
                                    </div>
                                    <h3>No recent activity yet</h3>
                                    <p>Your latest reports, updates and activities will appear here.</p>
                                </div>
                            )}
                        </div>
                    </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ArtisanDashboard;
