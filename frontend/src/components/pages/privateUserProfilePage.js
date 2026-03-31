import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import "../../exbosHome.css";

const LINES = [
  { name: "Red Line",    color: "#DA291C", route: "Cambridge ↔ Braintree / Ashmont" },
  { name: "Green Line",  color: "#00843D", route: "Lechmere ↔ Heath St / Riverside" },
  { name: "Orange Line", color: "#ED8B00", route: "Oak Grove ↔ Forest Hills" },
  { name: "Blue Line",   color: "#003DA5", route: "Wonderland ↔ Bowdoin" },
];

const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IcoRoute = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/>
    <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/>
  </svg>
);
const IcoAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const PrivateUserProfile = () => {
  const [user, setUser]           = useState(null);
  const [showConfirm, setConfirm] = useState(false);
  const navigate                  = useNavigate();

  useEffect(() => {
    const info = getUserInfo();
    if (!info) navigate("/login");
    else setUser(info);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  // Initials avatar from username
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="eb-page">
      <div className="sr-page-wrap" style={{ maxWidth: 720 }}>

        {/* ── Profile Card ── */}
        <div style={{
          background: "white", borderRadius: "var(--eb-radius)",
          boxShadow: "var(--eb-shadow)", border: "1px solid var(--eb-border)",
          overflow: "hidden", marginBottom: 24,
        }}>
          {/* Header banner */}
          <div style={{
            background: "linear-gradient(135deg, #003DA5 0%, #1a56c4 50%, #0ea5e9 100%)",
            height: 100,
          }}/>

          {/* Avatar + info */}
          <div style={{ padding: "0 32px 32px", position: "relative" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--eb-blue)", border: "4px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 800, color: "white",
              fontFamily: "var(--eb-font-h)",
              position: "relative", top: -36, marginBottom: -16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}>
              {initials}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "var(--eb-font-h)", fontSize: 22, color: "var(--eb-text)", margin: "0 0 4px" }}>
                  {user.username}
                </h1>
                {user.email && (
                  <p style={{ fontSize: 14, color: "var(--eb-muted)", margin: 0 }}>{user.email}</p>
                )}
              </div>

              <button
                onClick={() => setConfirm(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: "var(--eb-radius-sm)",
                  border: "1px solid #FECACA", background: "white",
                  color: "#EF4444", fontFamily: "var(--eb-font)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <IcoLogout /> Log Out
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Link to="/smart-route" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: "var(--eb-radius)",
              border: "1px solid var(--eb-border)", boxShadow: "var(--eb-shadow)",
              padding: "20px 24px", display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "#EFF6FF", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--eb-blue)", flexShrink: 0,
              }}>
                <IcoRoute />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--eb-text)" }}>Smart Route</div>
                <div style={{ fontSize: 12, color: "var(--eb-muted)", marginTop: 2 }}>Find your next trip</div>
              </div>
            </div>
          </Link>

          <Link to="/alerts" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: "var(--eb-radius)",
              border: "1px solid var(--eb-border)", boxShadow: "var(--eb-shadow)",
              padding: "20px 24px", display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "#FFF7ED", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#ED8B00", flexShrink: 0,
              }}>
                <IcoAlert />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--eb-text)" }}>Service Alerts</div>
                <div style={{ fontSize: 12, color: "var(--eb-muted)", marginTop: 2 }}>View live disruptions</div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── MBTA Lines ── */}
        <div style={{
          background: "white", borderRadius: "var(--eb-radius)",
          border: "1px solid var(--eb-border)", boxShadow: "var(--eb-shadow)",
          padding: "24px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--eb-text)", marginBottom: 16 }}>
            MBTA Subway Lines
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LINES.map(line => (
              <div key={line.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: line.color, flexShrink: 0,
                }}/>
                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--eb-text)", minWidth: 100 }}>
                  {line.name}
                </span>
                <span style={{ fontSize: 13, color: "var(--eb-muted)" }}>{line.route}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Logout Confirm Modal ── */}
      {showConfirm && (
        <div
          onClick={() => setConfirm(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "var(--eb-radius)",
              padding: "32px", maxWidth: 380, width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontFamily: "var(--eb-font-h)", fontSize: 20, color: "var(--eb-text)", margin: "0 0 8px" }}>
              Log out?
            </h2>
            <p style={{ fontSize: 14, color: "var(--eb-muted)", marginBottom: 24 }}>
              You'll need to log back in to access your profile.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "var(--eb-radius-sm)",
                  border: "1px solid var(--eb-border)", background: "white",
                  fontFamily: "var(--eb-font)", fontSize: 14, cursor: "pointer",
                  color: "var(--eb-text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: "10px", borderRadius: "var(--eb-radius-sm)",
                  border: "none", background: "#EF4444",
                  fontFamily: "var(--eb-font)", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", color: "white",
                }}
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateUserProfile;
