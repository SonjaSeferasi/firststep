import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getUserInfo from "../../utilities/decodeJwt";
import "../../exbosHome.css";

const IcoTrain = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    <path d="M7 8h10M7 12h10"/>
  </svg>
);
const IcoHistory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 1 .5 4M3 16v-5h5"/>
  </svg>
);

// Format a MongoDB date into a readable string like "Apr 8, 2026 · 3:22 PM"
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// One saved trip card
const TripCard = ({ trip }) => {
  const recommended = trip.routes?.[0];

  return (
    <div style={{
      background: "white",
      borderRadius: "var(--eb-radius)",
      border: "1px solid var(--eb-border)",
      boxShadow: "var(--eb-shadow)",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* From → To */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)" }}>
          {trip.origin.name}
        </span>
        <span style={{ color: "var(--eb-muted)", fontSize: 18 }}>→</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)" }}>
          {trip.destination.name}
        </span>
      </div>

      {/* Route summary badges */}
      {recommended && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Line color dots */}
          {recommended.segments.map((seg, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: seg.color + "18",
              border: `1px solid ${seg.color}40`,
              borderRadius: 20, padding: "3px 10px",
              fontSize: 12, fontWeight: 600, color: seg.color,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: seg.color, display: "inline-block",
              }}/>
              {seg.line} Line
            </span>
          ))}

          {/* Stats */}
          <span style={{
            fontSize: 12, color: "var(--eb-muted)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {recommended.estimatedMinutes} min · {recommended.totalStops} stops
            {recommended.transfers > 0 && ` · ${recommended.transfers} transfer${recommended.transfers > 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      {/* Saved timestamp */}
      <div style={{ fontSize: 12, color: "var(--eb-muted)", display: "flex", alignItems: "center", gap: 5 }}>
        <IcoHistory/>
        Saved {formatDate(trip.savedAt)}
      </div>
    </div>
  );
};

/* ══════════════════════════════
   TRIP HISTORY PAGE
══════════════════════════════ */
const TripHistoryPage = () => {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();

  useEffect(() => {
    const user = getUserInfo();
    // If not logged in, send to login
    if (!user) { navigate("/login"); return; }

    axios
      .get(`http://localhost:8081/api/trips?userId=${user.id}`)
      .then(({ data }) => setTrips(data.trips))
      .catch(() => setError("Could not load trip history. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="eb-page">
      <div className="sr-page-wrap" style={{ maxWidth: 680 }}>

        {/* Header */}
        <div className="sr-page-header">
          <div className="sr-header-icon"><IcoTrain/></div>
          <div>
            <h1 className="sr-page-title">Trip History</h1>
            <p className="sr-page-sub">Your saved MBTA routes, newest first.</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="sr-loading-card">
            <div className="sr-loading-spinner"/>
            <p>Loading your trips…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="sr-error"><strong>Error</strong> — {error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && trips.length === 0 && (
          <div className="sr-empty">
            <div className="sr-empty-icon">🚇</div>
            <h3>No saved trips yet</h3>
            <p>Search for a route and hit <strong>Save Trip</strong> to see it here.</p>
          </div>
        )}

        {/* Trip list */}
        {!loading && trips.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TripHistoryPage;
