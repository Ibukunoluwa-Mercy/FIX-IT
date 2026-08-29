import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './ReportCategories.css';
import { 
  AlertTriangle, 
  Trash2, 
  Waves, 
  Lightbulb, 
  Droplet, 
  Building2, 
  ShieldAlert, 
  Leaf 
} from 'lucide-react';

const categories = [
  { name: 'Roads & Potholes', icon: <AlertTriangle size={24} />, colorClass: 'cat-red' },
  { name: 'Waste & Dumping', icon: <Trash2 size={24} />, colorClass: 'cat-green' },
  { name: 'Flooding & Drainage', icon: <Waves size={24} />, colorClass: 'cat-blue' },
  { name: 'Streetlights', icon: <Lightbulb size={24} />, colorClass: 'cat-orange' },
  { name: 'Water Problems', icon: <Droplet size={24} />, colorClass: 'cat-blue-light' },
  { name: 'Public Facilities', icon: <Building2 size={24} />, colorClass: 'cat-blue' },
  { name: 'Safety Hazards', icon: <ShieldAlert size={24} />, colorClass: 'cat-red' },
  { name: 'Environment', icon: <Leaf size={24} />, colorClass: 'cat-green' },
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
