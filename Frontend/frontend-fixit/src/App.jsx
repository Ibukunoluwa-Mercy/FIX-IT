import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import CommunityMapPage from './pages/CommunityMapPage/CommunityMapPage'
import ExploreIssuesPage from './pages/ExploreIssuesPage/ExploreIssuesPage'
import AboutPage from './pages/AboutPage/AboutPage'
import Register from './pages/Register/Register'

// Auth-only routes that should render without the Navbar/Footer shell
const AUTH_ROUTES = ['/register', '/login'];

function AppShell() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

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
    </Router>
  );
}

export default App
