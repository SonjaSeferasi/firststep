import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import getUserInfo from "../utilities/decodeJwt";
import "../exbosHome.css";

export default function Navbar() {
  const [user, setUser]           = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [darkMode, setDarkMode]   = useState(false);
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
  }, [location]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const [manualRes, mbtaRes] = await Promise.allSettled([
          fetch("http://localhost:8081/api/alerts").then(r => r.json()),
          fetch("http://localhost:8081/api/mbta-alerts").then(r => r.json()),
        ]);
        const manual = manualRes.status === "fulfilled" && Array.isArray(manualRes.value) ? manualRes.value.length : 0;
        const mbta   = mbtaRes.status   === "fulfilled" && Array.isArray(mbtaRes.value)   ? mbtaRes.value.length   : 0;
        setNotifCount(manual + mbta);
      } catch {
        setNotifCount(0);
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

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
        <li><Link to="/"             className={on("/")}>Home</Link></li>
        <li><Link to="/explore"      className={on("/explore")}>Explore</Link></li>
        <li><Link to="/smart-route"  className={on("/smart-route")}>Smart Route</Link></li>
        <li><Link to="/stations"     className={on("/stations")}>Stations</Link></li>
        <li><Link to="/trip-history" className={on("/trip-history")}>Trip History</Link></li>
        <li><Link to="/reviews"      className={on("/reviews")}>Reviews</Link></li>
      </ul>

      {/* ── Right Actions ── */}
      <div className="eb-navright">

        {/* Dark / Light toggle */}
        <button
          className="eb-iconbtn"
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <Link to="/alerts" style={{ textDecoration: "none" }}>
          <button className="eb-iconbtn" title="Alerts">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && <span className="eb-notif-dot">{notifCount}</span>}
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
