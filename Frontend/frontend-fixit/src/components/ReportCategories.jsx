import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  AlertTriangle, 
  Trash2, 
  Waves, 
  Lightbulb, 
  Droplet, 
  Building2, 
  AlertOctagon, 
  Leaf 
} from 'lucide-react';

const categories = [
  { id: 1, name: 'Roads & Potholes', icon: <AlertTriangle size={24} />, bgClass: 'cat-red' },
  { id: 2, name: 'Waste & Dumping', icon: <Trash2 size={24} />, bgClass: 'cat-green' },
  { id: 3, name: 'Flooding & Drainage', icon: <Waves size={24} />, bgClass: 'cat-blue' },
  { id: 4, name: 'Streetlights', icon: <Lightbulb size={24} />, bgClass: 'cat-orange' },
  { id: 5, name: 'Water Problems', icon: <Droplet size={24} />, bgClass: 'cat-blue' },
  { id: 6, name: 'Public Facilities', icon: <Building2 size={24} />, bgClass: 'cat-blue-light' },
  { id: 7, name: 'Safety Hazards', icon: <AlertOctagon size={24} />, bgClass: 'cat-red' },
  { id: 8, name: 'Environment', icon: <Leaf size={24} />, bgClass: 'cat-green' },
];

const ReportCategories = () => {
  return (
    <section className="report-categories-section">
      <Container>
        <div className="mb-4 animate-slide-in">
          <h2 className="section-title">What Can You Report?</h2>
          <p className="section-subtitle">Help improve your community by reporting issues in these categories.</p>
        </div>
        
        <Row className="g-3 animate-slide-in delay-200">
          {categories.map((cat) => (
            <Col xs={6} md={3} key={cat.id}>
              <div className="category-card">
                <div className={`category-icon-box ${cat.bgClass}`}>
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
