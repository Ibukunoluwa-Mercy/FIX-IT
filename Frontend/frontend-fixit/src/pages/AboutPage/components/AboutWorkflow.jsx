import { Container, Row, Col } from 'react-bootstrap';

const steps = [
  { num: '1', title: 'Submit a Report', desc: 'Report a problem with photos, location, and details in seconds.', icon: <i className="fa-solid fa-file-lines" style={{ fontSize: 24 }}></i>, class: 'icon-step-1' },
  { num: '2', title: 'Community Verifies', desc: 'Nearby community members confirm and upvote the issue.', icon: <i className="fa-solid fa-users" style={{ fontSize: 24 }}></i>, class: 'icon-step-2' },
  { num: '3', title: 'Prioritized', desc: 'Our smart system scores and prioritizes based on severity and impact.', icon: <i className="fa-solid fa-fire" style={{ fontSize: 24 }}></i>, class: 'icon-step-3' },
  { num: '4', title: 'Assigned', desc: 'The issue is assigned to the right team for action.', icon: <i className="fa-solid fa-shield" style={{ fontSize: 24 }}></i>, class: 'icon-step-4' },
  { num: '5', title: 'In Progress', desc: 'Work updates and progress are shared in real time.', icon: <i className="fa-solid fa-wrench" style={{ fontSize: 24 }}></i>, class: 'icon-step-5' },
  { num: '6', title: 'Resolved', desc: 'Community confirms resolution and the issue is closed.', icon: <i className="fa-solid fa-circle-check" style={{ fontSize: 24 }}></i>, class: 'icon-step-6' },
];

const AboutWorkflow = () => {
  return (
    <section className="about-section">
      <Container>
        <div className="text-center mb-5">
          <div className="text-uppercase fw-bold small text-primary mb-1">Workflow</div>
          <h2 className="section-heading-title">3. How FixIt Works</h2>
        </div>

        <Row className="g-4">
          {steps.map((step, idx) => (
            <Col key={idx} lg={2} md={4} sm={6}>
              <div className="step-timeline-card">
                <div className="step-num-pill">{step.num}</div>
                <div className={`step-circle-icon ${step.class}`}>
                  {step.icon}
                </div>
                <h5 className="step-title">{step.title}</h5>
                <p className="step-desc">{step.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default AboutWorkflow;
