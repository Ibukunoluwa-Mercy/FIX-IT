import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AboutBottomCta = () => {
  return (
    <section className="py-5">
      <Container>
        <div className="about-bottom-cta">
          <Row className="align-items-center gy-4">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-white bg-opacity-10 rounded-circle" style={{ color: '#d97706' }}>
                  <i className="fa-solid fa-users" style={{ fontSize: 32 }}></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-1">Your Community. Your Voice. Your Fix.</h3>
                  <p className="text-white-50 mb-0">
                    Every report you make brings us one step closer to a better, safer, and cleaner community for all.
                  </p>
                </div>
              </div>
            </Col>
            <Col lg={4} className="d-flex justify-content-lg-end gap-2 flex-wrap">
              <Link to="/register" className="btn-crimson">
                Report a Problem <i className="fa-solid fa-arrow-up-right-from-square ms-2"></i>
              </Link>
              <Link to="/explore" className="btn-navy-outlined">
                Explore Issues <i className="fa-solid fa-eye ms-2"></i>
              </Link>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
};

export default AboutBottomCta;
