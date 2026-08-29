import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Send } from 'lucide-react';
import logo from '../../assets/fixit.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-large">
      <Container>
        <Row className="gy-4 mb-5">
          <Col lg={3} md={6}>
            <img src={logo} alt="FixIt" height="50" className="mb-3" />
            <p className="footer-text mb-4">
              Empowering communities, one fix at a time.
            </p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="footer-col">
            <h5 className="footer-heading">Explore</h5>
            <ul className="footer-links-list">
              <li><a href="/">Home</a></li>
              <li><a href="/explore">Explore Issues</a></li>
              <li><a href="/map">Community Map</a></li>
              <li><a href="/register">Report a Problem</a></li>
            </ul>
          </Col>

          <Col lg={2} md={6} className="footer-col">
            <h5 className="footer-heading">Community</h5>
            <ul className="footer-links-list">
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Recent Activity</a></li>
              <li><a href="#">Trending Issues</a></li>
              <li><a href="#">Recently Resolved</a></li>
            </ul>
          </Col>

          <Col lg={2} md={6} className="footer-col">
            <h5 className="footer-heading">Support</h5>
            <ul className="footer-links-list">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Support</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </Col>

          <Col lg={3} md={6} className="footer-col">
            <h5 className="footer-heading">Stay Connected</h5>
            <p className="footer-text mb-3">
              Subscribe to our newsletter for updates and community highlights.
            </p>
            <Form className="newsletter-form">
              <div className="d-flex">
                <Form.Control type="email" placeholder="Your email address" className="newsletter-input" />
                <Button className="newsletter-btn"><Send size={16} /></Button>
              </div>
            </Form>
          </Col>
        </Row>
        
        <div className="footer-bottom text-center">
          <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
            &copy; 2026 FixIt Community Systems. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
