import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import problemPhoneImg from '../../assets/problem_phone_illustration.png';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Section */}
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

      {/* 2. The Problem Section */}
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

      {/* 3. Our Solution Section */}
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

      {/* 4. How Fixit Works (6 Steps) */}
      <section className="about-section">
        <Container>
          <div className="text-center mb-5">
            <div className="text-uppercase fw-bold small text-primary mb-1">Workflow</div>
            <h2 className="section-heading-title">3. How FixIt Works</h2>
          </div>

          <Row className="g-4">
            {[
              { num: '1', title: 'Submit a Report', desc: 'Report a problem with photos, location, and details in seconds.', icon: <i className="fa-solid fa-file-lines" style={{ fontSize: 24 }}></i>, class: 'icon-step-1' },
              { num: '2', title: 'Community Verifies', desc: 'Nearby community members confirm and upvote the issue.', icon: <i className="fa-solid fa-users" style={{ fontSize: 24 }}></i>, class: 'icon-step-2' },
              { num: '3', title: 'Prioritized', desc: 'Our smart system scores and prioritizes based on severity and impact.', icon: <i className="fa-solid fa-fire" style={{ fontSize: 24 }}></i>, class: 'icon-step-3' },
              { num: '4', title: 'Assigned', desc: 'The issue is assigned to the right team for action.', icon: <i className="fa-solid fa-shield" style={{ fontSize: 24 }}></i>, class: 'icon-step-4' },
              { num: '5', title: 'In Progress', desc: 'Work updates and progress are shared in real time.', icon: <i className="fa-solid fa-wrench" style={{ fontSize: 24 }}></i>, class: 'icon-step-5' },
              { num: '6', title: 'Resolved', desc: 'Community confirms resolution and the issue is closed.', icon: <i className="fa-solid fa-circle-check" style={{ fontSize: 24 }}></i>, class: 'icon-step-6' },
            ].map((step, idx) => (
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

      {/* 5. Built for Everyone */}
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

      {/* 6. What You Can Report */}
      <section className="about-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-heading-title mb-2">5. What You Can Report</h2>
          </div>

          <Row className="g-3 row-cols-2 row-cols-sm-3 row-cols-md-5 justify-content-center mb-4">
            {[
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
            ].map((cat, idx) => (
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
            Can't find your issue category? Choose "Other" and tell us more.
          </div>
        </Container>
      </section>

      {/* 7. Transparency & Accountability */}
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

          {/* 7b. Live Impact Counters */}
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

      {/* Bottom CTA Banner */}
      <section className="py-5">
        <Container>
          <div className="about-bottom-cta">
            <Row className="align-items-center gy-4">
              <Col lg={8}>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-10 rounded-circle" style={{color:"#d97706"}}>
                    <i className="fa-solid fa-users" style={{ fontSize: 32 }}></i>
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1">Your Community. Your Voice. Your Fix.</h3>
                    <p className="text-white-50 mb-0">Every report you make brings us one step closer to a better, safer, and cleaner community for all.</p>
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
    </div>
  );
};

export default AboutPage;
