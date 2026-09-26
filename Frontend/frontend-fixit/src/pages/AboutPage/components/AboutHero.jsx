import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AboutHero = () => {
  return (
    <section className="about-hero-section">
      <Container>
        <Row className="align-items-center gy-5 animate-slide-in">
          <Col lg={7}>
            <div className="about-hero-badge mb-2">ABOUT FIXIT</div>
            <h1 className="about-hero-title mb-3">
              Building Better Communities, Together.
            </h1>
            <p className="about-hero-desc mb-4">
              FixIt is a community-powered platform that helps citizens report problems, track progress, and drive real change. From potholes to broken streetlights, we make sure no issue is ignored and every voice counts.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/register" className="btn-crimson">
                Report a Problem <i className="fa-solid fa-arrow-up-right-from-square ms-2"></i>
              </Link>
              <Link to="/explore" className="btn-navy-outlined">
                Explore Issues <i className="fa-solid fa-eye ms-2"></i>
              </Link>
            </div>
          </Col>

          <Col lg={5}>
            <div className="text-end mb-2 text-white-50 small fw-semibold">
              From Problem to Resolution
            </div>
            <div className="hero-workflow-card">
              <div className="d-flex justify-content-between align-items-center">
                <div className="workflow-node">
                  <div className="workflow-icon-box workflow-icon-problem">
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 22 }}></i>
                  </div>
                  <span className="workflow-label">Problem</span>
                </div>
                
                <div className="workflow-arrow"><i className="fa-solid fa-arrow-right"></i></div>

                <div className="workflow-node">
                  <div className="workflow-icon-box workflow-icon-action">
                    <i className="fa-solid fa-users" style={{ fontSize: 22 }}></i>
                  </div>
                  <span className="workflow-label">Action</span>
                </div>

                <div className="workflow-arrow"><i className="fa-solid fa-arrow-right"></i></div>

                <div className="workflow-node">
                  <div className="workflow-icon-box workflow-icon-resolved">
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 22 }}></i>
                  </div>
                  <span className="workflow-label">Resolution</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutHero;
