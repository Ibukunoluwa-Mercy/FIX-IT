import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FileText, ShieldCheck, AlertCircle, Eye, CheckSquare, ArrowRight } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Spot & Report',
    desc: 'Take a photo of the issue in your neighborhood, add a quick description and precise location.',
    iconClass: 'step-icon-orange',
    icon: <AlertCircle size={28} />
  },
  {
    number: '02',
    title: 'Community Verifies',
    desc: 'Neighbors confirm and upvote the issue, increasing its priority and visibility to local authorities.',
    iconClass: 'step-icon-blue',
    icon: <Eye size={28} />
  },
  {
    number: '03',
    title: 'Track & Resolve',
    desc: 'Watch the issue status change from submitted to in-progress, and finally marked as resolved.',
    iconClass: 'step-icon-green',
    icon: <CheckSquare size={28} />
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section text-center animate-slide-in delay-200">
      <Container>
        <h2 className="section-title">How FixIt Works</h2>
        <p className="section-subtitle mb-5">Three simple steps to make your voice heard and improve your neighborhood.</p>
        
        <Row className="g-4">
          {steps.map((step, idx) => (
            <Col key={idx} md={4}>
              <div className="step-card">
                <div className="step-number">{step.number}</div>
                <div className={`step-icon-wrapper ${step.iconClass}`}>
                  {step.icon}
                </div>
                <h4 className="step-card-title">{step.title}</h4>
                <p className="step-card-desc">{step.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default HowItWorks;
