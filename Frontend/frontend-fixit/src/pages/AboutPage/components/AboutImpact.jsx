import { Container, Row, Col } from 'react-bootstrap';

const AboutImpact = () => {
  return (
    <section className="about-section bg-white border-top border-bottom">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-heading-title">6. Transparency & Accountability</h2>
        </div>

        <Row className="g-4 mb-5">
          <Col md={3}>
            <div className="transparency-box">
              <div className="transparency-icon"><i className="fa-solid fa-eye" style={{ fontSize: 20 }}></i></div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Track Every Issue</h6>
                <p className="text-muted small mb-0">From submission to resolution. Stay informed with real-time status updates.</p>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="transparency-box">
              <div className="transparency-icon"><i className="fa-solid fa-users" style={{ fontSize: 20 }}></i></div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Community Confirmations</h6>
                <p className="text-muted small mb-0">Validate real problems. Upvotes help highlight urgent issues.</p>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="transparency-box">
              <div className="transparency-icon"><i className="fa-solid fa-camera" style={{ fontSize: 20 }}></i></div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Before & After Evidence</h6>
                <p className="text-muted small mb-0">Ensures real impact. Resolvers upload proof of work done.</p>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="transparency-box">
              <div className="transparency-icon"><i className="fa-solid fa-shield-halved" style={{ fontSize: 20 }}></i></div>
              <div>
                <h6 className="fw-bold mb-1 text-dark">Smart Priority Detection</h6>
                <p className="text-muted small mb-0">Duplicate detection algorithms focus on what matters most.</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Live Impact Counters */}
        <div className="text-center mb-4">
          <h3 className="section-heading-title" style={{ fontSize: '1.45rem' }}>7. Our Impact (Live)</h3>
        </div>

        <div className="live-impact-card">
          <Row className="gy-3 text-center text-md-start">
            <Col xs={6} md={3}>
              <div className="impact-metric-item justify-content-center justify-content-md-start">
                <div className="impact-metric-icon bg-danger-subtle text-danger">
                  <i className="fa-solid fa-file-lines" style={{ fontSize: 20 }}></i>
                </div>
                <div>
                  <div className="impact-num">12,458+</div>
                  <div className="impact-desc">Problems Reported</div>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="impact-metric-item justify-content-center justify-content-md-start">
                <div className="impact-metric-icon bg-success-subtle text-success">
                  <i className="fa-solid fa-circle-check" style={{ fontSize: 20 }}></i>
                </div>
                <div>
                  <div className="impact-num">8,374+</div>
                  <div className="impact-desc">Problems Resolved</div>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="impact-metric-item justify-content-center justify-content-md-start">
                <div className="impact-metric-icon bg-primary-subtle text-primary">
                  <i className="fa-solid fa-users" style={{ fontSize: 20 }}></i>
                </div>
                <div>
                  <div className="impact-num">24,682+</div>
                  <div className="impact-desc">Community Members</div>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="impact-metric-item justify-content-center justify-content-md-start">
                <div className="impact-metric-icon bg-warning-subtle text-warning">
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 20 }}></i>
                </div>
                <div>
                  <div className="impact-num">4,084+</div>
                  <div className="impact-desc">Active Issues</div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="text-center text-muted small mt-3">
          * Numbers update in real-time as our community grows.
        </div>
      </Container>
    </section>
  );
};

export default AboutImpact;
