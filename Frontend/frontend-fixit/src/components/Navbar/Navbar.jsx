import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import logo from '../../assets/fixit-logo-white.png';
import './Navbar.css';

const Navbar = () => {
  const { pathname } = useLocation();

  const links = [
    { to: '/',        label: 'Home'            },
    { to: '/explore', label: 'Explore Issues'  },
    { to: '/map',     label: 'Community Map'   },
    { to: '/about',   label: 'About'           },
  ];

  return (
    <BootstrapNavbar expand="lg" className="custom-navbar">
      <Container>
        {/* Brand / Logo */}
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img src={logo} height="40" alt="FixIt Logo" className="d-inline-block align-top" />
          <span className="navbar-brand-text">
            Fi<span style={{ color: '#F59E0B' }}>xIt</span>
          </span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="main-nav" />

        {/* Centre Links */}
        <BootstrapNavbar.Collapse id="main-nav" className="justify-content-center">
          <Nav>
            {links.map(({ to, label }) => (
              <Nav.Link
                key={to}
                as={Link}
                to={to}
                className={pathname === to ? 'active' : ''}
              >
                {label}
              </Nav.Link>
            ))}
          </Nav>
        </BootstrapNavbar.Collapse>

        {/* Right side — Report button */}
        <div className="d-none d-lg-flex align-items-center">
          <Link to="/register" className="btn btn-amber btn-sm fw-semibold px-4 py-2 rounded-3">
            Report a Problem
          </Link>
        </div>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
