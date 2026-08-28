import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import logo from '../assets/fixit-logo-white.png';

const Navbar = () => {
  return (
    <BootstrapNavbar expand="lg" className="custom-navbar">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
<div style={{display:"flex",alignItems:"center"}}>          <img
            src={logo}
            height="40"
            className="d-inline-block align-top"
            alt="FixIt Logo"
          /> <h2  style={{ color: 'white' }}>Fi<span style={{color:"#F59E0B"}}>xIt</span></h2></div>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav>
            <Nav.Link as={Link} to="/" className="active">Home</Nav.Link>
            <Nav.Link as={Link} to="/explore">Explore Issues</Nav.Link>
            <Nav.Link as={Link} to="/map">Community Map</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
        <div className="d-none d-lg-block">
            {/* Empty block to balance flex layout if needed, or user profile icon later */}
             <img
                src={logo}
                height="40"
                style={{ visibility: 'hidden' }}
                alt="spacer"
              />
        </div>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
