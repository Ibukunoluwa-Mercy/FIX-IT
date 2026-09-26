import { Container, Row, Col } from 'react-bootstrap';
import problemPhoneImg from '../../../assets/problem_phone_illustration.png';

const AboutProblem = () => {
  return (
    <section className="about-section">
      <Container className="animate-slide-in delay-100">
        <div className="about-section-header">
          <div className="section-num-badge badge-red">!</div>
          <h2 className="section-heading-title">1. The Problem</h2>
        </div>
        <Row className="align-items-center gy-4">
          <Col lg={7}>
            <p className="section-intro-text mb-4">
              Community problems are everywhere — potholes, flooding, waste, broken facilities, and safety hazards. But reporting them is difficult and inefficient.
            </p>
            <div className="problem-list">
              {[
                'Reports are scattered across WhatsApp, Facebook, and word-of-mouth.',
                'No easy way to know if a problem has already been reported.',
                'Lack of visibility into severity and impact.',
                'No clear tracking of who is working on it.',
                'No confirmation that the issue has been resolved.'
              ].map((text, idx) => (
                <div key={idx} className="problem-item">
                  <div className="problem-dot"></div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </Col>

          <Col lg={5} className="d-flex justify-content-center">
            <div className="problem-phone-mockup">
              <img 
                src={problemPhoneImg}
                alt="Community problem reported via mobile app" 
                className="img-fluid"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutProblem;
