import { Container, Row, Col } from 'react-bootstrap';

const categories = [
  { name: 'Roads & Potholes', icon: 'fa-road' },
  { name: 'Waste', icon: 'fa-trash' },
  { name: 'Flooding', icon: 'fa-water' },
  { name: 'Drainage', icon: 'fa-network-wired' },
  { name: 'Streetlights', icon: 'fa-lightbulb' },
  { name: 'Water', icon: 'fa-tint' },
  { name: 'Public Facilities', icon: 'fa-building' },
  { name: 'Safety', icon: 'fa-triangle-exclamation' },
  { name: 'Environment', icon: 'fa-leaf' },
  { name: 'Other Issues', icon: 'fa-ellipsis' },
];

const AboutCategories = () => {
  return (
    <section className="about-section">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-heading-title mb-2">5. What You Can Report</h2>
        </div>

        <Row className="g-3 row-cols-2 row-cols-sm-3 row-cols-md-5 justify-content-center mb-4">
          {categories.map((cat, idx) => (
            <Col key={idx}>
              <div className="report-grid-card">
                <div className="report-grid-icon">
                  <i className={`fas ${cat.icon}`}></i>
                </div>
                <div className="report-grid-name">{cat.name}</div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="text-center text-muted small">
          Can&apos;t find your issue category? Choose &quot;Other&quot; and tell us more.
        </div>
      </Container>
    </section>
  );
};

export default AboutCategories;
