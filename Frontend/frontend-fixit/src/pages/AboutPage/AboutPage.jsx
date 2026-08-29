import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ExternalLink, Eye, Users, CheckCircle, AlertTriangle, 
  FileText, ShieldCheck, Wrench, Shield, Check, Flame, MessageSquare,
  Search, Droplet, Waves, Lightbulb, Building2, Leaf, MoreHorizontal, Camera
} from 'lucide-react';
import problemPhoneImg from '../../assets/problem_phone_illustration.png';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Section */}
      <section className="about-hero-section">
        <Container>
          <Row className="align-items-center gy-5">
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
                  Report a Problem <ExternalLink size={16} />
                </Link>
                <Link to="/explore" className="btn-navy-outlined">
                  Explore Issues <Eye size={16} />
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
                      <AlertTriangle size={24} />
                    </div>
                    <span className="workflow-label">Problem</span>
                  </div>
                  
                  <div className="workflow-arrow"><ArrowRight size={20} /></div>

                  <div className="workflow-node">
                    <div className="workflow-icon-box workflow-icon-action">
                      <Users size={24} />
                    </div>
                    <span className="workflow-label">Action</span>
                  </div>

                  <div className="workflow-arrow"><ArrowRight size={20} /></div>

                  <div className="workflow-node">
                    <div className="workflow-icon-box workflow-icon-resolved">
                      <CheckCircle size={24} />
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
        <Container>
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
                    <div className="lifecycle-icon bg-step-report"><FileText size={22} /></div>
                    <span className="fw-bold small">Report</span>
                  </div>
                  <ArrowRight size={18} className="text-muted" />

                  <div className="lifecycle-node">
                    <div className="lifecycle-icon bg-step-verify"><Search size={22} /></div>
                    <span className="fw-bold small">Verify</span>
                  </div>
                  <ArrowRight size={18} className="text-muted" />

                  <div className="lifecycle-node">
                    <div className="lifecycle-icon bg-step-prioritize"><AlertTriangle size={22} /></div>
                    <span className="fw-bold small">Prioritize</span>
                  </div>
                  <ArrowRight size={18} className="text-muted" />

                  <div className="lifecycle-node">
                    <div className="lifecycle-icon bg-step-track"><Wrench size={22} /></div>
                    <span className="fw-bold small">Track</span>
                  </div>
                  <ArrowRight size={18} className="text-muted" />

                  <div className="lifecycle-node">
                    <div className="lifecycle-icon bg-step-resolve"><CheckCircle size={22} /></div>
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
                <ShieldCheck size={48} className="text-primary flex-shrink-0" />
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
              { num: '1', title: 'Submit a Report', desc: 'Report a problem with photos, location, and details in seconds.', icon: <FileText size={26} />, class: 'icon-step-1' },
              { num: '2', title: 'Community Verifies', desc: 'Nearby community members confirm and upvote the issue.', icon: <Users size={26} />, class: 'icon-step-2' },
              { num: '3', title: 'Prioritized', desc: 'Our smart system scores and prioritizes based on severity and impact.', icon: <Flame size={26} />, class: 'icon-step-3' },
              { num: '4', title: 'Assigned', desc: 'The issue is assigned to the right team for action.', icon: <Shield size={26} />, class: 'icon-step-4' },
              { num: '5', title: 'In Progress', desc: 'Work updates and progress are shared in real time.', icon: <Wrench size={26} />, class: 'icon-step-5' },
              { num: '6', title: 'Resolved', desc: 'Community confirms resolution and the issue is closed.', icon: <CheckCircle size={26} />, class: 'icon-step-6' },
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
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="role-title text-danger">Community Members</h4>
                  </div>
                </div>
                <ul className="role-features-list">
                  <li><Check size={16} className="text-danger flex-shrink-0" /> Submit reports with location & media</li>
                  <li><Check size={16} className="text-danger flex-shrink-0" /> Confirm and upvote nearby issues</li>
                  <li><Check size={16} className="text-danger flex-shrink-0" /> Comment and engage</li>
                  <li><Check size={16} className="text-danger flex-shrink-0" /> Track your reported issues</li>
                </ul>
              </div>
            </Col>

            {/* Issue Resolvers */}
            <Col lg={4}>
              <div className="role-card">
                <div className="role-header">
                  <div className="role-avatar role-resolver">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h4 className="role-title text-primary">Issue Resolvers</h4>
                  </div>
                </div>
                <ul className="role-features-list">
                  <li><Check size={16} className="text-primary flex-shrink-0" /> Accept and view assigned issues</li>
                  <li><Check size={16} className="text-primary flex-shrink-0" /> Update progress in real-time</li>
                  <li><Check size={16} className="text-primary flex-shrink-0" /> Upload before/after evidence</li>
                  <li><Check size={16} className="text-primary flex-shrink-0" /> Close issues when resolved</li>
                </ul>
              </div>
            </Col>

            {/* Administrators */}
            <Col lg={4}>
              <div className="role-card">
                <div className="role-header">
                  <div className="role-avatar role-admin">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="role-title text-success">Administrators</h4>
                  </div>
                </div>
                <ul className="role-features-list">
                  <li><Check size={16} className="text-success flex-shrink-0" /> Verify and approve reports</li>
                  <li><Check size={16} className="text-success flex-shrink-0" /> Assign tasks and manage users</li>
                  <li><Check size={16} className="text-success flex-shrink-0" /> Monitor categories and content</li>
                  <li><Check size={16} className="text-success flex-shrink-0" /> Analyze metrics and impact</li>
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
              { name: 'Safety', icon: 'fa-exclamation-triangle' },
              { name: 'Environment', icon: 'fa-leaf' },
              { name: 'Other Issues', icon: 'fa-ellipsis-h' },
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
                <div className="transparency-icon"><Eye size={22} /></div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Track Every Issue</h6>
                  <p className="text-muted small mb-0">From submission to resolution. Stay informed with real-time status updates.</p>
                </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="transparency-box">
                <div className="transparency-icon"><Users size={22} /></div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Community Confirmations</h6>
                  <p className="text-muted small mb-0">Validate real problems. Upvotes help highlight urgent issues.</p>
                </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="transparency-box">
                <div className="transparency-icon"><Camera size={22} /></div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Before & After Evidence</h6>
                  <p className="text-muted small mb-0">Ensures real impact. Resolvers upload proof of work done.</p>
                </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="transparency-box">
                <div className="transparency-icon"><ShieldCheck size={22} /></div>
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
                    <FileText size={22} />
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
                    <CheckCircle size={22} />
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
                    <Users size={22} />
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
                    <AlertTriangle size={22} />
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
                  <div className="p-3 bg-white bg-opacity-10 rounded-circle text-danger">
                    <Users size={36} />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1">Your Community. Your Voice. Your Fix.</h3>
                    <p className="text-white-50 mb-0">Every report you make brings us one step closer to a better, safer, and cleaner community for all.</p>
                  </div>
                </div>
              </Col>
              <Col lg={4} className="d-flex justify-content-lg-end gap-2 flex-wrap">
                <Link to="/register" className="btn-crimson">
                  Report a Problem <ExternalLink size={16} />
                </Link>
                <Link to="/explore" className="btn-navy-outlined">
                  Explore Issues <Eye size={16} />
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
