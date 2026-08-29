import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ArrowRight, PlusCircle, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImpactCounters from '../../components/ImpactCounters/ImpactCounters';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import ReportCategories from '../../components/ReportCategories/ReportCategories';
import CommunityImpact from '../../components/CommunityImpact/CommunityImpact';
import CTABanner from '../../components/CTABanner/CTABanner';
import ReportCard from '../../components/ReportCard/ReportCard';

// Images
import img1 from '../../assets/homepage one.jpeg';
import img2 from '../../assets/homepage two.jpeg';
import img3 from '../../assets/homepage three.jpeg';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: null,
    recentActivity: [
      {
        id: 1,
        image: img1,
        status: 'Resolved',
        location: 'MAPLE STREET DISTRICT',
        title: 'Large Pothole on Main Rd',
        description: 'There is a significant pothole in the right lane going northbound, causing cars to swerve dangerously...',
        user: 'John S.',
        time: '2 days ago'
      },
      {
        id: 2,
        image: img2,
        status: 'In Progress',
        location: 'WESTSIDE PARK',
        title: 'Damaged Streetlight',
        description: 'The streetlight near the park entrance was hit by a truck and is leaning over the sidewalk, posing a...',
        user: 'Maria R.',
        time: '5 hours ago'
      },
      {
        id: 3,
        image: img3,
        status: 'Verified',
        location: 'DOWNTOWN ALLEY 4',
        title: 'Illegal Dumping',
        description: 'Large pile of construction debris and old furniture dumped behind the commercial buildings blocking...',
        user: 'Alex K.',
        time: 'Just now'
      }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2701';
        const response = await axios.get(`${apiBaseUrl}/api/reports/home-data`);
        if (response.data && response.data.recentActivity && Array.isArray(response.data.recentActivity)) {
          setData(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.log('Using fallback data as /api/reports/home-data is not available yet');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <div className="animate-slide-in">
            <h1 className="hero-title">Help Make Your Community<br />Better</h1>
            <p className="hero-subtitle">
              Join thousands of neighbors working together to identify, track, and resolve local issues. Your voice is the first step toward a safer, cleaner environment for everyone.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn-primary-custom" 
                onClick={() => navigate('/register')}
              >
                <PlusCircle size={18} /> Report a Problem
              </button>
              <button 
                className="btn-secondary-custom"
                onClick={() => navigate('/map')}
              >
                <Compass size={18} /> Explore Community Issues
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Impact Stats */}
      <ImpactCounters data={data.stats} />

      {/* How It Works */}
      <HowItWorks />

      {/* Recent Activity */}
      <section className="recent-activity-section">
        <Container>
          <div className="section-header animate-slide-in delay-200">
            <div>
              <h2 className="section-title">Recent Activity</h2>
              <p className="section-subtitle">See what's being reported and resolved near you.</p>
            </div>
            <Link to="/map" className="view-all-link">
              View All Map <ArrowRight size={18} />
            </Link>
          </div>
          <Row className="g-4">
            {data?.recentActivity?.map((item, index) => (
              <Col md={4} key={item.id || index}>
                <ReportCard item={item} index={index} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* What Can You Report */}
      <ReportCategories />

      {/* Community Impact */}
      <CommunityImpact />

      {/* CTA Banner */}
      <CTABanner />
    </div>
  );
};

export default HomePage;
