import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import getUserInfo from "../utilities/decodeJwt";
import "../exbosHome.css";
 
export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();
 
  useEffect(() => {
    setUser(getUserInfo());
  }, []);
 
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
 
  const on = (path) => location.pathname === path ? "eb-on" : "";
 
  return (
    <ReactNavbar bg="dark" variant="dark">
    <Container>
      <Nav className="me-auto">
        <Nav.Link href="/">Start</Nav.Link>
        <Nav.Link href="/home">Home</Nav.Link>
        <Nav.Link href="/privateUserProfile">Profile</Nav.Link>
      </Nav>
    </Container>
  </ReactNavbar>

  );
}