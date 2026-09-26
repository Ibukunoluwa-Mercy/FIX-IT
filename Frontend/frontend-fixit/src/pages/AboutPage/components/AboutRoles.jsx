import { Container, Row, Col } from 'react-bootstrap';

const AboutRoles = () => {
  return (
    <section className="about-section bg-white border-top border-bottom">
      <Container>
        <div className="text-center mb-5">
          <div className="text-uppercase fw-bold small text-primary mb-1">Roles & Access</div>
          <h2 className="section-heading-title">4. Built for Everyone</h2>
        </div>

        <Row className="g-4">
          {/* Community Members */}
          <Col lg={4}>
            <div className="role-card">
              <div className="role-header">
                <div className="role-avatar role-community">
                  <i className="fa-solid fa-users" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h4 className="role-title text-danger">Community Members</h4>
                </div>
              </div>
              <ul className="role-features-list">
                <li><i className="fa-solid fa-check text-danger flex-shrink-0 me-2"></i> Submit reports with location & media</li>
                <li><i className="fa-solid fa-check text-danger flex-shrink-0 me-2"></i> Confirm and upvote nearby issues</li>
                <li><i className="fa-solid fa-check text-danger flex-shrink-0 me-2"></i> Comment and engage</li>
                <li><i className="fa-solid fa-check text-danger flex-shrink-0 me-2"></i> Track your reported issues</li>
              </ul>
            </div>
          </Col>

          {/* Issue Resolvers */}
          <Col lg={4}>
            <div className="role-card">
              <div className="role-header">
                <div className="role-avatar role-resolver">
                  <i className="fa-solid fa-wrench" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h4 className="role-title text-primary">Issue Resolvers</h4>
                </div>
              </div>
              <ul className="role-features-list">
                <li><i className="fa-solid fa-check text-primary flex-shrink-0 me-2"></i> Accept and view assigned issues</li>
                <li><i className="fa-solid fa-check text-primary flex-shrink-0 me-2"></i> Update progress in real-time</li>
                <li><i className="fa-solid fa-check text-primary flex-shrink-0 me-2"></i> Upload before/after evidence</li>
                <li><i className="fa-solid fa-check text-primary flex-shrink-0 me-2"></i> Close issues when resolved</li>
              </ul>
            </div>
          </Col>

          {/* Administrators */}
          <Col lg={4}>
            <div className="role-card">
              <div className="role-header">
                <div className="role-avatar role-admin">
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: 22 }}></i>
                </div>
                <div>
                  <h4 className="role-title text-success">Administrators</h4>
                </div>
              </div>
              <ul className="role-features-list">
                <li><i className="fa-solid fa-check text-success flex-shrink-0 me-2"></i> Verify and approve reports</li>
                <li><i className="fa-solid fa-check text-success flex-shrink-0 me-2"></i> Assign tasks and manage users</li>
                <li><i className="fa-solid fa-check text-success flex-shrink-0 me-2"></i> Monitor categories and content</li>
                <li><i className="fa-solid fa-check text-success flex-shrink-0 me-2"></i> Analyze metrics and impact</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutRoles;
