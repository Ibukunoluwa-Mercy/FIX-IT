import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import CommunityMapPage from './pages/CommunityMapPage/CommunityMapPage'
import ExploreIssuesPage from './pages/ExploreIssuesPage/ExploreIssuesPage'
import AboutPage from './pages/AboutPage/AboutPage'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import ResidentDashboard from './pages/ResidentDashboard/ResidentDashboard'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth-only routes that should render without the Navbar/Footer shell
const AUTH_ROUTES = ['/register', '/login', '/forgot-password', '/reset-password'];
const DASHBOARD_ROUTES = ['/dashboard'];

function AppShell() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);
  const isDashboard = DASHBOARD_ROUTES.includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  if (isDashboard) return <Routes><Route path="/dashboard" element={<ResidentDashboard />} /></Routes>;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<CommunityMapPage />} />
          <Route path="/explore" element={<ExploreIssuesPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App
