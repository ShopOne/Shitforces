import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './index.css';
import { getCookieArray } from './share-func/GetCookieArray';

export const Header: React.FC = () => {
  let rightHeader;
  const cookieArray = getCookieArray();

  if (cookieArray['_sforce_account_name']) {
    const name = cookieArray['_sforce_account_name'];
    rightHeader = (
      <div>
        <Nav.Link href={`/account/${name}`}>
          <Navbar.Brand>{name}</Navbar.Brand>
        </Nav.Link>
      </div>
    );
  } else {
    rightHeader = (
      <div>
        <Link to={'/signup'}>
          <Navbar.Brand>SignUp</Navbar.Brand>
        </Link>
        <Link to={'/login'}>
          <Navbar.Brand>Login</Navbar.Brand>
        </Link>
      </div>
    );
  }

  return (
    <Navbar bg="dark" variant="dark">
      <Nav className="mr-auto">
        <Nav.Link href="/">
          <Navbar.Brand>Shitforces</Navbar.Brand>
        </Nav.Link>
      </Nav>
      {rightHeader}
    </Navbar>
  );
};
