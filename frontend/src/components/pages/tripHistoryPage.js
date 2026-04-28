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
const IcoChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IcoTransfer = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IcoRetake = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3"/>
  </svg>
);

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* Renders one line segment with its stops list */
const SegmentDetail = ({ segment, isLast }) => (
  <div style={{ marginBottom: isLast ? 0 : 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{
        background: segment.color, color: "white",
        borderRadius: 4, padding: "2px 9px",
        fontSize: 11, fontWeight: 700, letterSpacing: ".3px",
      }}>
        {segment.line}
      </span>
      <span style={{ fontSize: 12, color: "var(--eb-muted)" }}>
        {segment.direction} · {segment.stopCount} stop{segment.stopCount !== 1 ? "s" : ""}
      </span>
    </div>

    <div style={{ paddingLeft: 4 }}>
      {segment.stops.map((stop, i) => {
        const isFirst    = i === 0;
        const isLastStop = i === segment.stops.length - 1;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, position: "relative" }}>
            {/* Dot + vertical line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0, paddingTop: 3 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                background: isFirst || isLastStop ? segment.color : "#CBD5E1",
              }}/>
              {!isLastStop && (
                <div style={{ width: 2, flexGrow: 1, minHeight: 12, background: segment.color + "50", margin: "2px 0 0" }}/>
              )}
            </div>
            {/* Stop name + action badge */}
            <div style={{ paddingBottom: isLastStop ? 0 : 8, fontSize: 13, color: "var(--eb-text)", lineHeight: 1.4 }}>
              {stop}
              {isFirst && (
                <span style={{ marginLeft: 7, fontSize: 10, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "1px 6px", borderRadius: 10 }}>
                  Board
                </span>
              )}
              {isLastStop && !isLast && (
                <span style={{ marginLeft: 7, fontSize: 10, fontWeight: 700, color: "#D97706", background: "#FFFBEB", padding: "1px 6px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <IcoTransfer/> Transfer
                </span>
              )}
              {isLastStop && isLast && (
                <span style={{ marginLeft: 7, fontSize: 10, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", padding: "1px 6px", borderRadius: 10 }}>
                  Exit
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* One saved trip card — click to expand stops, button to retake */
const TripCard = ({ trip, onRetake }) => {
  const [open, setOpen] = useState(false);
  const recommended = trip.routes?.[0];

  return (
    <div style={{
      background: "white",
      borderRadius: "var(--eb-radius)",
      border: "1px solid var(--eb-border)",
      boxShadow: "var(--eb-shadow)",
      overflow: "hidden",
    }}>
      {/* Clickable summary header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Origin → Destination + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)" }}>
            {trip.origin.name}
          </span>
          <span style={{ color: "var(--eb-muted)", fontSize: 18 }}>→</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)" }}>
            {trip.destination.name}
          </span>
          <span style={{ marginLeft: "auto", color: "var(--eb-muted)" }}>
            <IcoChevron open={open}/>
          </span>
        </div>

        {/* Line badges + stats */}
        {recommended && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {recommended.segments.map((seg, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: seg.color + "18",
                border: `1px solid ${seg.color}40`,
                borderRadius: 20, padding: "3px 10px",
                fontSize: 12, fontWeight: 600, color: seg.color,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, display: "inline-block" }}/>
                {seg.line} Line
              </span>
            ))}
            <span style={{ fontSize: 12, color: "var(--eb-muted)", display: "flex", alignItems: "center", gap: 4 }}>
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

      {/* Expanded stops + Retake button */}
      {open && (
        <div style={{ borderTop: "1px solid var(--eb-border)", padding: "20px 24px", background: "var(--eb-bg, #F8FAFC)" }}>
          {trip.routes && trip.routes.length > 0 ? (
            <>
              {trip.routes.map((route, ri) => (
                <div key={ri} style={{ marginBottom: ri < trip.routes.length - 1 ? 28 : 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: ri === 0 ? "var(--eb-blue)" : "var(--eb-muted)",
                    textTransform: "uppercase", letterSpacing: ".6px",
                    marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {ri === 0 ? "Recommended Route" : "Alternative Route"}
                    <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 12, color: "var(--eb-muted)" }}>
                      {route.estimatedMinutes} min · {route.totalStops} stops
                      {route.transfers > 0 && ` · ${route.transfers} transfer${route.transfers > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  {route.segments.map((seg, si) => (
                    <SegmentDetail key={si} segment={seg} isLast={si === route.segments.length - 1}/>
                  ))}
                </div>
              ))}

              {/* Retake Trip */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--eb-border)" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onRetake(trip); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 20px",
                    background: "var(--eb-blue)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--eb-radius-sm)",
                    fontSize: 13, fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--eb-font)",
                  }}
                >
                  <IcoRetake/> Retake Trip
                </button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--eb-muted)", margin: 0 }}>No route details saved.</p>
          )}
        </div>
      )}
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
    if (!user) { navigate("/login"); return; }

    axios
      .get(`http://localhost:8081/api/trips?userId=${user.id}`)
      .then(({ data }) => setTrips(data.trips))
      .catch(() => setError("Could not load trip history. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleRetake = (trip) => {
    const dest   = encodeURIComponent(trip.destination.name);
    const origin = encodeURIComponent(trip.origin.name);
    navigate(`/smart-route?dest=${dest}&origin=${origin}`);
  };

  return (
    <div className="eb-page">
      <div className="sr-page-wrap" style={{ maxWidth: 680 }}>

        {/* Header */}
        <div className="sr-page-header">
          <div className="sr-header-icon"><IcoTrain/></div>
          <div>
            <h1 className="sr-page-title">Trip History</h1>
            <p className="sr-page-sub">Your saved MBTA routes, newest first. Tap a trip to see stops and details.</p>
          </div>
        </div>

        {loading && (
          <div className="sr-loading-card">
            <div className="sr-loading-spinner"/>
            <p>Loading your trips…</p>
          </div>
        )}

        {error && (
          <div className="sr-error"><strong>Error</strong> — {error}</div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="sr-empty">
            <div className="sr-empty-icon">🚇</div>
            <h3>No saved trips yet</h3>
            <p>Search for a route and hit <strong>Save Trip</strong> to see it here.</p>
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} onRetake={handleRetake}/>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TripHistoryPage;
