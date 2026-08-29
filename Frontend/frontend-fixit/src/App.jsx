import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage'
import CommunityMapPage from './pages/CommunityMapPage'
import ExploreIssuesPage from './pages/ExploreIssuesPage'
// Placeholder for other pages to avoid routing errors
const Placeholder = ({ title }) => <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><h1>{title}</h1></div>

function App() {
  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<CommunityMapPage />} />
            <Route path="/explore" element={<ExploreIssuesPage />} />
            <Route path="/register" element={<Placeholder title="Create Account Page" />} />
            <Route path="/about" element={<Placeholder title="About Page" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
