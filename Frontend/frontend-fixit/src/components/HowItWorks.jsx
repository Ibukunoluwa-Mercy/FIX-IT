import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FileText, ShieldCheck, AlertCircle, Eye, CheckSquare, ArrowRight } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    id: '01',
    title: 'Report',
    desc: 'Submit a problem with details, location and photos.',
    icon: <FileText size={28} />,
    colorClass: 'step-red',
    hasArrow: true
  },
  {
    id: '02',
    title: 'Verify',
    desc: 'Neighbors confirm the problem to validate the issue.',
    icon: <ShieldCheck size={28} />,
    colorClass: 'step-green',
    hasArrow: true
  },
  {
    id: '03',
    title: 'Prioritize',
    desc: 'Important issues rise to the top based on severity and confirmations.',
    icon: <AlertCircle size={28} />,
    colorClass: 'step-orange',
    hasArrow: true
  },
  {
    id: '04',
    title: 'Track',
    desc: 'Follow progress as our teams work to resolve it.',
    icon: <Eye size={28} />,
    colorClass: 'step-blue',
    hasArrow: true
  },
  {
    id: '05',
    title: 'Resolve',
    desc: 'Issue is fixed and the community confirms it.',
    icon: <CheckSquare size={28} />,
    colorClass: 'step-green-dark',
    hasArrow: false
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section">
      <Container>
        <div className="text-center mb-5 animate-slide-in">
          <h2 className="section-title">How Fixit Works</h2>
          <p className="section-subtitle">A simple process that turns community problems into real solutions.</p>
        </div>
        
        <div className="steps-container animate-slide-in delay-200">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="step-item">
                <div className="step-header">
                  <div className={`step-icon-box ${step.colorClass}`}>
                    {step.icon}
                  </div>
                  <div className="step-number">{step.id}</div>
                </div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
              {step.hasArrow && (
                <div className="step-arrow d-none d-lg-flex">
                  <ArrowRight size={24} className="text-muted" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
