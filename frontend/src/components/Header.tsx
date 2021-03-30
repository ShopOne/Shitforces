import React from 'react';
import { Button, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';

export const Header: React.FC = () => {
  let rightHeader;

  const { accountName } = useAuthentication();

  if (accountName !== null) {
    rightHeader = (
      <Nav>
        <Nav.Link as={Link} to={`/account/${accountName}`}>
          {accountName}
        </Nav.Link>
      </Nav>
    );
  } else {
    rightHeader = (
      <Nav>
        <Nav.Link as={Link} to={'/login'} className="mr-sm-2">
          Login
        </Nav.Link>
        <Button as={Link} to={'/signup'} variant="outline-light">
          Sign up
        </Button>
      </Nav>
    );
  }

  return (
    <Navbar bg="dark" variant="dark">
      <Nav className="mr-auto">
        <Nav.Link as={Link} to="/">
          <Navbar.Brand>Shitforces</Navbar.Brand>
        </Nav.Link>
      </Nav>
      {rightHeader}
    </Navbar>
  );
};
