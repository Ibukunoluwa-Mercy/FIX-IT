import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './ReportCategories.css';

const categories = [
  { name: 'Roads & Potholes', icon: <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 22 }}></i>, colorClass: 'cat-red' },
  { name: 'Waste & Dumping', icon: <i className="fa-solid fa-trash-can" style={{ fontSize: 22 }}></i>, colorClass: 'cat-green' },
  { name: 'Flooding & Drainage', icon: <i className="fa-solid fa-water" style={{ fontSize: 22 }}></i>, colorClass: 'cat-blue' },
  { name: 'Streetlights', icon: <i className="fa-solid fa-lightbulb" style={{ fontSize: 22 }}></i>, colorClass: 'cat-orange' },
  { name: 'Water Problems', icon: <i className="fa-solid fa-droplet" style={{ fontSize: 22 }}></i>, colorClass: 'cat-blue-light' },
  { name: 'Public Facilities', icon: <i className="fa-solid fa-building" style={{ fontSize: 22 }}></i>, colorClass: 'cat-blue' },
  { name: 'Safety Hazards', icon: <i className="fa-solid fa-shield-halved" style={{ fontSize: 22 }}></i>, colorClass: 'cat-red' },
  { name: 'Environment', icon: <i className="fa-solid fa-leaf" style={{ fontSize: 22 }}></i>, colorClass: 'cat-green' },
];

const ReportCategories = () => {
  return (
    <section className="report-categories-section animate-slide-in delay-200">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">What Can You Report?</h2>
          <p className="section-subtitle">Help improve your community by reporting issues in these categories.</p>
        </div>

        <Row className="g-3">
          {categories.map((cat, idx) => (
            <Col key={idx} xs={6} md={3}>
              <div className="category-card">
                <div className={`category-icon-box ${cat.colorClass}`}>
                  {cat.icon}
                </div>
                <div className="category-name">{cat.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ReportCategories;
