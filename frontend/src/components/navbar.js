import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import getUserInfo from "../utilities/decodeJwt";
import "../exbosHome.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
  }, [location]);

  const on = (path) => location.pathname === path ? "eb-on" : "";

  return (
    <nav className="eb-navbar">

      {/* ── Brand ── */}
      <Link to="/" className="eb-brand">
        <div className="eb-logo">🚌</div>
        <span className="eb-brandname">ExBos</span>
      </Link>

      {/* ── Nav Links ── */}
      <ul className="eb-navlinks">
        <li><Link to="/"                   className={on("/")}>Home</Link></li>
        <li><Link to="/explore"            className={on("/explore")}>Explore</Link></li>
        <li><Link to="/smart-route"        className={on("/smart-route")}>Smart Route</Link></li>
        <li><Link to="/favorites"          className={on("/favorites")}>Favorites</Link></li>
        <li><Link to="/triphistory"        className={on("/triphistory")}>Trip History</Link></li>
      </ul>

      {/* ── Right Actions ── */}
      <div className="eb-navright">

        {/* Notifications */}
        <Link to="/alerts" style={{ textDecoration: "none" }}>
          <button className="eb-iconbtn" title="Alerts">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="eb-notif-dot">5</span>
          </button>
        </Link>

        {user ? (
          <Link to="/privateUserProfile" style={{ textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--eb-blue)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              border: location.pathname === "/privateUserProfile" ? "2px solid #003DA5" : "2px solid transparent",
              outline: location.pathname === "/privateUserProfile" ? "2px solid #93C5FD" : "none",
            }}>
              {user.username ? user.username.slice(0, 2).toUpperCase() : "??"}
            </div>
          </Link>
        ) : (
          <>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <button className="eb-signup">Sign up</button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button className="eb-login">Log in ▾</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}