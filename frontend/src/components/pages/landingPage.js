import React from "react";
import { Link } from "react-router-dom";
import "../../exbosHome.css";

const Landingpage = () => {
  return (
    <div className="exbos-page">
      <div className="exbos-navbar">
  <div className="logo">🚆 ExBos</div>

  <div className="nav-links">
    <Link to="/">Start</Link>
    <Link to="/home">Home</Link>
    <Link to="/privateUserProfile">Profile</Link>
    <Link to="/explore">Explore</Link>
    <Link to="/favorites">Favorites</Link>
    <Link to="/trip-history">Trip History</Link>
  </div>

  <div className="nav-actions">
    <Link to="/signup">
      <button className="signup-btn">Sign Up</button>
    </Link>

    <Link to="/login">
      <button className="login-btn">Log In</button>
    </Link>
  </div>
</div>
      <div className="exbos-main">
        <div className="left-panel">
          <div className="hero-box">
            <h1>Navigate & Explore Boston with Ease</h1>
            <p>
              Find the best transit routes, discover nearby attractions, and
              see real-time subway updates all in one place.
            </p>
          </div>

          <div className="search-box card-box">
            <input type="text" placeholder="Where are you going?" />
            <div className="location-preview">355 Congress St.</div>
          </div>

          <div className="train-card card-box">
            <p>Next Train: Red Line</p>
            <h2>3 mins</h2>
            <span>3 service alerts</span>
          </div>

          <div className="featured-box card-box">
            <div className="section-header">
              <h3>Featured Destinations</h3>
              <span>Explore</span>
            </div>

            <div className="card-grid">
              <div className="mini-card">Quincy Market</div>
              <div className="mini-card">Museum of Fine Arts</div>
              <div className="mini-card">Boston Common</div>
              <div className="mini-card">Fenway Park</div>
            </div>

            <button className="full-width-btn">Explore Attractions on Map</button>
          </div>
        </div>

        <div className="right-panel">
          <div className="map-box card-box">
            <div className="fake-map">Map Preview</div>
          </div>

          <div className="suggested-box card-box">
            <div className="section-header">
              <h3>Suggested Places</h3>
              <span>See all</span>
            </div>

            <div className="card-grid">
              <div className="mini-card">Raines Law Room</div>
              <div className="mini-card">Brattle Book Shop</div>
              <div className="mini-card">Boston Public Garden</div>
              <div className="mini-card">North End</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landingpage;