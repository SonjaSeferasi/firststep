import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import "../../exbosHome.css";

const LINES = [
  { name: "Red Line",    color: "#DA291C", from: "Alewife", to: "Braintree / Ashmont", emoji: "🔴" },
  { name: "Green Line",  color: "#00843D", from: "Lechmere", to: "Heath St / Riverside", emoji: "🟢" },
  { name: "Orange Line", color: "#ED8B00", from: "Oak Grove", to: "Forest Hills", emoji: "🟠" },
  { name: "Blue Line",   color: "#003DA5", from: "Wonderland", to: "Bowdoin", emoji: "🔵" },
];

const QUICK_ACTIONS = [
  { label: "Smart Route",     icon: "🚇", desc: "Plan your trip",       to: "/smart-route" },
  { label: "Service Alerts",  icon: "🔔", desc: "Live disruptions",     to: "/alerts"      },
  { label: "Explore",         icon: "🗺️", desc: "Discover Boston",      to: "/explore"     },
  { label: "Trip History",    icon: "📋", desc: "Your past trips",      to: "/triphistory" },
];

const IcoLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const HomePage = () => {
  const [user, setUser]           = useState(null);
  const [showConfirm, setConfirm] = useState(false);
  const navigate                  = useNavigate();

  useEffect(() => {
    const info = getUserInfo();
    if (!info) navigate("/login");
    else setUser(info);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  if (!user) return null;

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : "??";

  return (
    <div className="eb-page">
      <div className="sr-page-wrap" style={{ maxWidth: 760 }}>

        {/* ── Profile Header ── */}
        <div style={{
          borderRadius: "var(--eb-radius)", overflow: "hidden",
          boxShadow: "var(--eb-shadow)", marginBottom: 20,
        }}>
          {/* Blue banner */}
          <div style={{
            background: "linear-gradient(135deg, #003DA5 0%, #1a56c4 60%, #0ea5e9 100%)",
            padding: "28px 28px 64px",
            position: "relative",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <button
                onClick={() => setConfirm(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "var(--eb-radius-sm)", padding: "7px 14px",
                  color: "white", fontFamily: "var(--eb-font)", fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                <IcoLogout /> Log Out
              </button>
            </div>
          </div>

          {/* White card below banner */}
          <div style={{ background: "white", padding: "0 28px 28px", position: "relative" }}>
            {/* Avatar */}
            <div style={{
              width: 76, height: 76, borderRadius: "50%",
              background: "var(--eb-blue)", border: "4px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "white",
              fontFamily: "var(--eb-font-h)",
              position: "relative", top: -38,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              marginBottom: -20,
            }}>
              {initials}
            </div>

            <h1 style={{ fontFamily: "var(--eb-font-h)", fontSize: 22, color: "var(--eb-text)", margin: "0 0 4px" }}>
              {user.username}
            </h1>
            {user.email && (
              <p style={{ fontSize: 13, color: "var(--eb-muted)", margin: "0 0 20px" }}>{user.email}</p>
            )}

            {/* Stats row */}
            <div style={{ display: "flex", gap: 32, borderTop: "1px solid var(--eb-border)", paddingTop: 20 }}>
              {[
                { label: "Lines",   value: "4"        },
                { label: "Zones",   value: "Boston"   },
                { label: "Status",  value: "Active"   },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--eb-text)", fontFamily: "var(--eb-font-h)" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--eb-muted)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)", marginBottom: 12 }}>
            Quick Actions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} to={a.to} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", borderRadius: "var(--eb-radius)",
                  border: "1px solid var(--eb-border)", boxShadow: "var(--eb-shadow)",
                  padding: "18px 14px", textAlign: "center", cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--eb-text)" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--eb-muted)", marginTop: 3 }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── MBTA Lines ── */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--eb-text)", marginBottom: 12 }}>
            MBTA Subway Lines
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {LINES.map(line => (
              <Link key={line.name} to={`/smart-route`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", borderRadius: "var(--eb-radius)",
                  border: "1px solid var(--eb-border)", boxShadow: "var(--eb-shadow)",
                  padding: "16px 20px", borderLeft: `4px solid ${line.color}`,
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: line.color, flexShrink: 0,
                    }}/>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--eb-text)" }}>
                      {line.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--eb-muted)", paddingLeft: 20 }}>
                    {line.from} → {line.to}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ── Logout Confirm ── */}
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
              padding: 32, maxWidth: 360, width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontFamily: "var(--eb-font-h)", fontSize: 20, color: "var(--eb-text)", margin: "0 0 8px" }}>
              Log out?
            </h2>
            <p style={{ fontSize: 14, color: "var(--eb-muted)", marginBottom: 24 }}>
              You'll need to sign in again to access your account.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  flex: 1, padding: 10, borderRadius: "var(--eb-radius-sm)",
                  border: "1px solid var(--eb-border)", background: "white",
                  fontFamily: "var(--eb-font)", fontSize: 14, cursor: "pointer", color: "var(--eb-text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: 10, borderRadius: "var(--eb-radius-sm)",
                  border: "none", background: "#EF4444", color: "white",
                  fontFamily: "var(--eb-font)", fontSize: 14, fontWeight: 600, cursor: "pointer",
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

export default HomePage;
