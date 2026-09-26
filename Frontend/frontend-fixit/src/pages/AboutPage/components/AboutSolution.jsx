import { Container, Row, Col } from 'react-bootstrap';

const AboutSolution = () => {
  return (
    <section className="about-section bg-white border-top border-bottom">
      <Container>
        <div className="about-section-header">
          <div className="section-num-badge badge-blue">✓</div>
          <h2 className="section-heading-title">2. Our Solution</h2>
        </div>
        <p className="section-intro-text mb-4">
          FixIt provides a centralized, transparent digital ecosystem that follows a proven lifecycle:
        </p>

        <Row className="gy-4 align-items-stretch">
          <Col lg={8}>
            <div className="solution-flow-card h-100 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="lifecycle-node">
                  <div className="lifecycle-icon bg-step-report"><i className="fa-solid fa-file-lines" style={{ fontSize: 20 }}></i></div>
                  <span className="fw-bold small">Report</span>
                </div>
                <i className="fa-solid fa-arrow-right text-muted"></i>

                <div className="lifecycle-node">
                  <div className="lifecycle-icon bg-step-verify"><i className="fa-solid fa-magnifying-glass" style={{ fontSize: 20 }}></i></div>
                  <span className="fw-bold small">Verify</span>
                </div>
                <i className="fa-solid fa-arrow-right text-muted"></i>

                <div className="lifecycle-node">
                  <div className="lifecycle-icon bg-step-prioritize"><i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 20 }}></i></div>
                  <span className="fw-bold small">Prioritize</span>
                </div>
                <i className="fa-solid fa-arrow-right text-muted"></i>

                <div className="lifecycle-node">
                  <div className="lifecycle-icon bg-step-track"><i className="fa-solid fa-wrench" style={{ fontSize: 20 }}></i></div>
                  <span className="fw-bold small">Track</span>
                </div>
                <i className="fa-solid fa-arrow-right text-muted"></i>

                <div className="lifecycle-node">
                  <div className="lifecycle-icon bg-step-resolve"><i className="fa-solid fa-circle-check" style={{ fontSize: 20 }}></i></div>
                  <span className="fw-bold small">Resolve</span>
                </div>
              </div>
              <div className="text-muted small mt-4 pt-2 border-top">
                Every issue becomes a permanent digital record, ensuring accountability, transparency, and faster resolutions.
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className="solution-quote-card">
              <i className="fa-solid fa-shield-halved text-primary flex-shrink-0" style={{ fontSize: 44 }}></i>
              <div>
                <h6 className="fw-bold mb-1 text-dark">No more lost reports.</h6>
                <p className="text-muted small mb-0">No more silence. Just real action and real change.</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutSolution;
